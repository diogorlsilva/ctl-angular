import { Component, ElementRef, HostBinding, inject, QueryList, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { filter, fromEvent, Observable } from "rxjs";
import { FetchDataService } from "@services/fetch-data.service";
import { XLSXUrl } from "../../utils/utils.model";
import "../../utils/bootstrap.model";

type NavGroup = 'respostasSociais' | 'servicos' | 'projetos';


// Which accordion group each section page belongs to.
const ROUTE_GROUPS: Record<string, NavGroup> = {
    creche: 'respostasSociais',
    catl: 'respostasSociais',
    aec: 'servicos',
    refeicoes: 'servicos',
    musica: 'servicos',
    natacao: 'servicos',
    explicacoes: 'servicos',
};

@Component({
    selector: 'ctl-navbar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    isToggled = false;
    // True while the hamburger panel fades out after a close.
    isClosing = false;
    isGoingDown = false;
    // The home page gets the gradient bar; every other page a translucent one.
    isHome = true;

    // Width of the page scrollbar while a Bootstrap modal hides it. Bootstrap
    // pads the body by the same amount; the fixed bar needs its own offset.
    @HostBinding('style.--scrollbar-comp') scrollbarComp = '0px';

    @ViewChildren('groupToggle') private groupToggles!: QueryList<ElementRef<HTMLElement>>;

    private scrollY = window.scrollY;
    private closingTimer?: ReturnType<typeof setTimeout>;
    // First URL segment of the current page ('' on home).
    private currentPath = '';

    private readonly router = inject(Router);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
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
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(event => {
                this.currentPath = event.urlAfterRedirects.split(/[?#]/)[0].replace(/^\//, '').split('/')[0];
                this.isHome = this.currentPath === '';
            });

        // Any navigation (logo, browser back, in-page links) closes the menu.
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationStart),
                takeUntilDestroyed()
            )
            .subscribe(() => this.closeMenu());

        // A press anywhere outside the bar closes the menu. pointerdown covers
        // mouse and touch alike, and fires even where iOS skips click.
        fromEvent<PointerEvent>(document, 'pointerdown')
            .pipe(
                filter(() => this.isToggled),
                filter(event => !this.host.nativeElement.contains(event.target as Node)),
                takeUntilDestroyed()
            )
            .subscribe(() => this.closeMenu());

        // show.bs.modal fires before Bootstrap hides the scrollbar, so its
        // width can still be measured; hidden.bs.modal fires after it is back.
        fromEvent(document, 'show.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.scrollbarComp = `${window.innerWidth - document.documentElement.clientWidth}px`);

        fromEvent(document, 'hidden.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.scrollbarComp = '0px');

        // The bar slides away while scrolling down and returns on the way up.
        // Scrolling also dismisses every open menu, desktop dropdowns included.
        fromEvent(window, 'scroll', { passive: true })
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.closeMenu();

                // While a modal locks the page, the scroll position does not change.
                if (document.body.style.overflow === 'hidden') {
                    return;
                }

                const goingDown = window.scrollY > this.scrollY;

                // Ignore the small jitter near the top so the bar does not flicker.
                if (goingDown !== this.isGoingDown && (window.scrollY > 80 || !goingDown)) {
                    this.isGoingDown = goingDown;
                }

                this.scrollY = window.scrollY;
            });
    }

    // Opens the hamburger panel with the current page's group already
    // expanded, or closes it.
    toggleMenu(): void {
        if (this.isToggled) {
            this.closeMenu();
            return;
        }

        this.isToggled = true;
        const group = ROUTE_GROUPS[this.currentPath];
        // Bootstrap closes every open dropdown when a click reaches the
        // document, so the group is expanded only after this click has bubbled.
        setTimeout(() => this.groupToggles.forEach(toggle => {
            const dropdown = window.bootstrap?.Dropdown.getOrCreateInstance(toggle.nativeElement);
            if (toggle.nativeElement.dataset['group'] === group) {
                dropdown?.show();
            } else {
                dropdown?.hide();
            }
        }));
    }

    // Closes the panel and collapses every group, so nothing stays open
    // behind the hidden panel or in the desktop dropdowns.
    closeMenu(): void {
        if (this.isToggled) {
            // Matches the 0.15s fade-out in the stylesheet.
            this.isClosing = true;
            clearTimeout(this.closingTimer);
            this.closingTimer = setTimeout(() => this.isClosing = false, 150);
        }

        this.isToggled = false;
        this.groupToggles?.forEach(toggle => window.bootstrap?.Dropdown.getOrCreateInstance(toggle.nativeElement).hide());
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
