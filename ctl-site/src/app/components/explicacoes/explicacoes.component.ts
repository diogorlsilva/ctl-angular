import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CtlSectionBackgroundComponent } from "@shared/ctl-section-background/ctl-section-background.component";
import { CtlSectionMessageBoxComponent } from "@shared/ctl-section-message-box/ctl-section-message-box.component";
import { CtlGalleryComponent } from "@shared/ctl-gallery/ctl-gallery.component";
import { CtlSectionContentComponent } from "@shared/ctl-section-content/ctl-section-content.component";
import { SectionItem } from "@models/data.model";
import { FetchDataService } from "@services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'ctl-explicacoes',
    standalone: true,
    imports: [
        CtlSectionBackgroundComponent,
        CtlSectionMessageBoxComponent,
        CtlGalleryComponent,
        CtlSectionContentComponent
    ],
    templateUrl: './explicacoes.component.html',
    styleUrl: './explicacoes.component.scss'
})
export class ExplicacoesComponent implements OnInit {
    section: SectionItem;

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        if (this.fetchDataService.isSectionsDataLoaded) {
            this.section = this.fetchDataService.explicacoesSection;

            return;
        }

        this.fetchDataService.setSectionsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.section = this.fetchDataService.explicacoesSection);
    }
}
