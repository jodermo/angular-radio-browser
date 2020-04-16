import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioStationPreviewSmallComponent } from './radio-station-preview-small.component';

describe('RadioStationPreviewSmallComponent', () => {
  let component: RadioStationPreviewSmallComponent;
  let fixture: ComponentFixture<RadioStationPreviewSmallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioStationPreviewSmallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioStationPreviewSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
