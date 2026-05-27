import { Component, inject, signal, SimpleChanges } from '@angular/core';
import { ZoneService } from './zone/zone.service';
import { Zone, ZoneWithSupplierAndCategories } from './zone/zone.model';
import { ZoneComponent } from './zone/zone.component';
import { forkJoin, from,  } from 'rxjs';
import {map, mergeMap, toArray} from 'rxjs/operators'
import { CategoryService } from '../category-list/category/category.service';
import { SupplierService } from '../supplier-list/supplier/supplier.service';

@Component({
  selector: 'app-zone-list',
  standalone: true,
  imports: [ZoneComponent],
  templateUrl: './zone-list.component.html',
  styleUrl: './zone-list.component.scss'
})
export class ServiceZoneListComponent {
zoneService=inject(ZoneService);
zoneArray=signal<ZoneWithSupplierAndCategories[]>([]);
catservice=inject(CategoryService);
supservice=inject(SupplierService);

ngOnInit()
{
   this.zoneService.getZones(); 
  this.zoneService.getZonesBhSubject$.subscribe((X)=>
  {
    
    this.zoneArray.set(X);
    console.log(this.zoneArray());
  })
}
 
}
