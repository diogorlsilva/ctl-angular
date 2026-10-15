import { Component, ElementRef, inject, QueryList, signal, ViewChildren } from '@angular/core';
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

// Pages without a header photo, where the bar sits on white. Matched against
// the whole path, so a news or project page matches but the Projetos list does not.
const WHITE_PAGES = [/^$/, /^contactos$/, /^noticias\/[^/]+$/, /^projetos\/[^/]+$/];

@Component({
    selector: 'ctl-navbar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    readonly isToggled = signal(false);
    // True while the hamburger panel fades out after a close.
    readonly isClosing = signal(false);
    readonly isGoingDown = signal(false);
    // The white pages get the gradient bar; the photo pages a translucent one.
    readonly isWhitePage = signal(true);

    @ViewChildren('groupToggle') private groupToggles!: QueryList<ElementRef<HTMLElement>>;

    private scrollY = window.scrollY;
    private closingTimer?: ReturnType<typeof setTimeout>;
    // First URL segment of the current page ('' on home).
    private currentPath = '';
    // Whole path of the current page, to tell a page change from a query-param change.
    private fullPath?: string;
    // Set on a page change so the router's own scroll does not count as a direction.
    private skipNextScroll = false;

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
                const path = event.urlAfterRedirects.split(/[?#]/)[0].replace(/^\//, '');

                // Every new page opens with the bar showing. The router then
                // scrolls to the top or, on back/forward, to the saved position;
                // that jump is not the user scrolling, so it must not hide the bar.
                if (path !== this.fullPath) {
                    this.fullPath = path;
                    this.isGoingDown.set(false);
                    this.skipNextScroll = true;
                }

                this.currentPath = path.split('/')[0];
                this.isWhitePage.set(WHITE_PAGES.some(page => page.test(path)));
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
                filter(() => this.isToggled()),
                filter(event => !this.host.nativeElement.contains(event.target as Node)),
                takeUntilDestroyed()
            )
            .subscribe(() => this.closeMenu());

        // While a Bootstrap modal hides the page scrollbar, Bootstrap pads the
        // body by its width; the fixed bar needs the same offset. show.bs.modal
        // fires before the scrollbar goes, so its width can still be measured;
        // hidden.bs.modal fires right as it is back. The variable is set on the
        // element directly, not through a binding, so it changes in the same
        // frame as the scrollbar and the bar does not jump sideways.
        fromEvent(document, 'show.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.setScrollbarComp(`${window.innerWidth - document.documentElement.clientWidth}px`));

        fromEvent(document, 'hidden.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.setScrollbarComp('0px'));

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

                if (this.skipNextScroll) {
                    this.skipNextScroll = false;
                    this.scrollY = window.scrollY;
                    return;
                }

                const goingDown = window.scrollY > this.scrollY;

                // Ignore the small jitter near the top so the bar does not flicker.
                if (goingDown !== this.isGoingDown() && (window.scrollY > 80 || !goingDown)) {
                    this.isGoingDown.set(goingDown);
                }

                this.scrollY = window.scrollY;
            });
    }

    private setScrollbarComp(width: string): void {
        this.host.nativeElement.style.setProperty('--scrollbar-comp', width);
    }

    // Opens the hamburger panel with the current page's group already
    // expanded, or closes it.
    toggleMenu(): void {
        if (this.isToggled()) {
            this.closeMenu();
            return;
        }

        this.isToggled.set(true);
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
        if (this.isToggled()) {
            // Matches the 0.15s fade-out in the stylesheet.
            this.isClosing.set(true);
            clearTimeout(this.closingTimer);
            this.closingTimer = setTimeout(() => this.isClosing.set(false), 150);
        }

        this.isToggled.set(false);
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
