import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTicketsComponent } from './pending-tickets.component';

describe('PendingTicketsComponent', () => {
  let component: PendingTicketsComponent;
  let fixture: ComponentFixture<PendingTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingTicketsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
