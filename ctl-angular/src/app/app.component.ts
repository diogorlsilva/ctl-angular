import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {NavbarComponent} from "./navbar/navbar.component";

import * as ExcelJS from 'exceljs';
import {Workbook} from "./models/data.model";
import {FetchDataService} from "./services/fetch-data.service";
import {forkJoin} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'ctl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [NavbarComponent, RouterOutlet],
  standalone: true
})
export class AppComponent implements OnInit {
  fetchDataService = inject(FetchDataService);

  projectWorkbookData = new ExcelJS.Workbook();

  photoSrc = '';

  readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    forkJoin([
      this.fetchDataService.fetchData('PROJETOS'),
    ]).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(([projectWorkbookData]) => {
    })
  }

  setImage(projectWorkbookData: Workbook): void {
    const buffer = projectWorkbookData.getImage(0).buffer as BlobPart;

    this.photoSrc = URL.createObjectURL(new Blob([buffer]));
  }
}
