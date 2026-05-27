import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouteConfigLoadEnd, Router } from '@angular/router';
import { SupplierService } from '../supplier/supplier.service';
import { CommonModule, NgFor } from '@angular/common';
import {
  Supplier,
  SupplierWithoutId,
  SupplierWithProducts,
} from '../supplier/supplier.model';
import Swal from 'sweetalert2';

import { ActivityDaoService } from '../../../dao/activitydao.service';
@Component({
  selector: 'app-newsupplier',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './new-supplier.component.html',
  styleUrl: './new-supplier.component.scss',
})
export class NewsupplierComponent {
  @Output() close = new EventEmitter();
  @Output() add = new EventEmitter();

  contactexists=false;
  emailexists=false;
  defaultrating = 3;
  lastsupplier!: Supplier;
  zoneId = '1';
  categoryId = '1';

  supplierlist=input<SupplierWithProducts[]>();
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  supplierService = inject(SupplierService);
  activityService = inject(ActivityDaoService);

  ngOnInit() {
    this.supplierService.getSuppliers();

    this.activatedRoute.params.subscribe((param) => {
      this.zoneId = param['zoneid'];
      this.categoryId = param['categoryid'];
    });
  }

  navigateToBack() {
    this.close.emit();
  }

  addSupplier(form: NgForm) {
    if (form.invalid || this.contactexists) return;
    if (form.valid) {
      let name: string = form.controls['name'].value;
      let email: string = form.controls['email'].value;
      let contact: string = form.controls['contact'].value;
      let address: string = form.controls['address'].value;
      let rating: number =3
      let performance: string = "Good"
      let active: boolean =
        form.controls['active'].value;
      let product: string[] = [];

      let data: SupplierWithoutId = {
        name,
        email,
        contact,
        address,
        rating,
        performance,
        active,
        zoneid: this.zoneId,
        categoryid: this.categoryId,
        productids: product,
      };
    
      this.supplierService.addSupplier(data).subscribe({
        next: (response) => {
          this.addEmittedSupplier(response);
          this.activityService
            .updateActivity(
              'Supplier Added',
              `${name} has been added as a supplier`,
            )
            .subscribe();
          this.close.emit();

          Swal.fire({
            title: `Successfully added ${name} Supplirer`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
      });
    }
  }

  addEmittedSupplier(supplier: SupplierWithoutId) {
    console.log(supplier)
    this.add.emit(supplier);
  }

  isDigitsOnly(val: string): boolean {
  return /^\d+$/.test(val);
}

startsWithValid(val: string): boolean {
  return /^[6-9]/.test(val);
}

 checkContact(contact: string) {
  this.contactexists = false; 

  this.supplierlist()?.forEach((supplier) => {
    if (supplier.contact == contact) {
      this.contactexists = true;
    }
  });
}

  checkEmail(email: string) {
  this.emailexists = false; 

  this.supplierlist()?.forEach((supplier) => {
    if (supplier.email == email) {
      this.emailexists = true;
    }
  });
}
}
