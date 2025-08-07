import { Component, DestroyRef, inject, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'ctl-gallery-v2',
    standalone: true,
    imports: [],
    templateUrl: './ctl-gallery-v2.component.html',
    styleUrl: './ctl-gallery-v2.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CtlGalleryV2Component {
    photosSRCs: string[] = []

    private readonly destroyRef = inject(DestroyRef);

    @Input() set imagesSRCs(SRCs: string[]) {
        this.photosSRCs = [...SRCs];

        while (this.photosSRCs.length < 10) {
            this.photosSRCs = [...this.photosSRCs, ...SRCs];
        }
    }
}
