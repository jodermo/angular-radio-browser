import { Component } from '@angular/core';
import { AppService } from './services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.mobile.html', // mobile app
 // templateUrl: './app.component.html', // web app
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
