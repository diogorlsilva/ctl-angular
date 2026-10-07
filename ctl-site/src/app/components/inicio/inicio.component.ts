import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FetchDataService } from "@services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    ctlEmail,
    institutionMessage,
    NewsItem,
    NumberItem,
    PartnerItem,
    PersonItem,
    telephoneNumber
} from "@models/data.model";
import { ModalComponent } from "../modal/modal.component";
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";
import { CtlDialogMediaComponent } from "@shared/ctl-dialog-media/ctl-dialog-media.component";

// One hero tile per service. Colours come from the club's logo and tile artwork;
// the tilt makes the tiles sit like stickers and straightens on hover.
type ServiceTile = {
    name: string;
    route: string;
    color: string;
    tilt: string;
    order: number;
    iconSrc?: string;
    icon?: string;
};

@Component({
    selector: 'ctl-inicio',
    standalone: true,
    imports: [
        RouterLink,
        ModalComponent,
        CtlSkeletonComponent,
        CtlDialogMediaComponent
    ],
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {
    newsItems: NewsItem[] = [];
    peopleItems: PersonItem[] = [];
    numbersItems: NumberItem[] = [];
    partners: PartnerItem[] = [];
    currentItem?: NewsItem;
    newsLoading = true;
    readonly newsSkeletons = Array(3);
    peopleLoading = true;
    readonly peopleSkeletons = Array(5);
    partnersLoading = true;
    readonly partnersSkeletons = Array(5);

    // Three columns, the middle one shorter so it sits half a tile lower.
    readonly serviceColumns: ServiceTile[][] = [
        [
            {
                name: 'Creche',
                route: 'creche',
                color: '#C8102E',
                tilt: '-3deg',
                order: 0,
                iconSrc: 'assets/images/creche/creche_logo.webp'
            },
            {
                name: 'CATL',
                route: 'catl',
                color: '#E8699A',
                tilt: '2deg',
                order: 3,
                iconSrc: 'assets/images/catl/catl_logo.webp'
            },
            {
                name: 'Refeições',
                route: 'refeicoes',
                color: '#4B2177',
                tilt: '-2deg',
                order: 6,
                iconSrc: 'assets/images/refeicoes/refeicoes_logo.webp'
            },
        ],
        [
            {
                name: 'AEC',
                route: 'aec',
                color: '#5CA54B',
                tilt: '3deg',
                order: 1,
                iconSrc: 'assets/images/aec/aec_logo.webp'
            },
            {
                name: 'Projetos',
                route: 'projetos',
                color: '#6B63D1',
                tilt: '-3deg',
                order: 4,
                iconSrc: 'assets/images/projetos/projetos_logo.webp'
            },
        ],
        [
            {
                name: 'Natação',
                route: 'natacao',
                color: '#2D9CDB',
                tilt: '2deg',
                order: 2,
                iconSrc: 'assets/images/natacao/natacao_logo.webp'
            },
            {
                name: 'Música',
                route: 'musica',
                color: '#F0A500',
                tilt: '-2deg',
                order: 5,
                iconSrc: 'assets/images/musica/musica_logo.webp'
            },
            {
                name: 'Explicações',
                route: 'explicacoes',
                color: '#E8701A',
                tilt: '3deg',
                order: 7,
                iconSrc: 'assets/images/explicacoes/explicacoes_logo.webp'
            },
        ],
    ];

    readonly institutionMessage = institutionMessage;
    readonly telephoneNumber = telephoneNumber;
    readonly ctlEmail = ctlEmail;

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        // Routes live after the hash; a path before it means the host served
        // index.html for an old-style link, so go back to the root.
        if (location.pathname !== "/") {
            location.pathname = "";
        }

        // Each block renders as soon as its own sheet arrives. `complete` also
        // fires when the request fails, so no skeleton sticks around.
        this.fetchDataService.getNewsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (newsItems) => this.newsItems = newsItems,
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
                next: (partners) => this.partners = partners,
                complete: () => this.partnersLoading = false
            });
    }
}
