import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletaDetalle } from './boleta-detalle';

describe('BoletaDetalle', () => {
  let component: BoletaDetalle;
  let fixture: ComponentFixture<BoletaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletaDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletaDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
