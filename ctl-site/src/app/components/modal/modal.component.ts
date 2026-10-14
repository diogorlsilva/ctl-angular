import { Component, ElementRef, inject, Input, signal, TemplateRef } from '@angular/core';
import { Location, NgTemplateOutlet } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, UrlTree } from "@angular/router";
import { filter, fromEvent } from "rxjs";
import "../../utils/bootstrap.model";

// Query parameter that names the open dialog (/contactos?dialog=privacy).
const DIALOG_PARAM = 'dialog';

// Bootstrap modal shell. Open it with data-bs-toggle="modal" data-bs-target="#<modalId>".
// The body is only rendered while the dialog is open, so embedded videos do
// not play hidden behind the page and a photo carousel restarts on every open.
// An open dialog is part of the URL: the link can be shared, and the browser's
// Back and Forward buttons close and reopen it.
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

    readonly isOpen = signal(false);

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly router = inject(Router);
    private readonly location = inject(Location);

    // Opening the dialog here added its URL to the history, so closing it can
    // step back to the page. A shared link has no such entry to go back to.
    private hasOwnHistoryEntry = false;

    constructor() {
        // show.bs.modal fires synchronously on the opening click, so the body
        // is in place before the first paint; hidden.bs.modal fires after the
        // fade-out, so the content stays visible through the exit animation.
        fromEvent(this.host.nativeElement, 'show.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.isOpen.set(true);

                if (!this.isInUrl()) {
                    this.setUrlParam(this.modalId, false);
                    this.hasOwnHistoryEntry = true;
                }
            });

        fromEvent(this.host.nativeElement, 'hidden.bs.modal')
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.isOpen.set(false);

                if (this.isInUrl()) {
                    if (this.hasOwnHistoryEntry) {
                        this.location.back();
                    } else {
                        this.setUrlParam(null, true);
                    }
                }

                this.hasOwnHistoryEntry = false;
            });

        // Back, Forward or a shared link: the dialog follows the URL.
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(() => {
                if (this.isInUrl() !== this.isOpen()) {
                    const modal = window.bootstrap?.Modal.getOrCreateInstance(this.host.nativeElement.firstElementChild!);

                    if (this.isInUrl()) {
                        // Reopened by Forward: the entry before is this page without it.
                        const previous = this.router.lastSuccessfulNavigation()?.previousNavigation?.finalUrl;
                        this.hasOwnHistoryEntry = !!previous && this.router.serializeUrl(previous) === this.router.serializeUrl(this.urlWithParam(null));
                        modal?.show();
                    } else {
                        this.hasOwnHistoryEntry = false;
                        modal?.hide();
                    }
                }
            });
    }

    private isInUrl(): boolean {
        return this.router.routerState.snapshot.root.queryParamMap.get(DIALOG_PARAM) === this.modalId;
    }

    // Changes only the query parameter; the page underneath keeps its scroll position.
    private setUrlParam(value: string | null, replaceUrl: boolean): void {
        this.router.navigateByUrl(this.urlWithParam(value), { replaceUrl, scroll: 'manual' });
    }

    private urlWithParam(value: string | null): UrlTree {
        return this.router.createUrlTree([], { queryParams: { [DIALOG_PARAM]: value }, queryParamsHandling: 'merge' });
    }
}
