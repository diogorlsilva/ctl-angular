import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { defaultIfEmpty, map } from "rxjs";
import { FetchDataService } from "@services/fetch-data.service";
import { CtlArticleComponent } from "@shared/ctl-article/ctl-article.component";
import { slugify } from "../../utils/utils.model";

// One project, found by the slug of its title (/projetos/horta-pedagogica).
// The project sheets are cached in memory, so coming from Projetos it shows at once.
@Component({
    selector: 'ctl-projeto',
    imports: [CtlArticleComponent],
    template: `
        <ctl-article [photos]="project()?.photoSRCs ?? []"
                     [text]="project()?.description ?? ''"
                     [title]="project()?.title"
                     [videoUrl]="project()?.videoURL ?? ''"
                     backLabel="Voltar aos Projetos"
                     backLink="/projetos">
        </ctl-article>
    `
})
export class ProjetoComponent {
    private readonly router = inject(Router);

    private readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('slug'))));
    // A failed request completes empty; [] then sends the visitor to Projetos
    // instead of leaving the skeleton up.
    private readonly projects = toSignal(inject(FetchDataService).getProjectsData().pipe(defaultIfEmpty([])));

    readonly project = computed(() => this.projects()?.find(project => slugify(project.title) === this.slug()));

    constructor() {
        // An old or mistyped link: back to Projetos once the projects have loaded.
        effect(() => {
            if (this.projects() && !this.project()) {
                this.router.navigate(['/projetos'], { replaceUrl: true });
            }
        });
    }
}
