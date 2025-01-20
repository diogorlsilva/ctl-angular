import {Component, inject} from '@angular/core';
import {NavbarComponent} from "./navbar/navbar.component";
import {TranslationsService} from "./services/translations.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [NavbarComponent],
  standalone: true
})
export class AppComponent {
  translationService = inject(TranslationsService);

  constructor() {
    this.translationService.initTranslations()
  }
}
