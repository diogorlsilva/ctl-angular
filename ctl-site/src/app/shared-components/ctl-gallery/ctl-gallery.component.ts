import { Component, Input, ViewEncapsulation } from '@angular/core';
import { arrayShuffle } from "../../utils/utils.model";

@Component({
    selector: 'ctl-gallery',
    standalone: true,
    imports: [],
    templateUrl: './ctl-gallery.component.html',
    styleUrl: './ctl-gallery.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CtlGalleryComponent {
    arrayToLeft: string[];
    arrayToRight: string[];

    @Input() set imagesSRCs(array: string[]) {
        this.arrayToLeft = arrayShuffle(array);
        this.arrayToRight = arrayShuffle(array);
    }
}
