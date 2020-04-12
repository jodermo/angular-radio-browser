import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RadioBrowserService } from './services/radio-browser.service';

@Component({
  selector: 'app-radio-browser',
  templateUrl: './radio-browser.component.html',
  styleUrls: ['./radio-browser.component.scss'],
})
export class RadioBrowserComponent implements OnInit {
  @Output() onPlay = new EventEmitter<HTMLAudioElement>();
  showFavorites = false;


  constructor(public radio: RadioBrowserService) {
  }

  ngOnInit() {
   this.radio.init();
  }

}
