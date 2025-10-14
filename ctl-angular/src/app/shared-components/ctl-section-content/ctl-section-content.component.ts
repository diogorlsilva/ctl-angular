import { Component, Input } from '@angular/core';
import { SectionItem } from "../../models/data.model";

@Component({
    selector: 'ctl-section-content',
    standalone: true,
    imports: [],
    templateUrl: './ctl-section-content.component.html',
    styleUrl: './ctl-section-content.component.scss'
})
export class CtlSectionContentComponent {
    @Input({ required: true }) section: SectionItem;
}
