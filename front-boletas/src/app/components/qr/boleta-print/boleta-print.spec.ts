import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletaPrint } from './boleta-print';

describe('BoletaPrint', () => {
  let component: BoletaPrint;
  let fixture: ComponentFixture<BoletaPrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletaPrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletaPrint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
