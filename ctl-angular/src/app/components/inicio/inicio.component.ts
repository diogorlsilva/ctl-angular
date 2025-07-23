import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {FetchDataService} from "../../services/fetch-data.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NewsItem} from "../../models/data.model";
import {interval, switchMap} from "rxjs";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {
  fetchDataService = inject(FetchDataService);
  readonly destroyRef = inject(DestroyRef);

  newsItems: NewsItem[] = [];

  currentItem: NewsItem;

  ngOnInit(): void {
    this.fetchDataService.getInicioData().pipe(
      switchMap((newsItems: NewsItem[]) => {
        this.newsItems = newsItems;

        this.currentItem = this.newsItems[0];

        return interval(5000)
      }),

      takeUntilDestroyed(this.destroyRef)).subscribe(() => {

      const currentIndex = this.newsItems.indexOf(this.currentItem);

      this.currentItem = currentIndex + 1 === this.newsItems.length ? this.newsItems[0] : this.newsItems[currentIndex + 1];

    })
  }
}
