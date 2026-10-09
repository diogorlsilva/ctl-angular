import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
    imports: [
        CtlGalleryComponent,
        CtlSectionBackgroundComponent,
        CtlSectionContentComponent,
        CtlSectionMessageBoxComponent
    ],
    templateUrl: './musica.component.html'
})
export class MusicaComponent implements OnInit {
    readonly section = signal<SectionItem | undefined>(undefined);
    readonly loading = signal(true);

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.fetchDataService.getSectionDataByUrl(XLSXUrl.MUSICA)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (section) => this.section.set(section),
                complete: () => this.loading.set(false)
            });
    }
}
