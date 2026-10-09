import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CtlSectionBackgroundComponent } from "@shared/ctl-section-background/ctl-section-background.component";
import { ProjectItem } from "@models/data.model";
import { FetchDataService } from "@services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CtlSectionMessageBoxComponent } from "@shared/ctl-section-message-box/ctl-section-message-box.component";
import { CtlSkeletonComponent } from "@shared/ctl-skeleton/ctl-skeleton.component";
import { RouterLink } from "@angular/router";
import { slugify } from "../../utils/utils.model";

@Component({
    selector: 'ctl-projects',
    imports: [
        CtlSectionBackgroundComponent,
        CtlSectionMessageBoxComponent,
        CtlSkeletonComponent,
        RouterLink
    ],
    templateUrl: './projetos.component.html',
    styleUrl: './projetos.component.scss'
})
export class ProjetosComponent implements OnInit {
    readonly messageBoxText = 'Quando o destino nos inspira, cada passo da jornada ganha sentido, sobretudo quando caminhamos juntos.';
    readonly projectItems = signal<ProjectItem[]>([]);
    readonly loading = signal(true);
    readonly skeletons = Array(4);
    readonly slugify = slugify;

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.fetchDataService.getProjectsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (projectItems) => this.projectItems.set(projectItems),
                complete: () => this.loading.set(false)
            });
    }
}
