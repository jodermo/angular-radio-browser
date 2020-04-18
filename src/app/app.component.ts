import { Component } from '@angular/core';
import { AppService } from './services/app.service';
import { AppConfig } from './config/app.config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.mobile.html',
  // templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  config: AppConfig = new AppConfig();
  visuals = this.config.audioVisuals;
  showAbout = false;

  constructor(public app: AppService) {
  }

  clearStorage() {
    if (confirm('are you sure? all saved data will be lost')) {
      localStorage.clear();
      location.reload();
    }

  }
}
