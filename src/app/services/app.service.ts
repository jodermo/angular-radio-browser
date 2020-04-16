import * as DeviceDetector from 'device-detector-js';
import { Injectable } from '@angular/core';
import { AppConfig } from '../config/app.config';
import { AppTranslations } from '../config/app.translations';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  config = new AppConfig();

  /* translation settings */
  translations: AppTranslation[] = AppTranslations;
  language: AppLanguage = this.config.languages[0] || null;

  /* client ip, device and browser detection */
  deviceDetector = new DeviceDetector();
  device = this.deviceDetector.parse(navigator.userAgent);

  constructor() {
  }

  /* app text and translation logic */

  text(text: string) {
    return this.translation(text) || text;
  }

  translation(text: string) {
    const translations = this.translations.filter(translation => {
      return translation.text === text;
    }) || null;
    if (translations.length) {
      for (const translation of translations) {
        if (translation.get(this.language.iso)) {
          return translation.get(this.language.iso);
        }
      }
    }
    return text;
  }
}


export class AppLanguage {
  alias: string;
  iso: string;
}

export class AppTranslation {
  text: string;
  translation: any = {};

  get(languageIso: string) {
    return this.translation[languageIso] || this.text;
  }
}

