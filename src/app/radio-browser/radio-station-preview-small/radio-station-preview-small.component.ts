import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RadioStationPreviewComponent } from '../radio-station-preview/radio-station-preview.component';
import { RadioBrowserService } from '../services/radio-browser.service';

@Component({
  selector: 'app-radio-station-preview-small',
  templateUrl: './radio-station-preview-small.component.html',
  styleUrls: ['./radio-station-preview-small.component.scss'],
})
export class RadioStationPreviewSmallComponent extends RadioStationPreviewComponent {
  @Input() showNavigation = false;
  @Output()  onClose = new EventEmitter();


  constructor(public radio: RadioBrowserService) {
    super(radio);

  }

  ngOnInit() {
  }


  play() {
    if (window['radio'] && window['radio'].audio) {
      window['radio'].audio.play();
    }
  }

  pause() {
    if (window['radio'] && window['radio'].audio) {
      window['radio'].audio.pause();
    }
  }

  mute() {
    if (window['radio'] && window['radio'].audio) {
      window['radio'].audio.muted = !window['radio'].audio.muted;
    }
  }


  prev() {
    if (this.radio) {
      this.radio.selectPrevStation();
    }
  }

  next() {
    if (this.radio) {
      this.radio.selectNextStation();
    }
  }

  close() {
    this.pause();
    if (this.radio) {
      this.radio.removeStream();
    }

    this.onClose.emit();
  }

}
