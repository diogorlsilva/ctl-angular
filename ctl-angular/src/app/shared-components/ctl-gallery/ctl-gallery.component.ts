import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'ctl-gallery',
    standalone: true,
    imports: [],
    templateUrl: './ctl-gallery.component.html',
    styleUrl: './ctl-gallery.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CtlGalleryComponent {
    @Input() imagesSRCs: string[] = []
}
