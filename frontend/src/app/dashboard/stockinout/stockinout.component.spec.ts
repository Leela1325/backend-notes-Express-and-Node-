import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockinoutComponent } from './stockinout.component';

describe('StockinoutComponent', () => {
  let component: StockinoutComponent;
  let fixture: ComponentFixture<StockinoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockinoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockinoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
