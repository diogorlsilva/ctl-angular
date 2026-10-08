import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FetchDataService } from "@services/fetch-data.service";
import { AccountReport, address, ctlEmail, mission, OrganisationItem, telephoneNumber } from "@models/data.model";
import { ModalComponent } from "../modal/modal.component";

// Site footer, rendered on every page. It also owns the three "about the
// institution" dialogs, which are opened from here and from the home page.
@Component({
    selector: 'ctl-footer',
    imports: [ModalComponent],
    templateUrl: './footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
    reports: AccountReport[] = [];
    organisation?: OrganisationItem;

    readonly mission = mission;
    readonly telephoneNumber = telephoneNumber;
    readonly address = address;
    readonly ctlEmail = ctlEmail;
    readonly year = new Date().getFullYear();

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.fetchDataService.getReportsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((reports) => this.reports = reports);

        this.fetchDataService.getOrganisationData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((organisation) => this.organisation = organisation);
    }
}
