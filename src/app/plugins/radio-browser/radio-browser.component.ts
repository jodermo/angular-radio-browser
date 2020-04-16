import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { RadioBrowserService } from './radio-browser.service';

@Component({
  selector: 'app-radio-browser',
  templateUrl: './radio-browser.component.html',
  styleUrls: ['./radio-browser.component.scss'],
})
export class RadioBrowserComponent implements OnInit {
  @Input() visuals = false;
  @Output() onPlay = new EventEmitter<HTMLAudioElement>();
  extendedFilter = false;

  constructor(public radio: RadioBrowserService) {

  }



  ngOnInit() {
   this.radio.init(this.visuals);
  }

}
