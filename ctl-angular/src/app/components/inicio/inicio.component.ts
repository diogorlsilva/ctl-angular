import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {FetchDataService} from "../../services/fetch-data.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {
  ctlEmail,
  institutionMessage,
  mission,
  mobileNumber,
  NewsItem,
  NumberItem,
  PartnerItem,
  PersonItem,
  telephoneNumber
} from "../../models/data.model";
import {ModalComponent} from "../modal/modal.component";

@Component({
  selector: 'inicio',
  standalone: true,
  imports: [
    ModalComponent
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {
  fetchDataService = inject(FetchDataService);
  readonly destroyRef = inject(DestroyRef);

  newsItems: NewsItem[] = [];
  peopleItems: PersonItem[] = []
  numbersItems: NumberItem[] = [];
  partnersSrcUrs: PartnerItem[];

  currentItem: NewsItem;

  institutionMessage = institutionMessage;
  telephoneNumber = telephoneNumber;
  mobileNumber = mobileNumber;
  ctlEmail = ctlEmail;

  mission = mission;

  ngOnInit(): void {

    if (this.fetchDataService.isDataLoaded) {
      this.newsItems = this.fetchDataService.newsItems;
      this.peopleItems = this.fetchDataService.peopleItems;
      this.numbersItems = this.fetchDataService.numbersItems;
      this.partnersSrcUrs = this.fetchDataService.partnersSrcUrs;

      this.setNewsCarousel();

      return
    }


    this.fetchDataService.setReceptionData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([newsItems, peopleItems, numbersItems, partnersSrcUrs]) => {
        this.newsItems = newsItems;
        this.peopleItems = peopleItems;
        this.numbersItems = numbersItems;
        this.partnersSrcUrs = partnersSrcUrs;

        this.setNewsCarousel();
      });

  }

  private setNewsCarousel(): void {
    this.currentItem = this.newsItems[0];

    setInterval(() => {
      const currentIndex = this.newsItems.indexOf(this.currentItem);

      this.currentItem = currentIndex + 1 === this.newsItems.length ? this.newsItems[0] : this.newsItems[currentIndex + 1];
    }, 5000)
  }
}
