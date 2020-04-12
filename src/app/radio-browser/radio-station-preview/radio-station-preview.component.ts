import { Component, OnInit, Input } from '@angular/core';
import { RadioBrowserService } from '../services/radio-browser.service';

@Component({
  selector: 'app-radio-station-preview',
  templateUrl: './radio-station-preview.component.html',
  styleUrls: ['./radio-station-preview.component.scss'],
})
export class RadioStationPreviewComponent implements OnInit {
  @Input() station = null;
  @Input() details = false;
  lastVolume = 1;

  constructor(public radio: RadioBrowserService) {
  }

  ngOnInit() {
  }


}
