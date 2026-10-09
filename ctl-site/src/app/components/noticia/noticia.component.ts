import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { defaultIfEmpty, map } from "rxjs";
import { FetchDataService } from "@services/fetch-data.service";
import { CtlArticleComponent } from "@shared/ctl-article/ctl-article.component";
import { slugify } from "../../utils/utils.model";

// One news item, found by the slug of its title (/noticias/festa-de-natal).
// The news sheet is cached in memory, so coming from the home page it shows at once.
@Component({
    selector: 'ctl-noticia',
    imports: [CtlArticleComponent],
    template: `
        <ctl-article [photos]="item()?.photoSrc ? [item()!.photoSrc!] : []"
                     [text]="item()?.description ?? ''"
                     [title]="item()?.title"
                     backLabel="Voltar ao Início"
                     backLink="/">
        </ctl-article>
    `
})
export class NoticiaComponent {
    private readonly router = inject(Router);

    private readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map(params => params.get('slug'))));
    // A failed request completes empty; [] then sends the visitor home instead of
    // leaving the skeleton up.
    private readonly newsItems = toSignal(inject(FetchDataService).getNewsData().pipe(defaultIfEmpty([])));

    readonly item = computed(() => this.newsItems()?.find(item => slugify(item.title) === this.slug()));

    constructor() {
        // An old or mistyped link: back to the home page once the news has loaded.
        effect(() => {
            if (this.newsItems() && !this.item()) {
                this.router.navigate([''], { replaceUrl: true });
            }
        });
    }
}
