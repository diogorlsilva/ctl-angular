import {Component, DestroyRef, inject, OnInit, Sanitizer} from '@angular/core';
import { CtlGalleryComponent } from "@shared/ctl-gallery/ctl-gallery.component";
import { CtlSectionBackgroundComponent } from "@shared/ctl-section-background/ctl-section-background.component";
import { SectionItem } from "@models/data.model";
import { FetchDataService } from "@services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CtlSectionMessageBoxComponent } from "@shared/ctl-section-message-box/ctl-section-message-box.component";
import { CtlSectionContentComponent } from "@shared/ctl-section-content/ctl-section-content.component";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
    selector: 'ctl-creche',
    standalone: true,
    imports: [
        CtlGalleryComponent,
        CtlSectionBackgroundComponent,
        CtlSectionMessageBoxComponent,
    ],
    templateUrl: './creche.component.html',
    styleUrl: './creche.component.scss'
})
export class CrecheComponent implements OnInit {
    section: SectionItem;
    safeURL: SafeUrl;

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);


    ngOnInit(): void {
        if (this.fetchDataService.isSectionsDataLoaded) {
            this.section = this.fetchDataService.crecheSection;

           this.setSafeURL(this.section.videoURL);

            return;
        }

        this.fetchDataService.setSectionsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              this.section = this.fetchDataService.crecheSection;

              this.setSafeURL(this.section.videoURL);
            });
    }

    private setSafeURL(videoURL?: string) {
      if (!videoURL) return;

      const videoId =  (videoURL?? '').split("?v=")[1];

      this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&&playlist=${videoId}`
      );
    }
}
