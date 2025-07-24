import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import * as ExcelJS from 'exceljs';

import {forkJoin, from, map, Observable, switchMap, tap} from "rxjs";
import {NewsItem, NumberItem, PartnerItem, PersonItem, Workbook} from "../models/data.model";

@Injectable({providedIn: 'root'})
export class FetchDataService {
  newsItems: NewsItem[];
  peopleItems: PersonItem[]
  numbersItems: NumberItem[];
  partnersSrcUrs: PartnerItem[];

  isDataLoaded = false;

  private readonly httpClient = inject(HttpClient);


  setReceptionData() {
    return forkJoin([
      this.getReceptionData(),
      this.getPeopleData(),
      this.getNumbersData(),
      this.getPartnersPhotosURLs()
    ]).pipe(tap(([newsItems, peopleItems, numbersItems, partnersSrcUrs]) => {
      this.newsItems = newsItems;
      this.peopleItems = peopleItems;
      this.numbersItems = numbersItems;
      this.partnersSrcUrs = partnersSrcUrs;

      this.isDataLoaded = true;
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
    }))
  }


  fetchData(fileName: string): Observable<Workbook> {
    return this.httpClient.get(`assets/${fileName}.xlsx`, {
      responseType: 'arraybuffer',
      observe: 'response'
    }).pipe(switchMap((response) =>
      from(new ExcelJS.Workbook().xlsx.load(<any>response.body)).pipe(map((workbook) => <any>workbook))
    ));
  }


  parse(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number') {
      return value.toString();
    }

    return '';
  }
}
