import { Component, effect, ElementRef, HostListener, inject, Input, OnDestroy, viewChild } from '@angular/core';
import { Location } from "@angular/common";
import { Router, UrlTree } from "@angular/router";
import { SanitizeYouTubeUrlPipe } from "../../pipes/url-sanitizer.pipe";
import { BootstrapCarousel } from "../../utils/bootstrap.model";
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

let nextId = 0;

// Page for one news item or project: a back link, then the title and text on
// the left with a photo, a photo carousel or a YouTube video on the right.
// Stacked, media first, on narrow screens. Without a title it shows a skeleton.
@Component({
    selector: 'ctl-article',
    imports: [SanitizeYouTubeUrlPipe, CtlSkeletonComponent],
    templateUrl: './ctl-article.component.html',
    styleUrl: './ctl-article.component.scss'
})
export class CtlArticleComponent implements OnDestroy {
    @Input() title?: string;
    @Input() text = '';
    @Input() photos: string[] = [];
    @Input() videoUrl = '';
    @Input({ required: true }) backLabel: string;
    @Input({ required: true }) backLink: string;

    private readonly router = inject(Router);
    private readonly location = inject(Location);

    // The page the visitor came from, read while the navigation here is still
    // running. Later URL changes on this page (an open dialog) do not count.
    private readonly previousPath = this.pathOf(this.router.currentNavigation()?.previousNavigation?.finalUrl);

    private readonly carousel = viewChild<ElementRef<HTMLElement>>('carousel');

    readonly carouselId = `carousel-article-${++nextId}`;

    private instance?: BootstrapCarousel;
    private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    constructor() {
        // Bootstrap only starts data-bs-ride carousels present at page load, and
        // this one appears once the sheet arrives, so it is started here. Creating
        // the instance before any click also makes Bootstrap's own prev/next
        // handlers reuse it and its config.
        effect(() => {
            const carousel = this.carousel()?.nativeElement;

            if (carousel) {
                this.instance = window.bootstrap?.Carousel.getOrCreateInstance(carousel, {
                    interval: 5000,
                    ride: this.reducedMotion ? false : 'carousel',
                    touch: true,
                    pause: 'hover',
                    keyboard: true
                });
            }
        });
    }

    // The sheets separate paragraphs with line breaks; each non-empty line
    // becomes its own paragraph so it gets real spacing, not a bare break.
    get paragraphs(): string[] {
        return (this.text ?? '').split('\n').map(line => line.trim()).filter(Boolean);
    }

    get hasMedia(): boolean {
        return !!this.videoUrl || this.photos.length > 0;
    }

    // When the visitor came from the back link's page, step back in history so
    // the router returns them to where they were; a new navigation would open
    // that page at the top. Modified clicks keep the browser's own behaviour.
    goBack(event: MouseEvent): void {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return;
        }

        event.preventDefault();

        if (this.previousPath === this.backLink) {
            this.location.back();
        } else {
            this.router.navigateByUrl(this.backLink);
        }
    }

    private pathOf(url?: UrlTree): string | undefined {
        return url && this.router.serializeUrl(url).split(/[?#]/)[0];
    }

    // Keyboard counterpart of pause-on-hover: a focused control holds the slide.
    @HostListener('focusin')
    onFocusIn(): void {
        this.instance?.pause();
    }

    @HostListener('focusout')
    onFocusOut(): void {
        if (!this.reducedMotion) {
            this.instance?.cycle();
        }
    }

    ngOnDestroy(): void {
        // dispose() alone leaves the slide interval running.
        this.instance?.pause();
        this.instance?.dispose();
    }
}
