import { Component, Input } from '@angular/core';
import { SectionItem } from "@models/data.model";
import { NgTemplateOutlet } from "@angular/common";
import { SanitizeYouTubeUrlPipe } from "../../pipes/url-sanitizer.pipe";

// Body of an activity page: the long description, then the two bullet
// columns from the sheet. When the sheet has a video, the bullets share one
// column and the video takes the other. Empty parts are left out.
@Component({
    selector: 'ctl-section-content',
    imports: [NgTemplateOutlet, SanitizeYouTubeUrlPipe],
    templateUrl: './ctl-section-content.component.html'
})
export class CtlSectionContentComponent {
    @Input({ required: true }) section: SectionItem;

    get hasColumns(): boolean {
        const { leftTitle, leftBullets, rightTitle, rightBullets, videoURL } = this.section;

        return !!(leftTitle || leftBullets.length || rightTitle || rightBullets.length || videoURL);
    }
}
