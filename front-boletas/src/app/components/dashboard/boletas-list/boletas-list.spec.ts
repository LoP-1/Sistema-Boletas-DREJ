import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletasList } from './boletas-list';

describe('BoletasList', () => {
  let component: BoletasList;
  let fixture: ComponentFixture<BoletasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletasList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
