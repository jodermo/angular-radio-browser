import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartViewComponent } from './start-view.component';

describe('StartViewComponent', () => {
  let component: StartViewComponent;
  let fixture: ComponentFixture<StartViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
