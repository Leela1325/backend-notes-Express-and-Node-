import { Component, inject, input, output } from '@angular/core';
import { ProductWithNames, InventoryBatch } from '../product.model';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product.service';
import Swal from 'sweetalert2';
import { ActivityDaoService } from '../../../dao/activitydao.service';
 
@Component({
  selector: '[app-product]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  product = input.required<ProductWithNames>();
  editProduct = output<ProductWithNames>();
  deleteProduct = output<ProductWithNames>();
  batchDeleted = output<void>(); // tells parent to reload after batch removed
  activityService=inject(ActivityDaoService)
  productService = inject(ProductService);
 
  onEdit() {
    this.editProduct.emit(this.product());
  }
 
  onDelete() {
    this.deleteProduct.emit(this.product());
  }
 
  onDeleteBatch(batchId: string) {
    console.log('Attempting to delete batch with ID:', batchId);
    const batch = this.product().inventory.find(b => b._id === batchId);
if (!batch) return;
 
    Swal.fire({
      title: `Remove this batch?`,
    html: `<span class="text-muted small">${batch.quantity} units · Expires ${new Date(batch.expirydate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove it',
    confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteBatch(this.product().id, batchId).subscribe({
          next: () => {
            Swal.fire({ title: 'Batch removed!', icon: 'success', timer: 1200, showConfirmButton: false, toast: true, position: 'top-end' });
            this.batchDeleted.emit(); // parent calls loadProducts()
          },
          error: (err) => {
            Swal.fire('Error', err?.error?.message || 'Could not remove batch.', 'error');
          }
        });
 
 
          this.activityService.updateActivity(this.product().name,`${this.product().name} batch has  modified in Inventory`).subscribe()
      }
    });
  }
 
  getTotalQuantity(inventory: InventoryBatch[]): number {
    return inventory ? inventory.reduce((sum, batch) => sum + batch.quantity, 0) : 0;
  }
 
  getNearestExpiry(inventory: InventoryBatch[]): string {
    if (!inventory || inventory.length === 0) return '';
    const dates = inventory.map(b => new Date(b.expirydate).getTime());
    return new Date(Math.min(...dates)).toISOString();
  }
 
  getBatchClass(expiryDate: string) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    // if (diffDays <= 7) return 'bg-danger-subtle text-danger border-danger-subtle';
    // if (diffDays <= 30) return 'bg-warning-subtle text-warning border-warning-subtle';
    // return 'bg-light text-secondary border-light-subtle';
     if (diffDays < 0)   return 'bg-danger text-white border-danger';
  if (diffDays <= 7)  return 'bg-danger-subtle text-danger border-danger-subtle';
  if (diffDays <= 30) return 'bg-warning-subtle text-warning border-warning-subtle';
  return 'bg-light text-secondary border-light-subtle';
  }
 
  isSoon(expiryDate: string): boolean {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }
  isExpired(expiryDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(expiryDate) < today;
}
  getTotalValue(inventory: InventoryBatch[]): number {
  return inventory
    ? inventory.reduce((sum, batch) => sum + (batch.quantity * (batch.price || 0)), 0)
    : 0;
}
}
 