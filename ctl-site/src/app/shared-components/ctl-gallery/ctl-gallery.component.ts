import { Component, Input } from '@angular/core';
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

// Photo strip the visitor scrolls sideways.
@Component({
    selector: 'ctl-gallery',
    standalone: true,
    imports: [CtlSkeletonComponent],
    templateUrl: './ctl-gallery.component.html',
    styleUrl: './ctl-gallery.component.scss'
})
export class CtlGalleryComponent {
    @Input() images: string[] = [];
    @Input() loading = false;

    readonly skeletons = Array(6);
}
