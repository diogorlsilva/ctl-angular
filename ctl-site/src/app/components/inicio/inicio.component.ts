import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
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

// One hero tile per service. Colours come from the club's logo and tile artwork;
// the tilt makes the tiles sit like stickers and straightens on hover.
type ServiceTile = {
    name: string;
    route: string;
    color: string;
    tilt: string;
    order: number;
    iconSrc?: string;
    faIcon?: string;
};

@Component({
    selector: 'ctl-inicio',
    standalone: true,
    imports: [
        RouterLink,
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
    currentItem: NewsItem | undefined;
    newsLoading = true;
    readonly newsSkeletons = Array(3);
    peopleLoading = true;
    readonly peopleSkeletons = Array(5);
    partnersLoading = true;
    readonly partnersSkeletons = Array(5);
    reports: AccountReport[];
    organisation: OrganisationItem;

    // Three columns, the middle one shorter so it sits half a tile lower.
    readonly serviceColumns: ServiceTile[][] = [
        [
            {
                name: 'Creche',
                route: 'creche',
                color: '#C8102E',
                tilt: '-3deg',
                order: 0,
                iconSrc: 'assets/images/creche/creche_logo.png'
            },
            {
                name: 'CATL',
                route: 'catl',
                color: '#E8699A',
                tilt: '2deg',
                order: 3,
                iconSrc: 'assets/images/catl/catl_logo.png'
            },
            {
                name: 'Refeições',
                route: 'refeicoes',
                color: '#4B2177',
                tilt: '-2deg',
                order: 6,
                iconSrc: 'assets/images/refeicoes/refeicoes_logo.png'
            },
        ],
        [
            {
                name: 'AEC',
                route: 'aec',
                color: '#5CA54B',
                tilt: '3deg',
                order: 1,
                iconSrc: 'assets/images/aec/aec_logo.png'
            },
            {
                name: 'Projetos',
                route: 'projetos',
                color: '#6B63D1',
                tilt: '-3deg',
                order: 4,
                faIcon: 'fa-people-group'
            },
        ],
        [
            {
                name: 'Natação',
                route: 'natacao',
                color: '#2D9CDB',
                tilt: '2deg',
                order: 2,
                iconSrc: 'assets/images/natacao/natacao_logo.jpg'
            },
            {
                name: 'Música',
                route: 'musica',
                color: '#F0A500',
                tilt: '-2deg',
                order: 5,
                iconSrc: 'assets/images/musica/musica_logo.png'
            },
            {
                name: 'Explicações',
                route: 'explicacoes',
                color: '#E8701A',
                tilt: '3deg',
                order: 7,
                iconSrc: 'assets/images/explicacoes/explicacoes_logo.png'
            },
        ],
    ];

    institutionMessage = institutionMessage;
    telephoneNumber = telephoneNumber;
    address = address;
    ctlEmail = ctlEmail;
    mission = mission;
    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        if (location.pathname !== "/") {
            location.pathname = "";
        }

        // Each block renders as soon as its own sheet arrives.
        this.fetchDataService.getNewsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (newsItems) => this.newsItems = newsItems,
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
}
