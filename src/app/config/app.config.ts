import { AppLanguage } from '../services/app.service';

export class AppConfig {
  cordovaApp = false;
  languages: AppLanguage[] = [
    {alias: 'german', iso: 'de'} // first entry is default language
  ];
}
