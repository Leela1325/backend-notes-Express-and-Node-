import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierContainerComponent } from './supplier-container.component';

describe('SupplierContainerComponent', () => {
  let component: SupplierContainerComponent;
  let fixture: ComponentFixture<SupplierContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupplierContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
