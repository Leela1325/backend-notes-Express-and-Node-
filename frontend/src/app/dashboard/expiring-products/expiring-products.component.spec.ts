import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiringProductsComponent } from './expiring-products.component';

describe('ExpiringProductsComponent', () => {
  let component: ExpiringProductsComponent;
  let fixture: ComponentFixture<ExpiringProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiringProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpiringProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
