import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FetchDataService } from "@services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
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
} from "@models/data.model";
import { ModalComponent } from "../modal/modal.component";

@Component({
    selector: 'ctl-inicio',
    standalone: true,
    imports: [
        ModalComponent
    ],
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {
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
    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);
    private interval: any;

    ngOnInit(): void {
        if (location.pathname !== "/") {
            location.pathname = "";
        }


        if (this.fetchDataService.isReceptionDataLoaded) {
            this.newsItems = this.fetchDataService.newsItems;
            this.peopleItems = this.fetchDataService.peopleItems;
            this.numbersItems = this.fetchDataService.numbersItems;
            this.partnersSrcUrs = this.fetchDataService.partnersSrcUrs;

            this.setNewsCarousel();
            setTimeout(() => this.setNewsModalListeners());

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
                setTimeout(() => this.setNewsModalListeners());
            });

    }

    private setNewsCarousel(): void {
        if (!this.currentItem) {
            this.currentItem = this.newsItems[0];
        }


        this.interval = setInterval(() => {
            const currentIndex = this.newsItems.indexOf(this.currentItem);

            this.currentItem = currentIndex + 1 === this.newsItems.length ? this.newsItems[0] : this.newsItems[currentIndex + 1];
        }, 5000)
    }

    private setNewsModalListeners(): void {
        const modalElement = document.getElementById('news') as HTMLElement;

        modalElement.addEventListener('shown.bs.modal', () => clearInterval(this.interval));
        modalElement.addEventListener('hidden.bs.modal', () => this.setNewsCarousel());
    }
}
