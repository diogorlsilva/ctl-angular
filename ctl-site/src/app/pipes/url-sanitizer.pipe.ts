import {inject, Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Pipe({  standalone: true, name: 'SafeYouTubeUrl' })
export class SanitizeYouTubeUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);


  transform(url?: string): SafeUrl | null {
    if (!url) return null;

    const videoId =  (url?? '').split("?v=")[1];

    return  this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&&playlist=${videoId}`
    );
  }
}
