import { TestBed } from '@angular/core/testing';

import { Boleta } from './boleta';

describe('Boleta', () => {
  let service: Boleta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Boleta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
