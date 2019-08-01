import { TestBed } from '@angular/core/testing';

import { CarHttpService } from './car-http.service';

describe('CarHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CarHttpService = TestBed.get(CarHttpService);
    expect(service).toBeTruthy();
  });
});
