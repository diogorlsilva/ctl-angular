import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import * as ExcelJS from 'exceljs';

import { catchError, EMPTY, firstValueFrom, forkJoin, from, map, Observable, switchMap, tap } from "rxjs";
import {
    NewsItem,
    NumberItem,
    PartnerItem,
    PersonItem,
    ProjectItem,
    SectionItem,
    Workbook
} from "../models/data.model";
import { arrayShuffle } from "../utils/utils.model";

@Injectable({ providedIn: 'root' })
export class FetchDataService {
    newsItems: NewsItem[];
    peopleItems: PersonItem[]
    numbersItems: NumberItem[];
    partnersSrcUrs: PartnerItem[];
    projectsItems: ProjectItem[];
    crecheSection: SectionItem;

    isReceptionDataLoaded = false;
    isSectionsDataLoaded = false;

    private readonly httpClient = inject(HttpClient);


    setReceptionData() {
        return forkJoin([
            this.getReceptionData(),
            this.getPeopleData(),
            this.getNumbersData(),
            this.getPartnersPhotosURLs(),

        ]).pipe(tap(([newsItems, peopleItems, numbersItems, partnersSrcUrs]) => {
            this.newsItems = newsItems;
            this.peopleItems = peopleItems;
            this.numbersItems = numbersItems;
            this.partnersSrcUrs = partnersSrcUrs;

            this.isReceptionDataLoaded = true;
        }))
    }

    setSectionsData() {
        return forkJoin([this.getProjectsData(),
            this.getSectionData('CRECHE')
        ]).pipe(tap(([projectsItems, crecheSection]) => {
            this.projectsItems = projectsItems;
            this.crecheSection = crecheSection;

            this.isSectionsDataLoaded = true;
        }))
    }


    getReceptionData(): Observable<NewsItem[]> {
        return this.fetchData('NOTICIAS').pipe(map((workbook) => {
            const rows = ((workbook.model.worksheets[0] as any).rows as any[]);

            return rows.map((row, index) => {
                const buffer = workbook.getImage(index)?.buffer as BlobPart;

                return {
                    title: this.parse(row.cells[0]?.value),
                    description: this.parse(row.cells[1]?.value),
                    photoSrc: buffer ? URL.createObjectURL(new Blob([buffer])) : null
                };
            })
        }))
    }

    getPeopleData(): Observable<PersonItem[]> {
        return this.fetchData('PESSOAS').pipe(map((workbook) => {
            const rows = ((workbook.model.worksheets[0] as any).rows as any[]);

            return rows.map((row, index) => {
                const buffer = workbook.getImage(index)?.buffer as BlobPart;

                return {
                    name: this.parse(row.cells[0]?.value),
                    description: this.parse(row.cells[1]?.value),
                    photoSrc: buffer ? URL.createObjectURL(new Blob([buffer])) : 'assets/images/no-photo.jpg'
                };
            })
        }))
    }

    getNumbersData(): Observable<NumberItem[]> {
        return this.fetchData('NUMEROS').pipe(map((workbook) => {
            const rows = ((workbook.model.worksheets[0] as any).rows as any[]);

            return rows.map((row, index) => {
                return {
                    description: this.parse(row.cells[0]?.value),
                    value: this.parse(row.cells[1]?.value),
                };
            })
        }))
    }

    getPartnersPhotosURLs(): Observable<PartnerItem[]> {
        return this.fetchData('PARCERIAS').pipe(map((workbook) => {
            const rows = ((workbook.model.worksheets[0] as any).rows as any[]);

            return rows.map((row, index) => {
                const buffer = workbook.getImage(index)?.buffer as BlobPart;

                return {
                    alt: this.parse(row.cells[0]?.value),
                    photoSrc: URL.createObjectURL(new Blob([buffer]))
                };
            })
        }), map(partners => partners.sort(() => Math.random() - 0.5)));
    }

    getProjectsData(): Observable<ProjectItem[]> {
        return from(this.fetchProjectsData()).pipe(map((workbooks) => {
            return workbooks.map((workbook, index) => {
                const row = ((workbook.model.worksheets[0] as any).rows as any[]);

                const photoSRCs = workbook.model.media.map(media =>
                    URL.createObjectURL(new Blob([media.buffer]))
                );

                const iconSRC = photoSRCs.shift() ?? 'assets/images/no-image.jpg';

                return {
                    iconSRC,
                    photoSRCs: arrayShuffle(photoSRCs),
                    modalId: `projectModal_${index + 1}`,
                    title: this.parse(row[0]?.cells[0]?.value),
                    description: this.parse(row[0]?.cells[1]?.value),
                }
            })
        }))
    }

    getSectionData(sectionFileName: string): Observable<SectionItem> {
        return this.fetchData(sectionFileName).pipe(map((workbook) => {
            const rows = ((workbook.model.worksheets[0] as any).rows as any[]);

            const photoSRCs = workbook.model.media.map(media =>
                URL.createObjectURL(new Blob([media.buffer]))
            );

            const bullets = (rowIndex: number): string[] => {
                const cells = [...rows[rowIndex]?.cells];

                cells.shift();

                return cells.map((cell: {
                    value: any;
                }) => this.parse(cell.value));
            }

            return {
                photoSRCs: arrayShuffle(photoSRCs),
                smallDescription: this.parse(rows[0]?.cells[1]?.value),
                description: this.parse(rows[1]?.cells[1]?.value),
                leftTitle: this.parse(rows[2]?.cells[1]?.value),
                leftBullets: bullets(3),
                rightTitle: this.parse(rows[4]?.cells[1]?.value),
                rightBullets: bullets(5),
            }
        }));
    }

    private fetchData(fileName: string): Observable<Workbook> {
        return this.httpClient.get(`assets/${fileName}.xlsx`, {
            responseType: 'arraybuffer',
            observe: 'response'
        }).pipe(
            catchError(() => EMPTY),
            switchMap((response) =>
                from(new ExcelJS.Workbook().xlsx.load(<any> response.body)).pipe(map((workbook) => <any> workbook))
            ));
    }


    private parse(value: unknown): string {
        if (typeof value === 'string' || typeof value === 'number') {
            return value.toString().trim();
        }

        return '';
    }


    private async fetchProjectsData(): Promise<Workbook[]> {
        let projectNumber = 1;
        let isDone = false;


        const workbooks: Workbook[] = []

        while (!isDone) {
            const workbook = await firstValueFrom(this.fetchData(`PROJETO_${projectNumber}`), { defaultValue: null });

            isDone = !workbook;
            projectNumber++;

            if (workbook) {
                workbooks.push(workbook);
            }
        }

        return workbooks
    }
}
