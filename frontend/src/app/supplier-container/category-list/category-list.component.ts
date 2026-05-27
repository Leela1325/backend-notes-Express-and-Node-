import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ZoneService } from '../zone-list/zone/zone.service';
import { CommonModule } from '@angular/common';
import { CategoryService } from './category/category.service';
import { SupplierService } from '../supplier-list/supplier/supplier.service';
import { forkJoin, from } from 'rxjs';
import { map, mergeMap, single, toArray } from 'rxjs/operators';
import { CategoryComponent } from './category/category.component';
import { SuppliersListComponent } from '../supplier-list/supplier-list.component';
import { Category, CategoryWithSuppliers } from './category/category.model';
import { Supplier } from '../supplier-list/supplier/supplier.model';
import { Zone } from '../zone-list/zone/zone.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CategoryComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class ServiceCategoryListComponent {
  categoryArray = signal<CategoryWithSuppliers[]>([]);
  zoneid = signal<string>('00');
  supplierArray = signal<Supplier[]>([]);

  zoneService = inject(ZoneService);
  categoryService = inject(CategoryService);
  supplierService = inject(SupplierService);
  activatedRoute = inject(ActivatedRoute); 

  zoneObject=signal<Zone>({
    id:"", name:"", maxcapacity:0, availablecapacity:0, currentcapacity:0
  });
  inactive = 0;
  active = 0;

  ngOnInit() {
  
    this.activatedRoute.params.subscribe(param => {
      this.zoneid.set(param['zoneid']); 

      this.zoneService.getZone(this.zoneid()).subscribe(x => {
        this.zoneObject.set(x);
      });

      this.categoryService.getCategoriesByZoneId(this.zoneid()).subscribe(categories => {
        this.categoryArray.set(categories);
        
      });
    });
  }


}