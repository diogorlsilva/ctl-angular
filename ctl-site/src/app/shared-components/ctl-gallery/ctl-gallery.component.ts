import { ChangeDetectorRef, Component, ElementRef, inject, Input, OnDestroy, ViewChild } from '@angular/core';
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";
import { BootstrapCarousel } from "../../utils/bootstrap.model";

let nextId = 0;

// Photo strip the visitor scrolls sideways. A photo opens a full-screen viewer
// (a native modal <dialog>) showing one photo at a time, with arrows and dots.
// The viewer's slides are only rendered while it is open.
@Component({
    selector: 'ctl-gallery',
    imports: [CtlSkeletonComponent],
    templateUrl: './ctl-gallery.component.html',
    styleUrl: './ctl-gallery.component.scss'
})
export class CtlGalleryComponent implements OnDestroy {
    @Input() images: string[] = [];
    @Input() loading = false;

    @ViewChild('viewer') private viewer?: ElementRef<HTMLDialogElement>;
    @ViewChild('viewerCarousel') private viewerCarousel?: ElementRef<HTMLElement>;

    readonly skeletons = Array(6);
    readonly viewerId = `gallery-viewer-${++nextId}`;

    viewerIndex: number | null = null;

    private carousel?: BootstrapCarousel;
    private readonly changeDetector = inject(ChangeDetectorRef);

    openViewer(index: number): void {
        this.viewerIndex = index;
        // Render the slides now so the dialog opens on the right photo.
        this.changeDetector.detectChanges();
        this.viewer?.nativeElement.showModal();

        if (this.viewerCarousel && this.images.length > 1) {
            this.carousel = window.bootstrap?.Carousel.getOrCreateInstance(this.viewerCarousel.nativeElement, {
                interval: false,
                ride: false,
                touch: true,
                pause: false,
                keyboard: false
            });
        }
    }

    closeViewer(): void {
        this.viewer?.nativeElement.close();
    }

    // Arrow keys work wherever focus is in the viewer, not only on the carousel.
    onViewerKeydown(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') {
            this.carousel?.prev();
        } else if (event.key === 'ArrowRight') {
            this.carousel?.next();
        }
    }

    // Some sheets hold small photos; their shape lets CSS scale them up to fill
    // the screen while the rounded box still matches the photo's own edges.
    onViewerImageLoad(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.style.setProperty('--ratio', String(img.naturalWidth / img.naturalHeight));
    }

    // A click on the backdrop, outside the photo and the controls, closes it.
    onViewerClick(event: MouseEvent): void {
        if (!(event.target as Element).closest('img, button')) {
            this.closeViewer();
        }
    }

    // Fires on Escape too, which the native dialog handles by itself.
    onViewerClose(): void {
        this.disposeCarousel();
        this.viewerIndex = null;

        // The dialog has already handed focus back to the photo that opened it.
        // After Escape the browser would draw a focus ring there; hide it until
        // focus leaves, so keyboard users still continue from that photo.
        const opener = document.activeElement;
        if (opener instanceof HTMLElement && opener.classList.contains('gallery-photo')) {
            opener.classList.add('focus-returned');
            opener.addEventListener('blur', () => opener.classList.remove('focus-returned'), { once: true });
        }
    }

    ngOnDestroy(): void {
        this.disposeCarousel();
    }

    private disposeCarousel(): void {
        this.carousel?.pause();
        this.carousel?.dispose();
        this.carousel = undefined;
    }
}
