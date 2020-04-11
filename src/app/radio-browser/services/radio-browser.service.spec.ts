import { TestBed } from '@angular/core/testing';

import { WebRadioService } from './web-radio.service';

describe('WebRadioService', () => {
  let service: WebRadioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebRadioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
