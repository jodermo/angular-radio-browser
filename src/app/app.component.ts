import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-radio-browser';

  clearStorage(){
    if(confirm('are you sure? all saved data will be lost')){
      localStorage.clear();
      location.reload();
    }

  }
}
