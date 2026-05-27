import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneDistributionChartComponent } from './zone-distribution-chart.component';

describe('ZoneDistributionChartComponent', () => {
  let component: ZoneDistributionChartComponent;
  let fixture: ComponentFixture<ZoneDistributionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneDistributionChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ZoneDistributionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
