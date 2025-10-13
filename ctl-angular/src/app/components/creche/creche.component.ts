import { Component } from '@angular/core';
import { CtlGalleryComponent } from "../../shared-components/ctl-gallery/ctl-gallery.component";
import { CtlMessageBoxComponent } from "../../shared-components/ctl-message-box/ctl-message-box.component";
import {
  CtlSectionBackgroundComponent
} from "../../shared-components/ctl-section-background/ctl-section-background.component";

@Component({
  selector: 'ctl-creche',
  standalone: true,
  imports: [
    CtlGalleryComponent,
    CtlMessageBoxComponent,
    CtlSectionBackgroundComponent,
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

  messageBoxText = 'A Creche de Aves Marinhas das Berlengas (CAB) é uma estrutura de apoio à conservação da biodiversidade marinha, localizada na ilha da Berlenga, em Portugal.';
}
