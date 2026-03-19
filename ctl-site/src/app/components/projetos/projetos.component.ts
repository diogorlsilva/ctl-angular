import {Component, DestroyRef, inject, OnInit, ViewEncapsulation} from '@angular/core';
import { CtlSectionBackgroundComponent } from "@shared/ctl-section-background/ctl-section-background.component";
import { ProjectItem } from "@models/data.model";
import { FetchDataService } from "@services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ModalComponent } from "../modal/modal.component";
import { CtlSectionMessageBoxComponent } from "@shared/ctl-section-message-box/ctl-section-message-box.component";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {SanitizeYouTubeUrlPipe} from "../../pipes/url-sanitizer.pipe";

@Component({
    selector: 'ctl-projects',
    standalone: true,
  imports: [
    CtlSectionBackgroundComponent,
    ModalComponent,
    CtlSectionMessageBoxComponent,
    SanitizeYouTubeUrlPipe
  ],
    templateUrl: './projetos.component.html',
    styleUrl: './projetos.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ProjetosComponent implements OnInit {
    messageBoxText = 'Quando o destino nos inspira, cada passo da jornada ganha sentido, sobretudo quando caminhamos juntos.';
  safeURL: SafeUrl;
    projectItems: ProjectItem[];

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

    ngOnInit(): void {
        if (this.fetchDataService.isSectionsDataLoaded) {
            this.projectItems = this.fetchDataService.projectsItems;

            return;
        }

        this.fetchDataService.setSectionsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.projectItems = this.fetchDataService.projectsItems);
    }

  private setSafeURL(videoURL?: string) {
    if (!videoURL) return;

    const videoId =  (videoURL?? '').split("?v=")[1];

    this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&&playlist=${videoId}`
    );
  }
}
