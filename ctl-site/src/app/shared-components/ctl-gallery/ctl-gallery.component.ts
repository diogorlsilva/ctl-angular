import { Component, Input, OnChanges, signal } from '@angular/core';
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

// Photo strip that slides by on its own in an endless loop.
@Component({
    selector: 'ctl-gallery',
    imports: [CtlSkeletonComponent],
    templateUrl: './ctl-gallery.component.html',
    styleUrl: './ctl-gallery.component.scss'
})
export class CtlGalleryComponent implements OnChanges {
    @Input() images: string[] = [];
    @Input() loading = false;

    readonly skeletons = Array(6);
    // Loop length scales with the photo count, so the pace stays the same.
    readonly secondsPerPhoto = 6;

    // The loop's -50% is measured when the animation starts, so it only
    // starts once every photo (both copies) has loaded and has its width.
    private readonly settled = signal(0);
    readonly ready = () => this.settled() >= this.images.length * 2;

    ngOnChanges(): void {
        this.settled.set(0);
    }

    onSettled(): void {
        this.settled.update(n => n + 1);
    }
}
