import { Component, Input, ViewEncapsulation } from '@angular/core';
import { arrayShuffle } from "../../utils/utils.model";
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
    arrayToLeft: string[] = [];
    arrayToRight: string[] = [];
    readonly skeletons = Array(8);

    @Input() loading = false;

    @Input() set imagesSRCs(array: string[]) {
        this.arrayToLeft = arrayShuffle(array);
        this.arrayToRight = arrayShuffle(array);
    }
}
