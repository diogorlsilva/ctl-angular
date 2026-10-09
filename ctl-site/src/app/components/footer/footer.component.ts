import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FetchDataService } from "@services/fetch-data.service";
import { AccountReport, address, ctlEmail, mapsUrl, mission, OrganisationItem, telephoneNumber } from "@models/data.model";
import { RouterLink } from "@angular/router";
import { ModalComponent } from "../modal/modal.component";
import { PoliticaPrivacidadeComponent } from "../politica-privacidade/politica-privacidade.component";

// Site footer, rendered on every page. It also owns the "about the
// institution" dialogs, which are opened from here and from the home page.
@Component({
    selector: 'ctl-footer',
    imports: [ModalComponent, PoliticaPrivacidadeComponent, RouterLink],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
    readonly reports = signal<AccountReport[]>([]);
    readonly organisation = signal<OrganisationItem | undefined>(undefined);

    readonly mission = mission;
    readonly telephoneNumber = telephoneNumber;
    readonly address = address;
    readonly ctlEmail = ctlEmail;
    readonly mapsUrl = mapsUrl;
    readonly year = new Date().getFullYear();

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.fetchDataService.getReportsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((reports) => this.reports.set(reports));

        this.fetchDataService.getOrganisationData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((organisation) => this.organisation.set(organisation));
    }
}
