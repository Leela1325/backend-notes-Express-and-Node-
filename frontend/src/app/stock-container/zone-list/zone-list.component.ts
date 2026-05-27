import { Component, inject, OnInit, signal } from '@angular/core';
// import { ZoneService } from '../../../../core/services/zone.service';
import { ZoneService } from './zone.service';
// import { ZoneWithCounts } from '../../../../core/models/zone.model';
import { ZoneWithCounts } from './zone.model';
import { ZoneComponent } from "./zone/zone.component";
import { Router } from '@angular/router';
@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [ZoneComponent],
  templateUrl: './zone-list.component.html',
  styleUrl: './zone-list.component.scss'
})
export class ZoneListComponent implements OnInit{
  zoneService=inject(ZoneService);
  router=inject(Router);
  zones=signal<ZoneWithCounts[]>([]);
  ngOnInit(): void {
      this.loadZones();
  }
  loadZones(){
    this.zoneService.getZoneWithCounts().subscribe((data:ZoneWithCounts[])=>{
      this.zones.set(data);
      // console.log(this.zones());
    })
  }
  zoneNavigation(id:string){
    this.router.navigate(['/stock-management',id])
  }
}
