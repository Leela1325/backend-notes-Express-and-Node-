import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaySalesComponent } from './today-sales.component';

describe('TodaySalesComponent', () => {
  let component: TodaySalesComponent;
  let fixture: ComponentFixture<TodaySalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodaySalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodaySalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
