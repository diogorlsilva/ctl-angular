import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import * as ExcelJS from 'exceljs';

import {from, map, Observable, switchMap} from "rxjs";
import {NewsItem, Workbook} from "../models/data.model";

@Injectable({providedIn: 'root'})
export class FetchDataService {
  private readonly httpClient = inject(HttpClient);


  getInicioData(): Observable<NewsItem[]> {
    return this.fetchData('INICIO').pipe(map((workbook) => {
      const rows = ((workbook.model.worksheets[0] as any).rows as any[]);

      return rows.map((row, index) => {
        return {
          id: index.toString(),
          description: row.cells[0].value as string,
          photoSrc: URL.createObjectURL(new Blob([(workbook.getImage(index).buffer as BlobPart)]))
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
}
