import { Component, computed, DestroyRef, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
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
    readonly newsItems = signal<NewsItem[]>([]);
    readonly peopleItems = signal<PersonItem[]>([]);
    readonly numbersItems = signal<NumberItem[]>([]);
    readonly partners = signal<PartnerItem[]>([]);

    // A value such as "+300" or "25%" counts up to its number; anything else
    // (e.g. "1.200") is shown as typed.
    readonly numbers = computed(() => this.numbersItems().map(item => {
        const [, prefix = '', count, suffix = ''] = item.value.match(/^(\D*)(\d+)(\D*)$/) ?? [];

        return { ...item, prefix, count: count ? +count : null, suffix };
    }));
    readonly numbersCounted = signal(false);
    private readonly numbersSection = viewChild<ElementRef<HTMLElement>>('numbersSection');
    currentItem?: NewsItem;
    readonly newsLoading = signal(true);
    readonly newsSkeletons = Array(3);
    readonly peopleLoading = signal(true);
    readonly peopleSkeletons = Array(5);
    readonly partnersLoading = signal(true);
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
                color: '#F1D045',
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

    constructor() {
        // Starts the count-up the first time the section scrolls into view.
        effect((onCleanup) => {
            const section = this.numbersSection()?.nativeElement;

            if (!section || this.numbersCounted()) {
                return;
            }

            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    this.numbersCounted.set(true);
                }
            }, { threshold: 0.5 });

            observer.observe(section);
            onCleanup(() => observer.disconnect());
        });
    }

    ngOnInit(): void {
        // Each block renders as soon as its own sheet arrives. `complete` also
        // fires when the request fails, so no skeleton sticks around.
        this.fetchDataService.getNewsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (newsItems) => this.newsItems.set(newsItems),
                complete: () => this.newsLoading.set(false)
            });

        this.fetchDataService.getPeopleData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (peopleItems) => this.peopleItems.set(peopleItems),
                complete: () => this.peopleLoading.set(false)
            });

        this.fetchDataService.getNumbersData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((numbersItems) => this.numbersItems.set(numbersItems));

        this.fetchDataService.getPartnersPhotosURLs()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (partners) => this.partners.set(partners),
                complete: () => this.partnersLoading.set(false)
            });
    }
}
