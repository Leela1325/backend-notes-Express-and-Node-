import { Component, ElementRef, inject, signal, ViewChild, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Supplier, SupplierWithoutId, SupplierWithProducts } from './supplier/supplier.model';
import { SupplierService } from './supplier/supplier.service';
import { SupplierComponent } from "./supplier/supplier.component";
import { Zone } from '../zone-list/zone/zone.model';
import { ZoneService } from '../zone-list/zone/zone.service';
import { ProductSupplierService } from './supplier/product-supplier.service';
import { forkJoin, from, map, mergeMap, toArray } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NewsupplierComponent } from './new-supplier/new-supplier.component';
import Swal from 'sweetalert2';
import { Form, FormsModule, NgForm } from '@angular/forms';
import { Product } from './supplier/product.model';
@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [SupplierComponent,CommonModule,NewsupplierComponent,FormsModule],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SuppliersListComponent {
    isAdding: boolean = false;
    searchvalue="";
  
    
    zoneid=signal<string>('1');
    categoryid=signal<string>('1');

 

    zonedata!:Zone;
    supplierArray=signal<SupplierWithProducts[]>([]);
    backupArray=signal<SupplierWithProducts[]>([]);

    activatedRoute=inject(ActivatedRoute);
    supplierService=inject(SupplierService);
    zoneService=inject(ZoneService);
    productSupplierService=inject(ProductSupplierService);
    router=inject(Router);

    showPopup = false;



    
    ngOnInit()
    {
      this.activatedRoute.params.subscribe((param)=>{
        this.zoneid.set(param['zoneid']);
        this.categoryid.set(param['categoryid']);
        this.supplierService.getSuppliersByCategoryId(this.categoryid(),this.zoneid()).subscribe({
        next:(supplier)=>{console.log(supplier);
          this.supplierArray.set(supplier); 
          this.backupArray.set([...this.supplierArray()]);},
        error:(data)=>console.log(data.message)
      })
      })
      
      
      
      
      this.zoneService.getZone(this.zoneid()).subscribe((zone)=>
      {
        this.zonedata=zone;
      }
    )

    }

   


  DeleteSupplier(id:string)
  {
    console.log(id);
    this.supplierArray.set(this.supplierArray().filter((x:Supplier)=>x.id!=id));
    this.backupArray.set([...this.supplierArray()]);
  }


  
  


  

  searchFunction() {
  let filtered:SupplierWithProducts[] = [...this.backupArray()];

 
  if (this.searchvalue.trim()) {
    filtered = this.supplierService.searchName(filtered, this.searchvalue);
  }



  this.supplierArray.set(filtered);
}

  onSupplierAdded(supplier:Supplier) {
  this.showPopup = false;

  let supplierdata_={
    ...supplier,products:[]
  }
  this.supplierArray.set([...this.supplierArray(),supplierdata_])
  this.backupArray.set([...this.supplierArray()]);
}

  navigateToAnalytics()
  {
    this.router.navigate(['supplier-management','supplier-analytics'],{
    
      state:{suppliers:this.supplierArray()}
    })
  }

}
