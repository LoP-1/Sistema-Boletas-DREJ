import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletaCart } from './boleta-cart';

describe('BoletaCart', () => {
  let component: BoletaCart;
  let fixture: ComponentFixture<BoletaCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletaCart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletaCart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
