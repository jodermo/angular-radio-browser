import { AppLanguage } from '../services/app.service';

export class AppConfig {
  mobileApp = true;
  audioVisuals = !this.mobileApp;
  languages: AppLanguage[] = [
    {alias: 'german', iso: 'de'} // first entry is default language
  ];
}
