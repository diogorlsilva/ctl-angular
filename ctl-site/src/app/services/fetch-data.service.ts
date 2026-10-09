import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import {
    catchError,
    defaultIfEmpty,
    EMPTY,
    finalize,
    forkJoin,
    from,
    map,
    Observable,
    shareReplay,
    switchMap,
    tap
} from "rxjs";
import {
    AccountReport,
    NewsItem,
    NumberItem,
    OrganisationItem,
    PartnerItem,
    PersonItem,
    ProjectItem,
    SectionItem
} from "@models/data.model";
import { arrayShuffle, XLSXHomepageUrl, XLSXProjectUrl } from "../utils/utils.model";
import { readFirstSheet, Sheet, SheetValue } from "../utils/xlsx-reader";

@Injectable({ providedIn: 'root' })
export class FetchDataService {
    // Each sheet is requested only once; later subscribers get the cached result.
    private readonly cache = new Map<string, Observable<any>>();

    private readonly httpClient = inject(HttpClient);

    // Sheets requested before the service worker controlled the page, so it never cached them.
    private readonly missedBySw = new Set<string>();

    constructor() {
        // On a first visit the sheets load before the service worker takes control.
        // Once it does, request them again through it so the next visit shows
        // them straight from its cache.
        navigator.serviceWorker?.addEventListener('controllerchange', () => {
            this.missedBySw.forEach(url => fetch(url).catch(() => {}));
            this.missedBySw.clear();
        });
    }


    getNewsData(): Observable<NewsItem[]> {
        // News must be current on every visit, so it skips the service worker
        // cache; cached() still keeps it in memory while navigating between routes.
        return this.cached(XLSXHomepageUrl.NOTICIAS, () => this.fetchDataByUrl(XLSXHomepageUrl.NOTICIAS, { alwaysFresh: true }).pipe(map((sheet) => {
            const imageByRow = this.getImagesByRow(sheet);

            const news: NewsItem[] = this.dataRows(sheet).map(([row, rowNumber]) => ({
                title: this.parse(row[0]),
                description: this.parse(row[1]),
                photoSrc: imageByRow.get(rowNumber) ?? null
            }));

            return news.filter(item =>
                Object.values(item).every(value => !!value)
            );
        })))
    }

    getPeopleData(): Observable<PersonItem[]> {
        return this.cached(XLSXHomepageUrl.PESSOAS, () => this.fetchDataByUrl(XLSXHomepageUrl.PESSOAS).pipe(map((sheet) => {
            const imageByRow = this.getImagesByRow(sheet);

            return this.dataRows(sheet).map(([row, rowNumber]): PersonItem => ({
                name: this.parse(row[0]),
                description: this.parse(row[1]),
                photoSrc: imageByRow.get(rowNumber) ?? 'assets/images/no-photo.jpg'
            }));
        })))
    }

    getNumbersData(): Observable<NumberItem[]> {
        return this.cached(XLSXHomepageUrl.NUMEROS, () => this.fetchDataByUrl(XLSXHomepageUrl.NUMEROS).pipe(map(({ rows }) => {
            return rows.slice(1).map((row) => {
                return {
                    description: this.parse(row[0]),
                    value: this.parse(row[1]),
                };
            })
        })))
    }

    getPartnersPhotosURLs(): Observable<PartnerItem[]> {
        return this.cached(XLSXHomepageUrl.PARCERIAS, () => this.fetchDataByUrl(XLSXHomepageUrl.PARCERIAS).pipe(map((sheet) => {
            const imageByRow = this.getImagesByRow(sheet);

            const partners: PartnerItem[] = [];

            for (const [row, rowNumber] of this.dataRows(sheet)) {
                const photoSrc = imageByRow.get(rowNumber);

                if (photoSrc) {
                    partners.push({
                        alt: this.parse(row[0]),
                        photoSrc
                    });
                }
            }

            return partners;
        }), map(partners => partners.sort(() => Math.random() - 0.5))));
    }

    getProjectsData(): Observable<ProjectItem[]> {
        return this.cached('PROJETOS', () => this.fetchProjectsData().pipe(map((sheets) => {
            return sheets.filter(({ rows }) => {
                return rows[0]?.[1] === 'SIM'
            }).map((sheet) => {
                const row = sheet.rows;

                const photoSRCs = [...this.getImagesByRow(sheet).entries()]
                    .sort(([rowA], [rowB]) => rowA - rowB)
                    .map(([, src]) => src);

                const iconSRC = photoSRCs.shift() ?? 'assets/images/no-image.jpg';

                return {
                    iconSRC,
                    photoSRCs: arrayShuffle(photoSRCs),
                    title: this.parse(row[2]?.[0]),
                    description: this.parse(row[2]?.[1]),
                    videoURL: this.parse(row[2]?.[2]),
                }
            })
        })))
    }

    getReportsData(): Observable<AccountReport[]> {
        return this.cached(XLSXHomepageUrl.RELATORIOS_CONTAS, () => this.fetchDataByUrl(XLSXHomepageUrl.RELATORIOS_CONTAS).pipe(map(({ rows }) => {
            // Row 1 holds the headers and row 2 a note for whoever edits the sheet.
            return rows.slice(2).map((row) => {
                return {
                    year: this.parse(row[0]),
                    balanceSheetName: this.parse(row[1]),
                    balanceSheetFile: this.parse(row[2]),
                    profitAndLossName: this.parse(row[3]),
                    profitAndLossFile: this.parse(row[4]),
                };
            }).filter(item =>
                Object.values(item).every(value => !!value)
            ).sort((a, b) => Number(b.year) - Number(a.year));
        })))
    }

    getOrganisationData(): Observable<OrganisationItem> {
        return this.cached(XLSXHomepageUrl.ORGAOS_SOCIAIS, () => this.fetchDataByUrl(XLSXHomepageUrl.ORGAOS_SOCIAIS).pipe(map(({ rows }) => {
            return {
                generalAssembly: [
                    { title: this.parse(rows[1]?.[0]), name: this.parse(rows[1]?.[1]) },
                    { title: this.parse(rows[2]?.[0]), name: this.parse(rows[2]?.[1]) },
                    { title: this.parse(rows[3]?.[0]), name: this.parse(rows[3]?.[1]) },
                ],
                direction: [
                    { title: this.parse(rows[5]?.[0]), name: this.parse(rows[5]?.[1]) },
                    { title: this.parse(rows[6]?.[0]), name: this.parse(rows[6]?.[1]) },
                    { title: this.parse(rows[7]?.[0]), name: this.parse(rows[7]?.[1]) },
                    { title: this.parse(rows[8]?.[0]), name: this.parse(rows[8]?.[1]) },
                    { title: this.parse(rows[9]?.[0]), name: this.parse(rows[9]?.[1]) },
                ],
                fiscalCouncil: [
                    { title: this.parse(rows[11]?.[0]), name: this.parse(rows[11]?.[1]) },
                    { title: this.parse(rows[12]?.[0]), name: this.parse(rows[12]?.[1]) },
                    { title: this.parse(rows[13]?.[0]), name: this.parse(rows[13]?.[1]) },
                ]
            }
        })))
    }


    getSectionDataByUrl(url: string, addVideo = false): Observable<SectionItem> {
        return this.cached(url, () => this.fetchDataByUrl(url).pipe(map(({ rows, images }) => {
            const photoSRCs = images.map(image => URL.createObjectURL(image.blob));

            const bullets = (rowIndex: number): string[] => {
                const cells = (rows[rowIndex] ?? []).slice(1);

                // The page draws its own bullet marker, so a "- " or "• " typed in the sheet is dropped.
                return cells.map(value => this.parse(value).replace(/^\s*[-–•]\s*/, '')).filter(value => !!value);
            }

            return {
                photoSRCs: arrayShuffle(photoSRCs),
                smallDescription: this.parse(rows[0]?.[1]),
                description: this.parse(rows[1]?.[1]),
                leftTitle: this.parse(rows[2]?.[1]),
                leftBullets: bullets(3),
                rightTitle: this.parse(rows[4]?.[1]),
                rightBullets: bullets(5),
                ...(addVideo && {
                    videoTitle: this.parse(rows[6]?.[1]),
                    videoURL: this.parse(rows[7]?.[1]),
                })
            }
        })));
    }

    private fetchDataByUrl(url: string, { alwaysFresh = false } = {}): Observable<Sheet> {
        // Google Sheets responses are cached stale-while-revalidate by the
        // service worker (see the google-sheets data group in ngsw-config.json).
        // `ngsw-bypass` in the URL makes the service worker ignore the request.
        const requestUrl = alwaysFresh ? `${url}${url.includes('?') ? '&' : '?'}ngsw-bypass` : url;

        if (!alwaysFresh && !navigator.serviceWorker?.controller) {
            this.missedBySw.add(url);
        }

        return this.httpClient.get(requestUrl, {
            responseType: 'arraybuffer'
        }).pipe(
            catchError(() => EMPTY),
            switchMap((body) => from(readFirstSheet(body)))
        );
    }


    // Images keyed by the 1-based row they are anchored to.
    private getImagesByRow(sheet: Sheet): Map<number, string> {
        return new Map(sheet.images.map(image => [image.row, URL.createObjectURL(image.blob)]));
    }

    // The rows below the header that hold at least one value, with their 1-based row number.
    private dataRows(sheet: Sheet): [SheetValue[], number][] {
        return sheet.rows
            .map((row, index): [SheetValue[], number] => [row, index + 1])
            .filter(([row, rowNumber]) => rowNumber > 1 && row.some(value => value !== null));
    }


    private parse(value: SheetValue | undefined): string {
        if (typeof value === 'string' || typeof value === 'number') {
            return value.toString().trim();
        }

        return '';
    }


    // A failed project sheet is skipped instead of hiding every project.
    private fetchProjectsData(): Observable<Sheet[]> {
        return forkJoin(
            Object.values(XLSXProjectUrl).map(url => this.fetchDataByUrl(url).pipe(defaultIfEmpty(null)))
        ).pipe(map(sheets => sheets.filter((sheet): sheet is Sheet => !!sheet)));
    }


    // Shares one request per key. If the request fails (completes without a value),
    // the entry is dropped so the next visit tries again.
    private cached<T>(key: string, factory: () => Observable<T>): Observable<T> {
        if (!this.cache.has(key)) {
            let emitted = false;

            this.cache.set(key, factory().pipe(
                tap(() => emitted = true),
                finalize(() => !emitted && this.cache.delete(key)),
                shareReplay(1)
            ));
        }

        return this.cache.get(key)!;
    }
}
