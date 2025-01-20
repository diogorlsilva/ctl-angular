import {Pipe, PipeTransform} from "@angular/core";
import {TranslationKey} from "../../assets/translations.model";
import {translate} from "../services/translations.service";

@Pipe({name: 'translatePipe', standalone: true})
export class TranslationPipe implements PipeTransform {
  transform(key: TranslationKey): string {
    return translate(key);
  }
}
