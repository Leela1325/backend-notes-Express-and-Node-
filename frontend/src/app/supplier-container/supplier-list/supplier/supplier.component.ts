import {
  Component,
  EventEmitter,
  inject,
  input,
  Output,
  effect,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { SupplierWithProducts } from './supplier.model';
import { FormsModule, NgForm } from '@angular/forms';
import { SupplierService } from './supplier.service';
import Swal from 'sweetalert2';
import { NgIf, CommonModule } from '@angular/common';
import { ActivityDaoService } from '../../../dao/activitydao.service';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.scss',
  
})
export class SupplierComponent {

  supplierdata = input.required<SupplierWithProducts>();

  readonly perfMap: Record<number, string> = {
    1: 'Poor',
    2: 'Average',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  edit = false;
  suppliername = '';
  supplieremail = '';
  suppliercontact = '';
  supplierstatus = true;
  supplierperformance = '';
  supplieraddress = '';
  supplierrating = 5;
  editRating = 5;

  
  activityService = inject(ActivityDaoService);
  supplierService = inject(SupplierService);

  @Output() delete = new EventEmitter();

  constructor() {
 
    effect(() => {
      const data = this.supplierdata(); 
 
      if (this.edit) return;          

      this.suppliername       = data.name;
      this.supplieremail      = data.email;
      this.suppliercontact    = data.contact;
      this.supplierstatus     = data.active;
      this.supplierperformance = data.performance;
      this.supplieraddress    = data.address;
      this.supplierrating     = data.rating;
      this.editRating         = Math.round(data.rating); 

    
    });
  }

  btnTrigger() {
    this.edit = !this.edit;
    if (this.edit) {
      
      this.editRating = Math.round(this.supplierrating); 
    }
 
  }

  getPerformance(rating: number): string {
    return this.perfMap[Math.round(rating)] ?? 'N/A';
  }

  round(rating: number): number {
    return Math.round(rating);
  }

  updateSupplierDetails(f: NgForm) {
    if (f.dirty) {
      this.suppliercontact    = f.value.suppliercontact;
      this.supplieraddress    = f.value.supplieraddress;
      this.supplierstatus     = f.value.active;
      this.supplierrating     = this.editRating;
      this.supplierperformance = this.getPerformance(this.supplierrating);

      const data = {
        name:        this.suppliername,
        contact:     this.suppliercontact,
        address:     this.supplieraddress,
        performance: this.supplierperformance,
        email:       this.supplieremail,
        zoneid:      this.supplierdata().zoneid,
        categoryid:  this.supplierdata().categoryid,
        active:      this.supplierstatus,
        rating:      this.supplierrating,
        productids:   this.supplierdata().productids,
      };

      this.supplierService
        .updateSupplierDetails(this.supplierdata().id, data)
        .subscribe(() => {
          this.activityService
            .updateActivity(
              'Supplier Details Updated',
              `${this.suppliername} details has been changed`,
            )
            .subscribe();
          Swal.fire({
            title: 'Success',
            text: `Successfully Updated ${this.suppliername} Supplier Details`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        });
    }
    this.btnTrigger();
  }

  DeleteSupplier() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to Delete '+this.suppliername+' ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed!',
      confirmButtonColor: 'red',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Success!',
          text: `${this.suppliername} has been deleted from suppliers list`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        this.supplierService.removeSupplierFromProducts(this.supplierdata().id,this.supplierdata().productids).subscribe();

        this.supplierService
          .DeleteSupplierById(this.supplierdata().id)
          .subscribe(() => {
            this.delete.emit(this.supplierdata().id);

            this.activityService
              .updateActivity(
                'Supplier Deleted',
                `${this.suppliername} has been deleted from suppliers list`,
              )
              .subscribe();
          });
      }
    });
  }
}