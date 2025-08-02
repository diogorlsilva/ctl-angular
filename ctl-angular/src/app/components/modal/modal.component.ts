import { Component, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from "@angular/common";

@Component({
    selector: 'ctl-modal',
    standalone: true,
    imports: [
        NgTemplateOutlet
    ],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss'
})
export class ModalComponent {
    @Input({ required: true }) modalId: string;
    @Input() modalSize: 'xl';
    @Input() title: string;
    @Input() contentText: string;
    @Input() contentHtml: TemplateRef<HTMLElement>;
    @Input() hasFooter = false;
}
