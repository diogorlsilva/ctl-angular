import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CtlGalleryComponent } from "@shared/ctl-gallery/ctl-gallery.component";
import { CtlSectionBackgroundComponent } from "@shared/ctl-section-background/ctl-section-background.component";
import { CtlSectionContentComponent } from "@shared/ctl-section-content/ctl-section-content.component";
import { CtlSectionMessageBoxComponent } from "@shared/ctl-section-message-box/ctl-section-message-box.component";
import { SectionItem } from "@models/data.model";
import { FetchDataService } from "@services/fetch-data.service";
import { XLSXUrl } from "../../utils/utils.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'ctl-musica',
    standalone: true,
    imports: [
        CtlGalleryComponent,
        CtlSectionBackgroundComponent,
        CtlSectionContentComponent,
        CtlSectionMessageBoxComponent
    ],
    templateUrl: './musica.component.html',
    styleUrl: './musica.component.scss'
})
export class MusicaComponent implements OnInit {
    section?: SectionItem;
    loading = true;

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.fetchDataService.getSectionDataByUrl(XLSXUrl.MUSICA)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (section) => this.section = section,
                complete: () => this.loading = false
            });
    }
}
