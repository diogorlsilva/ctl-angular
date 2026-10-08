import { Component, Input } from '@angular/core';
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

// Photo strip that slides by on its own in an endless loop.
@Component({
    selector: 'ctl-gallery',
    imports: [CtlSkeletonComponent],
    templateUrl: './ctl-gallery.component.html',
    styleUrl: './ctl-gallery.component.scss'
})
export class CtlGalleryComponent {
    @Input() images: string[] = [];
    @Input() loading = false;

    readonly skeletons = Array(6);
    // Loop length scales with the photo count, so the pace stays the same.
    readonly secondsPerPhoto = 6;
}
