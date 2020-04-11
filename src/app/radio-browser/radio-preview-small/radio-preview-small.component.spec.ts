import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioPreviewSmallComponent } from './radio-preview-small.component';

describe('RadioPreviewSmallComponent', () => {
  let component: RadioPreviewSmallComponent;
  let fixture: ComponentFixture<RadioPreviewSmallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioPreviewSmallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioPreviewSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
