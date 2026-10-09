import { Component, effect, ElementRef, HostListener, Input, OnDestroy, viewChild } from '@angular/core';
import { RouterLink } from "@angular/router";
import { SanitizeYouTubeUrlPipe } from "../../pipes/url-sanitizer.pipe";
import { BootstrapCarousel } from "../../utils/bootstrap.model";
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

let nextId = 0;

// Page for one news item or project: a back link, then the title and text on
// the left with a photo, a photo carousel or a YouTube video on the right.
// Stacked, media first, on narrow screens. Without a title it shows a skeleton.
@Component({
    selector: 'ctl-article',
    imports: [RouterLink, SanitizeYouTubeUrlPipe, CtlSkeletonComponent],
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
