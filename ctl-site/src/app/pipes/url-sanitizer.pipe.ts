import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Turns any YouTube link typed into a sheet (watch?v=, youtu.be/, /shorts/,
// /embed/) into a muted, looping embed URL for an iframe.
@Pipe({ standalone: true, name: 'SafeYouTubeUrl' })
export class SanitizeYouTubeUrlPipe implements PipeTransform {
    private readonly sanitizer = inject(DomSanitizer);

    transform(url?: string): SafeResourceUrl | null {
        const videoId = this.videoId(url);

        if (!videoId) {
            return null;
        }

        return this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`
        );
    }

    private videoId(url?: string): string | null {
        if (!url) {
            return null;
        }

        try {
            const parsed = new URL(url.trim());

            if (parsed.hostname.endsWith('youtu.be')) {
                return parsed.pathname.split('/')[1] || null;
            }

            return parsed.searchParams.get('v')
                ?? parsed.pathname.match(/\/(?:embed|shorts|v)\/([^/?]+)/)?.[1]
                ?? null;
        } catch {
            return null;
        }
    }
}
