import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CtlSectionBackgroundComponent } from "@shared/ctl-section-background/ctl-section-background.component";
import { ProjectItem } from "@models/data.model";
import { FetchDataService } from "@services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ModalComponent } from "../modal/modal.component";
import { CtlSectionMessageBoxComponent } from "@shared/ctl-section-message-box/ctl-section-message-box.component";
import { SanitizeYouTubeUrlPipe } from "../../pipes/url-sanitizer.pipe";
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";

@Component({
    selector: 'ctl-projects',
    standalone: true,
    imports: [
        CtlSectionBackgroundComponent,
        ModalComponent,
        CtlSectionMessageBoxComponent,
        CtlSkeletonComponent,
        SanitizeYouTubeUrlPipe
    ],
    templateUrl: './projetos.component.html',
    styleUrl: './projetos.component.scss'
})
export class ProjetosComponent implements OnInit {
    readonly messageBoxText = 'Quando o destino nos inspira, cada passo da jornada ganha sentido, sobretudo quando caminhamos juntos.';
    projectItems: ProjectItem[] = [];
    loading = true;
    readonly skeletons = Array(4);

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.fetchDataService.getProjectsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (projectItems) => this.projectItems = projectItems,
                complete: () => this.loading = false
            });
    }
}
