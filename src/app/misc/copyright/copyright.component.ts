import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.scss']
})
export class CopyrightComponent implements OnInit {
  @Input() layout = 'default';

  constructor() { }

  ngOnInit(): void {
  }

}
