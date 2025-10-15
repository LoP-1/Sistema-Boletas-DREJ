import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletasGestion } from './boletas-gestion';

describe('BoletasGestion', () => {
  let component: BoletasGestion;
  let fixture: ComponentFixture<BoletasGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletasGestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletasGestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
