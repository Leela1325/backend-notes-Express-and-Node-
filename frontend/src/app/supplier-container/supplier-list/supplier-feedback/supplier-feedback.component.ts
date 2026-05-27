import { Component, inject, signal } from '@angular/core';
import { Supplier } from '../supplier/supplier.model';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { SupplierService } from '../supplier/supplier.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ActivityDaoService } from '../../../dao/activitydao.service';

@Component({
  selector: 'app-supplierfeedback',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './supplier-feedback.component.html',
  styleUrl: './supplier-feedback.component.scss',
})
export class SupplierfeedbackComponent {
  supplierid = signal<string>('');
  supplier=signal<any>('');
 
  supplierService = inject(SupplierService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  activityService = inject(ActivityDaoService);

  ngOnInit() {

        this.activatedRoute.params.subscribe((param)=>{
      this.supplierid.set(param['supplierid']);
        });

        this.supplierService.getSupplierById(this.supplierid()).subscribe((supplier)=>{

          this.supplier.set(supplier);
        })

  }
  submitFeedback(form: NgForm) {
    if (form.valid) {
      let rating1: number = +form.controls['rating1'].value;
      let rating2: number = +form.controls['rating2'].value;
      let rating3: number = +form.controls['rating3'].value;
      let rating4: number = +form.controls['rating4'].value;
      let rating5: number = +form.controls['rating5'].value;
      let final: number = rating1 + rating2 + rating3 + rating4 + rating5;

      this.supplierService.calculateRating(this.supplierid(), final);
      this.activityService
        .updateActivity(
          'Supplier Feedback',
          `${this.supplier().name} got a new rating..`,
        )
        .subscribe();
      Swal.fire({
        title: 'Success!',
        text: 'Thank you for your feedback.',
        icon: 'success',
        confirmButtonColor: '#198754',
        confirmButtonText: 'Done',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        this.onCancel();
      });
    }
  }

  onCancel() {
    this.router.navigate(['../../'], {
      relativeTo: this.activatedRoute,
    });
  }
}
