import {Component, inject, OnInit} from '@angular/core';
import {NavbarComponent} from "./navbar/navbar.component";
import {TranslationsService} from "./services/translations.service";

import { Observable} from "rxjs";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {read} from 'xlsx';
import {AsyncPipe} from "@angular/common";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [NavbarComponent, AsyncPipe],
  standalone: true
})
export class AppComponent implements OnInit {
  translationService = inject(TranslationsService);
  httpClient = inject(HttpClient);

  photoSrc$ = new Observable();

  constructor() {
    this.translationService.initTranslations()
  }

  ngOnInit() {
    this.test().subscribe(file => {
      const reader = new FileReader();

      reader.readAsArrayBuffer(file.body as Blob);

      reader.onload = (e: any) => {
        const workbook = read(e.target.result, {type: 'base64'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        console.log(worksheet);
      };
    })
  }

  test(): Observable<HttpResponse<Blob>> {
    return this.httpClient.get('assets/SITE_DATA.xlsx', { responseType: 'blob', observe: 'response' });
  }
}
