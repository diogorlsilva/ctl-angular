import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'ctl-section-background',
    standalone: true,
    imports: [],
    templateUrl: './ctl-section-background.component.html',
    styleUrl: './ctl-section-background.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CtlSectionBackgroundComponent {
    @Input() backgroundUrl = 'assets/images/inicio-background.png';
}
