import {Component, inject} from '@angular/core';
import {TranslationPipe} from "../pipes/translation.pipe";
import {TranslationsService} from "../services/translations.service";
import {Language} from "../../assets/translations.model";
import {UpperCasePipe} from "@angular/common";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslationPipe, UpperCasePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  translationService = inject(TranslationsService);

  currentLanguage = TranslationsService.language;

  changeLanguage(language: Language): void {
    this.translationService.changeLanguage(language)

    this.currentLanguage = TranslationsService.language
  }
}
