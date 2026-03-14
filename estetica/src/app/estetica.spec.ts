import { TestBed } from '@angular/core/testing';

import { Estetica } from './estetica';

describe('Estetica', () => {
  let service: Estetica;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Estetica);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
