import {Injectable} from "@angular/core";
import {Language, TranslationKey, translationsEN, translationsPT} from "../../assets/translations.model";

const localStorageKey = 'language';

@Injectable({providedIn: 'root'})
export class TranslationsService {
  static translations: Record<TranslationKey, string>
  static language: Language;

  initTranslations(): void {
    TranslationsService.language = <Language>localStorage.getItem(localStorageKey) ?? 'pt';

    TranslationsService.translations = TranslationsService.language === 'en' ? translationsEN : translationsPT;
  }

  changeLanguage(language: Language): void {
    TranslationsService.language = language;
    TranslationsService.translations = language === 'en' ? translationsEN : translationsPT;

    localStorage.setItem(localStorageKey, language);

    location.reload();
  }
}

export const translate = (key: TranslationKey): string => {
  return TranslationsService.translations[key];
}
