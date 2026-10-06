import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CtlGalleryComponent } from "@shared/ctl-gallery/ctl-gallery.component";
import { CtlSectionBackgroundComponent } from "@shared/ctl-section-background/ctl-section-background.component";
import { SectionItem } from "@models/data.model";
import { FetchDataService } from "@services/fetch-data.service";
import { XLSXUrl } from "../../utils/utils.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CtlSectionMessageBoxComponent } from "@shared/ctl-section-message-box/ctl-section-message-box.component";
import { SanitizeYouTubeUrlPipe } from "../../pipes/url-sanitizer.pipe";

@Component({
    selector: 'ctl-creche',
    standalone: true,
  imports: [
    CtlGalleryComponent,
    CtlSectionBackgroundComponent,
    CtlSectionMessageBoxComponent,
    SanitizeYouTubeUrlPipe,
  ],
    templateUrl: './creche.component.html',
    styleUrl: './creche.component.scss'
})
export class CrecheComponent implements OnInit {
    section?: SectionItem;
    loading = true;

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);


    ngOnInit(): void {
        this.fetchDataService.getSectionDataByUrl(XLSXUrl.CRECHE, true)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (section) => this.section = section,
                complete: () => this.loading = false
            });
    }
}
