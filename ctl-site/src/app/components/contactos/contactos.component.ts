import { Component } from '@angular/core';
import { address, ctlEmail, mapsUrl, postalAddress, telephoneNumber } from "@models/data.model";

// Contact details: the same phone, e-mail and building as the footer, plus the
// full postal address.
@Component({
    selector: 'ctl-contactos',
    templateUrl: './contactos.component.html',
    styleUrl: './contactos.component.scss'
})
export class ContactosComponent {
    readonly telephoneNumber = telephoneNumber;
    readonly ctlEmail = ctlEmail;
    readonly address = address;
    readonly postalAddress = postalAddress;
    readonly mapsUrl = mapsUrl;
}
