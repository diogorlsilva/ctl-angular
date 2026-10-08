import { Component, ElementRef, inject, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { fromEvent } from "rxjs";

// Bootstrap modal shell. Open it with data-bs-toggle="modal" data-bs-target="#<modalId>".
// The body is only rendered while the dialog is open, so embedded videos do
// not play hidden behind the page and a photo carousel restarts on every open.
@Component({
    selector: 'ctl-modal',
    imports: [NgTemplateOutlet],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss'
})
export class ModalComponent {
    @Input({ required: true }) modalId: string;
    @Input({ required: true }) contentHtml: TemplateRef<unknown>;
    @Input() modalSize?: 'xl' | 'lg';
    @Input() title = '';
    @Input() isScrollable = true;

    isOpen = false;

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        // show.bs.modal fires synchronously on the opening click, so the body
        // is in place before the first paint; hidden.bs.modal fires after the
        // fade-out, so the content stays visible through the exit animation.
        fromEvent(this.host.nativeElement, 'show.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.isOpen = true);

        fromEvent(this.host.nativeElement, 'hidden.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.isOpen = false);
    }
}
