import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirBoletas } from './subir-boletas';

describe('SubirBoletas', () => {
  let component: SubirBoletas;
  let fixture: ComponentFixture<SubirBoletas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirBoletas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirBoletas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
