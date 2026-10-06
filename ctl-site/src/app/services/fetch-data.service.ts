import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import type * as ExcelJSModule from 'exceljs';

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
    SectionItem,
    Workbook
} from "@models/data.model";
import { arrayShuffle, XLSXHomepageUrl, XLSXProjectUrl } from "../utils/utils.model";

@Injectable({ providedIn: 'root' })
export class FetchDataService {
    // Each sheet is requested only once; later subscribers get the cached result.
    private readonly cache = new Map<string, Observable<any>>();

    private readonly httpClient = inject(HttpClient);

    private excelJS?: Promise<typeof ExcelJSModule>;


    getNewsData(): Observable<NewsItem[]> {
        // News must be current on every visit, so it skips the service worker
        // cache; cached() still keeps it in memory while navigating between routes.
        return this.cached(XLSXHomepageUrl.NOTICIAS, () => this.fetchDataByUrl(XLSXHomepageUrl.NOTICIAS, { alwaysFresh: true }).pipe(map((workbook) => {
            const worksheet = workbook.worksheets[0];
            const imageByRow = this.getImagesByRow(workbook);

            const news: NewsItem[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    return;
                }

                news.push({
                    title: this.parse(row.getCell(1).value),
                    description: this.parse(row.getCell(2).value),
                    photoSrc: imageByRow.get(rowNumber) ?? null
                });
            });

            return news.filter(item =>
                Object.values(item).every(value => !!value)
            );
        })))
    }

    getPeopleData(): Observable<PersonItem[]> {
        return this.cached(XLSXHomepageUrl.PESSOAS, () => this.fetchDataByUrl(XLSXHomepageUrl.PESSOAS).pipe(map((workbook) => {
            const worksheet = workbook.worksheets[0];
            const imageByRow = this.getImagesByRow(workbook);

            const people: PersonItem[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    return;
                }

                people.push({
                    name: this.parse(row.getCell(1).value),
                    description: this.parse(row.getCell(2).value),
                    photoSrc: imageByRow.get(rowNumber) ?? 'assets/images/no-photo.jpg'
                });
            });

            return people;
        })))
    }

    getNumbersData(): Observable<NumberItem[]> {
        return this.cached(XLSXHomepageUrl.NUMEROS, () => this.fetchDataByUrl(XLSXHomepageUrl.NUMEROS).pipe(map((workbook) => {
            const rows = [...((workbook.model.worksheets[0] as any).rows as any[])];

            rows.shift();

            return rows.map((row) => {
                return {
                    description: this.parse(row.cells[0]?.value),
                    value: this.parse(row.cells[1]?.value),
                };
            })
        })))
    }

    getPartnersPhotosURLs(): Observable<PartnerItem[]> {
        return this.cached(XLSXHomepageUrl.PARCERIAS, () => this.fetchDataByUrl(XLSXHomepageUrl.PARCERIAS).pipe(map((workbook) => {
            const worksheet = workbook.worksheets[0];
            const imageByRow = this.getImagesByRow(workbook);

            const partners: PartnerItem[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    return;
                }

                const photoSrc = imageByRow.get(rowNumber);

                if (photoSrc) {
                    partners.push({
                        alt: this.parse(row.getCell(1).value),
                        photoSrc
                    });
                }
            });

            return partners;
        }), map(partners => partners.sort(() => Math.random() - 0.5))));
    }

    getProjectsData(): Observable<ProjectItem[]> {
        return this.cached('PROJETOS', () => this.fetchProjectsData().pipe(map((workbooks) => {
            return workbooks.filter((workbook) => {
                const row = ((workbook.model.worksheets[0] as any).rows as any[]);

                return row[0].cells[1].value === 'SIM'
            }).map((workbook, index) => {
                const row = ((workbook.model.worksheets[0] as any).rows as any[]);

                const photoSRCs = [...this.getImagesByRow(workbook).entries()]
                    .sort(([rowA], [rowB]) => rowA - rowB)
                    .map(([, src]) => src);

                const iconSRC = photoSRCs.shift() ?? 'assets/images/no-image.jpg';

                return {
                    iconSRC,
                    photoSRCs: arrayShuffle(photoSRCs),
                    modalId: `projectModal_${index + 1}`,
                    title: this.parse(row[2]?.cells[0]?.value),
                    description: this.parse(row[2]?.cells[1]?.value),
                    videoURL: this.parse(row[2]?.cells[2]?.value),
                }
            })
        })))
    }

    getReportsData(): Observable<AccountReport[]> {
        return this.cached('RELATORIOS_CONTAS', () => this.fetchData('RELATORIOS_CONTAS/INFO_RELATORIOS_CONTAS').pipe(map((workbook) => {
            const rows = [...((workbook.model.worksheets[0] as any).rows as any[])];

            rows.shift();

            return rows.map((row) => {
                return {
                    year: this.parse(row?.cells[0]?.value),
                    balanceSheetName: this.parse(row?.cells[1]?.value),
                    balanceSheetFile: this.parse(row?.cells[2]?.value),
                    profitAndLossName: this.parse(row?.cells[3]?.value),
                    profitAndLossFile: this.parse(row?.cells[4]?.value),
                };
            }).filter(item =>
                Object.values(item).every(value => !!value)
            );
        })))
    }

    getOrganisationData(): Observable<OrganisationItem> {
        return this.cached(XLSXHomepageUrl.ORGAOS_SOCIAIS, () => this.fetchDataByUrl(XLSXHomepageUrl.ORGAOS_SOCIAIS).pipe(map((workbook) => {
            const rows = [...((workbook.model.worksheets[0] as any).rows as any[])];

            return {
                generalAssembly: [
                    { title: this.parse(rows[1]?.cells[0]?.value), name: this.parse(rows[1]?.cells[1]?.value) },
                    { title: this.parse(rows[2]?.cells[0]?.value), name: this.parse(rows[2]?.cells[1]?.value) },
                    { title: this.parse(rows[3]?.cells[0]?.value), name: this.parse(rows[3]?.cells[1]?.value) },
                ],
                direction: [
                    { title: this.parse(rows[5]?.cells[0]?.value), name: this.parse(rows[5]?.cells[1]?.value) },
                    { title: this.parse(rows[6]?.cells[0]?.value), name: this.parse(rows[6]?.cells[1]?.value) },
                    { title: this.parse(rows[7]?.cells[0]?.value), name: this.parse(rows[7]?.cells[1]?.value) },
                    { title: this.parse(rows[8]?.cells[0]?.value), name: this.parse(rows[8]?.cells[1]?.value) },
                    { title: this.parse(rows[9]?.cells[0]?.value), name: this.parse(rows[9]?.cells[1]?.value) },
                ],
                fiscalCouncil: [
                    { title: this.parse(rows[11]?.cells[0]?.value), name: this.parse(rows[11]?.cells[1]?.value) },
                    { title: this.parse(rows[12]?.cells[0]?.value), name: this.parse(rows[12]?.cells[1]?.value) },
                    { title: this.parse(rows[13]?.cells[0]?.value), name: this.parse(rows[13]?.cells[1]?.value) },
                ]
            }
        })))
    }


    getSectionDataByUrl(url: string, addVideo = false): Observable<SectionItem> {
        return this.cached(url, () => this.fetchDataByUrl(url).pipe(map((workbook) => {
            const rows = ((workbook.model.worksheets[0] as any).rows as any[]);

            const photoSRCs = workbook.worksheets[0].getImages()
                .map(image => workbook.getImage(+image.imageId))
                .filter(media => !!media?.buffer)
                .map(media => URL.createObjectURL(new Blob([media.buffer as BlobPart])));

            const bullets = (rowIndex: number): string[] => {
                const cells = [...rows[rowIndex]?.cells];

                cells.shift();

                // The page draws its own bullet marker, so a "- " or "• " typed in the sheet is dropped.
                return cells.map((cell: {
                    value: any;
                }) => this.parse(cell.value).replace(/^\s*[-–•]\s*/, '')).filter(value => !!value);
            }

            return {
                photoSRCs: arrayShuffle(photoSRCs),
                smallDescription: this.parse(rows[0]?.cells[1]?.value),
                description: this.parse(rows[1]?.cells[1]?.value),
                leftTitle: this.parse(rows[2]?.cells[1]?.value),
                leftBullets: bullets(3),
                rightTitle: this.parse(rows[4]?.cells[1]?.value),
                rightBullets: bullets(5),
                ...(addVideo && {
                    videoTitle: this.parse(rows[6]?.cells[1]?.value),
                    videoURL: this.parse(rows[7]?.cells[1]?.value),
                })
            }
        })));
    }

    private fetchData(fileName: string): Observable<Workbook> {
        return this.fetchDataByUrl(`assets/${fileName}.xlsx`);
    }

    // ExcelJS is ~1 MB, so it is downloaded on first use (in parallel with the
    // sheet request) instead of being bundled into main.js.
    private fetchDataByUrl(url: string, { alwaysFresh = false } = {}): Observable<Workbook> {
        const excelJS = this.loadExcelJS();

        // Google Sheets responses are cached stale-while-revalidate by the
        // service worker (see the google-sheets data group in ngsw-config.json).
        // `ngsw-bypass` in the URL makes the service worker ignore the request.
        const requestUrl = alwaysFresh ? `${url}${url.includes('?') ? '&' : '?'}ngsw-bypass` : url;

        return this.httpClient.get(requestUrl, {
            responseType: 'arraybuffer'
        }).pipe(
            catchError(() => EMPTY),
            switchMap((body) =>
                from(excelJS.then(ExcelJS => new ExcelJS.Workbook().xlsx.load(body)))
            ));
    }

    private loadExcelJS(): Promise<typeof ExcelJSModule> {
        this.excelJS ??= import('exceljs').then(module => (module as any).default ?? module);

        return this.excelJS;
    }


    // getImage(index) returns media in zip-entry order, unrelated to cell
    // anchors — key images by the row they are actually anchored to.
    private getImagesByRow(workbook: Workbook): Map<number, string> {
        const imageByRow = new Map<number, string>();

        for (const image of workbook.worksheets[0].getImages()) {
            const anchorRow = image.range?.tl?.nativeRow;
            const media = workbook.getImage(+image.imageId);

            if (anchorRow != null && media?.buffer) {
                imageByRow.set(anchorRow + 1, URL.createObjectURL(new Blob([media.buffer as BlobPart])));
            }
        }

        return imageByRow;
    }


    private parse(value: unknown): string {
        if (typeof value === 'string' || typeof value === 'number') {
            return value.toString().trim();
        }

        return '';
    }


    // A failed project sheet is skipped instead of hiding every project.
    private fetchProjectsData(): Observable<Workbook[]> {
        return forkJoin(
            Object.values(XLSXProjectUrl).map(url => this.fetchDataByUrl(url).pipe(defaultIfEmpty(null)))
        ).pipe(map(workbooks => workbooks.filter((workbook): workbook is Workbook => !!workbook)));
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
