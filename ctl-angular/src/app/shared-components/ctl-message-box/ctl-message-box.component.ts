import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'ctl-message-box',
    standalone: true,
    imports: [],
    templateUrl: './ctl-message-box.component.html',
    styleUrl: './ctl-message-box.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CtlMessageBoxComponent {
    @Input() iconSrc = '';
    @Input() title = '';
    @Input() messageBoxText = '';
}
