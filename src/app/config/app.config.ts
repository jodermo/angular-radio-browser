import { AppLanguage } from '../services/app.service';

export class AppConfig {
  mobileApp = true;
  audioVisuals = false;
  languages: AppLanguage[] = [
    {alias: 'german', iso: 'de'} // first entry is default language
  ];
}
