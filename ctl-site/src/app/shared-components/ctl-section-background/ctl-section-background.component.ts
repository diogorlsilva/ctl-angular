import { Component, Input } from '@angular/core';

// Full-width photo at the top of an activity page. Pass the 1920px WebP from
// src/assets/images; the 960px variant generated next to it (see
// scripts/optimize-images.mjs) is served to narrow screens.
@Component({
    selector: 'ctl-section-background',
    standalone: true,
    templateUrl: './ctl-section-background.component.html',
    styleUrl: './ctl-section-background.component.scss'
})
export class CtlSectionBackgroundComponent {
    @Input({ required: true }) backgroundUrl: string;

    get srcset(): string {
        return `${this.backgroundUrl.replace(/\.webp$/, '-960.webp')} 960w, ${this.backgroundUrl} 1920w`;
    }
}
