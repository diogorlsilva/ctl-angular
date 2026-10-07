import { Component, Input } from '@angular/core';
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

// Page title block for the activity pages: the service's sticker tile
// overlapping the photo above, the page title and a one-line lede.
// The tile is either the service artwork (iconSrc) or a coloured tile with an
// icon from the sprite in index.html (tileIcon + tileColor + tileLabel).
@Component({
    selector: 'ctl-section-message-box',
    standalone: true,
    imports: [CtlSkeletonComponent],
    templateUrl: './ctl-section-message-box.component.html',
    styleUrl: './ctl-section-message-box.component.scss'
})
export class CtlSectionMessageBoxComponent {
    @Input({ required: true }) title: string;
    @Input() iconSrc = '';
    @Input() tileIcon = '';
    @Input() tileColor = 'var(--ctl-blue)';
    @Input() tileLabel = '';
    @Input() messageBoxText = '';
    @Input() loading = false;
}
