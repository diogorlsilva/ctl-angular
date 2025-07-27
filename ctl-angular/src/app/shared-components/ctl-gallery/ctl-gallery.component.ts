import {Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {interval} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'ctl-gallery',
  standalone: true,
  imports: [],
  templateUrl: './ctl-gallery.component.html',
  styleUrl: './ctl-gallery.component.scss'
})
export class CtlGalleryComponent implements OnInit {
  photosSRCs: string[] = []

  firstElementWidth = 0;

  private readonly destroyRef = inject(DestroyRef);

  @Input() set imagesSRCs(SRCs: string[]) {
    this.photosSRCs = [...SRCs];

    while (this.photosSRCs.length < 30) {
      this.photosSRCs = [...this.photosSRCs, ...SRCs];
    }
  }

  ngOnInit(): void {
    interval(5000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.removeFirstElementAnimation())
  }

  private removeFirstElementAnimation(): void {
    const parent = document.getElementById('gallery-flex-container') as HTMLElement;


    const firstElementChild = parent?.firstElementChild as HTMLElement;

    if (!firstElementChild) {
      return;
    }

    setTimeout(() => {
      this.firstElementWidth = firstElementChild.clientWidth;

      firstElementChild.style.setProperty('--first-element-width', `${this.firstElementWidth - 5}px`);


      setTimeout(() => {
        firstElementChild.classList.add('remove-transition');
      })

    }, 3500)

    setTimeout(() => {
      firstElementChild.classList.remove('remove-transition');
      firstElementChild.style.removeProperty('--first-element-width');


      parent.append(firstElementChild);
    }, 4450)


  }

}
