import { Component, Input, OnInit } from '@angular/core';
import { RadioBrowserService } from '../../plugins/radio-browser/radio-browser.service';

@Component({
  selector: 'app-start-view',
  templateUrl: './start-view.component.html',
  styleUrls: ['./start-view.component.scss']
})
export class StartViewComponent implements OnInit {
  @Input() radio: RadioBrowserService;

  constructor() { }

  ngOnInit(): void {
  }

}
