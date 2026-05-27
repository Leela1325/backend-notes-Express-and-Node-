import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySalesChartComponent } from './daily-sales-chart.component';

describe('DailySalesChartComponent', () => {
  let component: DailySalesChartComponent;
  let fixture: ComponentFixture<DailySalesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailySalesChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DailySalesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
