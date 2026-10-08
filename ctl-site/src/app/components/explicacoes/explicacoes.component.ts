import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CtlSectionBackgroundComponent } from "@shared/ctl-section-background/ctl-section-background.component";
import { CtlSectionMessageBoxComponent } from "@shared/ctl-section-message-box/ctl-section-message-box.component";
import { CtlGalleryComponent } from "@shared/ctl-gallery/ctl-gallery.component";
import { CtlSectionContentComponent } from "@shared/ctl-section-content/ctl-section-content.component";
import { SectionItem } from "@models/data.model";
import { FetchDataService } from "@services/fetch-data.service";
import { XLSXUrl } from "../../utils/utils.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'ctl-explicacoes',
    imports: [
        CtlSectionBackgroundComponent,
        CtlSectionMessageBoxComponent,
        CtlGalleryComponent,
        CtlSectionContentComponent
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './explicacoes.component.html'
})
export class ExplicacoesComponent implements OnInit {
    section?: SectionItem;
    loading = true;

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.fetchDataService.getSectionDataByUrl(XLSXUrl.EXPLICACOES)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (section) => this.section = section,
                complete: () => this.loading = false
            });
    }
}
