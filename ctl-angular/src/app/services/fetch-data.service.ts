import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import * as ExcelJS from 'exceljs';

import { catchError, EMPTY, firstValueFrom, forkJoin, from, map, Observable, switchMap, tap } from "rxjs";
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
import { arrayShuffle } from "../utils/utils.model";

@Injectable({ providedIn: 'root' })
export class FetchDataService {
    newsItems: NewsItem[];
    peopleItems: PersonItem[]
    numbersItems: NumberItem[];
    partnersSrcUrs: PartnerItem[];
    projectsItems: ProjectItem[];
    reportsItems: AccountReport[];
    organisationItem: OrganisationItem;

    crecheSection: SectionItem;
    catlSection: SectionItem;
    aecSection: SectionItem;
    refeicoesSection: SectionItem;
    musicaSection: SectionItem;
    natacaoSection: SectionItem
    explicacoesSection: SectionItem;

    isReceptionDataLoaded = false;
    isSectionsDataLoaded = false;

    private readonly httpClient = inject(HttpClient);


    setHomepageData() {
        return forkJoin([
            this.getNewsData(),
            this.getPeopleData(),
            this.getNumbersData(),
            this.getPartnersPhotosURLs(),
            this.getReportsData(),
            this.getOrganisationData()
        ]).pipe(tap(([newsItems, peopleItems, numbersItems, partnersSrcUrs, reportsItems, organisationItem]) => {
            this.newsItems = newsItems;
            this.peopleItems = peopleItems;
            this.numbersItems = numbersItems;
            this.partnersSrcUrs = partnersSrcUrs;
            this.reportsItems = reportsItems;
            this.organisationItem = organisationItem;

            this.isReceptionDataLoaded = true;
        }))
    }

    setSectionsData() {
        return forkJoin([
            this.getProjectsData(),
            this.getSectionData('CRECHE'),
            this.getSectionData('CATL'),
            this.getSectionData('AEC'),
            this.getSectionData('REFEICOES'),
            this.getSectionData('MUSICA'),
            this.getSectionData('NATACAO'),
            this.getSectionData('EXPLICACOES'),
        ]).pipe(
            tap(([
                     projectsItems,
                     crecheSection,
                     catlSection,
                     aecSection,
                     refeicoesSection,
                     musicaSection,
                     natacaoSection,
                     explicacoesSection
                 ]) => {
                this.projectsItems = projectsItems;
                this.crecheSection = crecheSection;
                this.catlSection = catlSection;
                this.aecSection = aecSection;
                this.refeicoesSection = refeicoesSection;
                this.musicaSection = musicaSection;
                this.natacaoSection = natacaoSection;
                this.explicacoesSection = explicacoesSection;

                this.isSectionsDataLoaded = true;
            }))
    }


    getNewsData(): Observable<NewsItem[]> {
        return this.fetchData('PAGINA_INICIAL/NOTICIAS').pipe(map((workbook) => {
            const rows = [...((workbook.model.worksheets[0] as any).rows as any[])];

            rows.shift();

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
        return this.fetchData('PAGINA_INICIAL/PESSOAS').pipe(map((workbook) => {
            const rows = [...((workbook.model.worksheets[0] as any).rows as any[])];

            rows.shift();

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
        return this.fetchData('PAGINA_INICIAL/NUMEROS').pipe(map((workbook) => {
            const rows = [...((workbook.model.worksheets[0] as any).rows as any[])];

            rows.shift();

            return rows.map((row) => {
                return {
                    description: this.parse(row.cells[0]?.value),
                    value: this.parse(row.cells[1]?.value),
                };
            })
        }))
    }

    getPartnersPhotosURLs(): Observable<PartnerItem[]> {
        return this.fetchData('PAGINA_INICIAL/PARCERIAS').pipe(map((workbook) => {
            const rows = [...((workbook.model.worksheets[0] as any).rows as any[])];

            rows.shift();

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

    getReportsData(): Observable<AccountReport[]> {
        return this.fetchData('RELATORIOS_CONTAS/INFO_RELATORIOS_CONTAS').pipe(map((workbook) => {
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
        }))
    }

    getOrganisationData(): Observable<OrganisationItem> {
        return this.fetchData('PAGINA_INICIAL/ORGAOS_SOCIAIS').pipe(map((workbook) => {
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
            const workbook = await firstValueFrom(this.fetchData(`PROJETOS/PROJETO_${projectNumber}`), { defaultValue: null });

            isDone = !workbook;
            projectNumber++;

            if (workbook) {
                workbooks.push(workbook);
            }
        }

        return workbooks
    }
}
