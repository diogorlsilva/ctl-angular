import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FetchDataService } from "@services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    AccountReport,
    address,
    ctlEmail,
    institutionMessage,
    mission,
    NewsItem,
    NumberItem,
    OrganisationItem,
    PartnerItem,
    PersonItem,
    telephoneNumber
} from "@models/data.model";
import { ModalComponent } from "../modal/modal.component";
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

@Component({
    selector: 'ctl-inicio',
    standalone: true,
    imports: [
        ModalComponent,
        CtlSkeletonComponent
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
    newsLoading = true;
    peopleLoading = true;
    readonly peopleSkeletons = Array(5);
    partnersLoading = true;
    readonly partnersSkeletons = Array(5);
    reports: AccountReport[];
    organisation: OrganisationItem;

    institutionMessage = institutionMessage;
    telephoneNumber = telephoneNumber;
    address = address;
    ctlEmail = ctlEmail;
    mission = mission;
    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);
    private interval: any;

    ngOnInit(): void {
        if (location.pathname !== "/") {
            location.pathname = "";
        }

        this.destroyRef.onDestroy(() => clearInterval(this.interval));

        // Each block renders as soon as its own sheet arrives.
        this.fetchDataService.getNewsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (newsItems) => {
                    this.newsItems = newsItems;

                    this.setNewsCarousel();
                    setTimeout(() => this.setNewsModalListeners());
                },
                // Also fires when the request fails, so the skeleton never sticks.
                complete: () => this.newsLoading = false
            });

        this.fetchDataService.getPeopleData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (peopleItems) => this.peopleItems = peopleItems,
                complete: () => this.peopleLoading = false
            });

        this.fetchDataService.getNumbersData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((numbersItems) => this.numbersItems = numbersItems);

        this.fetchDataService.getPartnersPhotosURLs()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (partnersSrcUrs) => this.partnersSrcUrs = partnersSrcUrs,
                complete: () => this.partnersLoading = false
            });

        this.fetchDataService.getReportsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((reports) => this.reports = reports);

        this.fetchDataService.getOrganisationData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((organisation) => this.organisation = organisation);
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
