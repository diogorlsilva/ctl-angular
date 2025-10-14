import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CtlGalleryComponent } from "../../shared-components/ctl-gallery/ctl-gallery.component";
import {
    CtlSectionBackgroundComponent
} from "../../shared-components/ctl-section-background/ctl-section-background.component";
import { SectionItem } from "../../models/data.model";
import { FetchDataService } from "../../services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    CtlSectionMessageBoxComponent
} from "../../shared-components/ctl-section-message-box/ctl-section-message-box.component";
import { CtlSectionContentComponent } from "../../shared-components/ctl-section-content/ctl-section-content.component";

@Component({
    selector: 'ctl-creche',
    standalone: true,
    imports: [
        CtlGalleryComponent,
        CtlSectionBackgroundComponent,
        CtlSectionMessageBoxComponent,
        CtlSectionContentComponent,
    ],
    templateUrl: './creche.component.html',
    styleUrl: './creche.component.scss'
})
export class CrecheComponent implements OnInit {
    section: SectionItem;

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {

        if (this.fetchDataService.isSectionsDataLoaded) {
            this.section = this.fetchDataService.crecheSection;
            console.log(this.section);
            return;
        }

        this.fetchDataService.setSectionsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.section = this.fetchDataService.crecheSection);
    }
}
