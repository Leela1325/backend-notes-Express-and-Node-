import { Component, OnDestroy, OnInit } from '@angular/core';
import { ZonesService  , zonesSummary} from './zones.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-zones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './total-zones.component.html',
  styleUrl: './total-zones.component.scss'
})
export class TotalZonesComponent implements OnInit , OnDestroy {
  zoneData !: zonesSummary
  isLoaded : boolean = false ;
  constructor(private zoneService: ZonesService) {}
  subscription !: Subscription
  ngOnInit(): void {
   this.subscription =  this.zoneService.getZoneStats().subscribe(data => {
      this.zoneData = data;
        this.isLoaded = true ;
    });
  }
  ngOnDestroy(): void {
      this.subscription.unsubscribe() ;
  }
}

