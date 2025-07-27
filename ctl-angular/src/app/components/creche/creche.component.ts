import {Component} from '@angular/core';
import {CtlGalleryComponent} from "../../shared-components/ctl-gallery/ctl-gallery.component";

@Component({
  selector: 'ctl-creche',
  standalone: true,
  imports: [
    CtlGalleryComponent
  ],
  templateUrl: './creche.component.html',
  styleUrl: './creche.component.scss'
})
export class CrecheComponent {
  imagesSRCs = [
    'assets/images/berlengas/1.jpg',
    'assets/images/berlengas/2.jpg',
    'assets/images/berlengas/3.jpg',
    'assets/images/berlengas/4.jpg',
    'assets/images/berlengas/5.jpg',
    'assets/images/berlengas/6.jpg',
    'assets/images/berlengas/7.jpg',
    'assets/images/berlengas/8.jpg',
    'assets/images/berlengas/9.jpg',
    'assets/images/berlengas/10.jpg',
    'assets/images/berlengas/11.jpg',
  ]
}
