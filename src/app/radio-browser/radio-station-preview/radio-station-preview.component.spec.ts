import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioStationPreviewComponent } from './radio-station-preview.component';

describe('RadioStationPreviewComponent', () => {
  let component: RadioStationPreviewComponent;
  let fixture: ComponentFixture<RadioStationPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioStationPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioStationPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
