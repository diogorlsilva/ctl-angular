import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, viewChild } from '@angular/core';
import { address, ctlEmail, mapsUrl, postalAddress, telephoneNumber } from "@models/data.model";
import { BootstrapCarousel } from "../../utils/bootstrap.model";

// Contact details: the same phone, e-mail and building as the footer, plus the
// full postal address and a carousel of photos of the building.
@Component({
    selector: 'ctl-contactos',
    templateUrl: './contactos.component.html',
    styleUrl: './contactos.component.scss'
})
export class ContactosComponent implements AfterViewInit, OnDestroy {
    readonly telephoneNumber = telephoneNumber;
    readonly ctlEmail = ctlEmail;
    readonly address = address;
    readonly postalAddress = postalAddress;
    readonly mapsUrl = mapsUrl;

    // Built by npm run optimize-images from raw-images/contactos.
    readonly photos = [1, 2, 3, 4, 5].map(n => `assets/images/contactos/edificio-${n}_background`);

    private readonly carousel = viewChild.required<ElementRef<HTMLElement>>('carousel');

    private instance?: BootstrapCarousel;
    private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Bootstrap only starts data-bs-ride carousels present at page load, and
    // this page is routed to later, so the carousel is started here.
    ngAfterViewInit(): void {
        this.instance = window.bootstrap?.Carousel.getOrCreateInstance(this.carousel().nativeElement, {
            interval: 5000,
            ride: this.reducedMotion ? false : 'carousel',
            touch: true,
            pause: 'hover',
            keyboard: true
        });
    }

    // Keyboard counterpart of pause-on-hover: a focused control holds the slide.
    @HostListener('focusin')
    onFocusIn(): void {
        this.instance?.pause();
    }

    @HostListener('focusout')
    onFocusOut(): void {
        if (!this.reducedMotion) {
            this.instance?.cycle();
        }
    }

    ngOnDestroy(): void {
        // dispose() alone leaves the slide interval running.
        this.instance?.pause();
        this.instance?.dispose();
    }
}
