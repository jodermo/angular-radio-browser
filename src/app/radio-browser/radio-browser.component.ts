import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RadioBrowserService } from './services/radio-browser.service';

@Component({
  selector: 'app-radio-browser',
  templateUrl: './radio-browser.component.html',
  styleUrls: ['./radio-browser.component.scss'],
})
export class RadioBrowserComponent implements OnInit {
  @Output() onPlay = new EventEmitter<HTMLAudioElement>();

  constructor(public radio: RadioBrowserService) {
    console.log(this.radio);
    localStorage.clear();
  }

  ngOnInit() {
   this.radio.init();

  }
}
