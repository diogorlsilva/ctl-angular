import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

@Component({
    selector: 'ctl-section-message-box',
    standalone: true,
    imports: [CtlSkeletonComponent],
    templateUrl: './ctl-section-message-box.component.html',
    styleUrl: './ctl-section-message-box.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CtlSectionMessageBoxComponent {
    @Input() iconSrc = '';
    @Input() title = '';
    @Input() messageBoxText = '';
    @Input() loading = false;
}
