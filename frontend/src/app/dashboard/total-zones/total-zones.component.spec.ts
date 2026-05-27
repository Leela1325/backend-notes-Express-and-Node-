import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalZonesComponent } from './total-zones.component';

describe('TotalZonesComponent', () => {
  let component: TotalZonesComponent;
  let fixture: ComponentFixture<TotalZonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalZonesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalZonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
