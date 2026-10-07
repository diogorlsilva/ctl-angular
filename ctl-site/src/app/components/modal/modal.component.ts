import { Component, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from "@angular/common";

// Bootstrap modal shell. Open it with data-bs-toggle="modal" data-bs-target="#<modalId>".
@Component({
    selector: 'ctl-modal',
    standalone: true,
    imports: [NgTemplateOutlet],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent {
    @Input({ required: true }) modalId: string;
    @Input({ required: true }) contentHtml: TemplateRef<unknown>;
    @Input() modalSize?: 'xl' | 'lg';
    @Input() title = '';
    @Input() isScrollable = true;
}
