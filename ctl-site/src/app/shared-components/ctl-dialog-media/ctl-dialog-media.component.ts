import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';
import { SanitizeYouTubeUrlPipe } from "../../pipes/url-sanitizer.pipe";
import { BootstrapCarousel } from "../../utils/bootstrap.model";

let nextId = 0;

// Dialog body with a text column and, when there is one, a YouTube video or a
// photo carousel beside it. Meant to live inside ctl-modal, which only renders
// its body while the dialog is open: the video stops and the carousel timer is
// cleared when this component is destroyed on close.
@Component({
    selector: 'ctl-dialog-media',
    standalone: true,
    imports: [SanitizeYouTubeUrlPipe],
    templateUrl: './ctl-dialog-media.component.html',
    styleUrl: './ctl-dialog-media.component.scss'
})
export class CtlDialogMediaComponent implements AfterViewInit, OnDestroy {
    @Input() photos: string[] = [];
    @Input() videoUrl = '';
    @Input({ required: true }) text: string;
    @Input({ required: true }) label: string;

    @ViewChild('carousel') private carousel?: ElementRef<HTMLElement>;

    readonly carouselId = `carousel-dialog-${++nextId}`;

    private instance?: BootstrapCarousel;
    private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The sheets separate paragraphs with line breaks; each non-empty line
    // becomes its own paragraph so it gets real spacing, not a bare break.
    get paragraphs(): string[] {
        return (this.text ?? '').split('\n').map(line => line.trim()).filter(Boolean);
    }

    get hasMedia(): boolean {
        return !!this.videoUrl || this.photos.length > 0;
    }

    ngAfterViewInit(): void {
        // Bootstrap only starts data-bs-ride carousels present at page load, so
        // this one is started here. Creating the instance before any click also
        // makes Bootstrap's own prev/next handlers reuse it and its config.
        if (this.carousel && this.photos.length > 1) {
            this.instance = window.bootstrap?.Carousel.getOrCreateInstance(this.carousel.nativeElement, {
                interval: 5000,
                ride: this.reducedMotion ? false : 'carousel',
                touch: true,
                pause: 'hover',
                keyboard: true
            });
        }
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
