import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'ctl-section-message-box',
    standalone: true,
    imports: [],
    templateUrl: './ctl-section-message-box.component.html',
    styleUrl: './ctl-section-message-box.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CtlSectionMessageBoxComponent {
    @Input() iconSrc = '';
    @Input() title = '';
    @Input() messageBoxText = '';
}
