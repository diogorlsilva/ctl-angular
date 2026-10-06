import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

@Component({
    selector: 'ctl-gallery',
    standalone: true,
    imports: [CtlSkeletonComponent],
    templateUrl: './ctl-gallery.component.html',
    styleUrl: './ctl-gallery.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CtlGalleryComponent {
    images: string[] = [];
    readonly skeletons = Array(6);

    @Input() loading = false;

    @Input() set imagesSRCs(array: string[]) {
        this.images = array;
    }
}
