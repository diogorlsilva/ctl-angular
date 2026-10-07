import { Component, HostBinding, inject } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { filter, fromEvent, Observable } from "rxjs";
import { FetchDataService } from "@services/fetch-data.service";
import { XLSXUrl } from "../../utils/utils.model";

type NavGroup = 'respostasSociais' | 'servicos' | 'projetos';

@Component({
    selector: 'ctl-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    isToggled = false;
    isGoingDown = false;
    // The home page gets the gradient bar; every other page a translucent one.
    isHome = true;

    // Width of the page scrollbar while a Bootstrap modal hides it. Bootstrap
    // pads the body by the same amount; the fixed bar needs its own offset.
    @HostBinding('style.--scrollbar-comp') scrollbarComp = '0px';

    private scrollY = window.scrollY;

    private readonly router = inject(Router);
    private readonly fetchDataService = inject(FetchDataService);
    private readonly prefetched = new Set<NavGroup>();

    // The sections each menu leads to. Arguments must match the ones the
    // section components use, so they hit the same cache entry.
    private readonly groupSections: Record<NavGroup, (() => Observable<unknown>)[]> = {
        respostasSociais: [
            () => this.fetchDataService.getSectionDataByUrl(XLSXUrl.CRECHE, true),
            () => this.fetchDataService.getSectionDataByUrl(XLSXUrl.CATL),
        ],
        servicos: [
            () => this.fetchDataService.getSectionDataByUrl(XLSXUrl.AEC),
            () => this.fetchDataService.getSectionDataByUrl(XLSXUrl.REFEICOES),
            () => this.fetchDataService.getSectionDataByUrl(XLSXUrl.MUSICA),
            () => this.fetchDataService.getSectionDataByUrl(XLSXUrl.NATACAO),
            () => this.fetchDataService.getSectionDataByUrl(XLSXUrl.EXPLICACOES),
        ],
        projetos: [
            () => this.fetchDataService.getProjectsData(),
        ],
    };

    constructor() {

        this.scrollY = window.scrollY;

        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(event => this.isHome = event.urlAfterRedirects.split(/[?#]/)[0] === '/');

        // show.bs.modal fires before Bootstrap hides the scrollbar, so its
        // width can still be measured; hidden.bs.modal fires after it is back.
        fromEvent(document, 'show.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.scrollbarComp = `${window.innerWidth - document.documentElement.clientWidth}px`);

        fromEvent(document, 'hidden.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.scrollbarComp = '0px');

        window.addEventListener('scroll', (e) => {
            e.stopPropagation()

            if (document.body.style.overflow === 'hidden') {
                return;
            }

            this.isGoingDown = window.scrollY >= this.scrollY;
            this.scrollY = window.scrollY;
        })
    }

    // Starts loading a menu's sheets when the user points at it, so the page
    // is usually ready by the time they click. Results stay in the service cache.
    prefetch(group: NavGroup): void {
        if (this.prefetched.has(group)) {
            return;
        }

        this.prefetched.add(group);
        this.groupSections[group].forEach(load => load().subscribe());
    }
}
