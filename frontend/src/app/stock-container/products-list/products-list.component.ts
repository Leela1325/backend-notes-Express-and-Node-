import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './product.service';
import { Product, ProductWithNames, InventoryBatch } from './product.model';
import { ProductComponent } from './product/product.component';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ZoneService } from '../zone-list/zone.service';
import { CategoryService } from '../category-list/category.service';
// import { SupplierDaoService } from '../../dao/supplier.dao';
import { SupplierService } from '../../supplier-container/supplier-list/supplier/supplier.service';
import { Zone } from '../zone-list/zone.model';
import { Category } from '../category-list/category.model';
import { Supplier } from '../../models/supplier.model';
import Swal from 'sweetalert2';
import { ActivityDaoService } from '../../dao/activitydao.service';
 
type SortOption = 'expiry' | 'price' | 'quantity' | 'none';
 
@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [ProductComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit {
  products = signal<ProductWithNames[]>([]);
  zones = signal<Zone[]>([]);
  categories = signal<Category[]>([]);
  suppliers = signal<Supplier[]>([]);
  productForm!: FormGroup;
  fb = inject(FormBuilder);
  showModal = signal<boolean>(false);
  route = inject(ActivatedRoute);
  productService = inject(ProductService);
  zoneService = inject(ZoneService);
  supplierService = inject(SupplierService);
  categoryService = inject(CategoryService);
  editingProductId = signal<string>('');
  searchQuery = signal<string>('');
  categoryId = signal<string | null>('');
  zoneId = signal<string | null>('');
  activityService = inject(ActivityDaoService);
  currentStockForPrediction = signal<number>(0);
 
  // NEW: zone capacity error signal
  zoneCapacityError = signal<string | null>(null);
 
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const catid = params.get('categoryid');
      const zoneid = params.get('zoneid');
      this.categoryId.set(catid);
      this.zoneId.set(zoneid);
      this.loadProducts(catid);
    });
    this.initForm();
    this.loadFormData();
  }
 
  initForm() {
    this.productForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9\s().,']+$/),
        ],
      ],
      categoryid: [
        { value: this.categoryId(), disabled: true },
        Validators.required,
      ],
      zoneid: [{ value: this.zoneId(), disabled: true }, Validators.required],
      supplierids: [[], Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      expirydate: ['', [Validators.required, this.dateValidator]],
      price: [0, [Validators.required, Validators.min(0.01)]],
    });
 
    //  clear zone error whenever quantity changes
    this.productForm.get('quantity')?.valueChanges.subscribe(() => {
      this.zoneCapacityError.set(null);
    });
  }
 
  onNameChange() {
    const name = this.productForm.get('name')?.value;
    const match = this.products().find(
      (p) => p.name.toLowerCase().trim() === name?.toLowerCase().trim(),
    );
    if (match) {
      this.currentStockForPrediction.set(this.getTotalQuantity(match.inventory));
    } else {
      this.currentStockForPrediction.set(0);
    }
  }
 
  refreshData() {
    this.loadProducts(this.categoryId());
    Swal.fire({
      title: 'Refreshed!',
      timer: 1000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      icon: 'success',
    });
  }
 
  dateValidator(date: AbstractControl) {
    const selectedDate = new Date(date.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today ? { pastDate: true } : null;
  }
 
  sortType = signal<SortOption>('none');
 
  sortedProducts = computed(() => {
    let list = [...this.products()];
    const type = this.sortType();
    const query = this.searchQuery().toLowerCase().trim();
 
    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query));
    }
 
    if (type === 'expiry') {
      list.sort((a, b) => {
        const dateA = new Date(this.getNearestExpiry(a.inventory)).getTime();
        const dateB = new Date(this.getNearestExpiry(b.inventory)).getTime();
        return dateA - dateB;
      });
    } else if (type === 'price') {
      list.sort((a, b) => this.getTotalValue(b.inventory) - this.getTotalValue(a.inventory));
    } else if (type === 'quantity') {
      list.sort(
        (a, b) =>
          this.getTotalQuantity(a.inventory) -
          this.getTotalQuantity(b.inventory),
      );
    }
    return list;
  });
 
  setSort(type: SortOption) {
    this.sortType.set(type);
  }
 
  loadProducts(catid: string | null) {
    this.productService.getProductsWithNames(catid).subscribe((data) => {
      this.products.set(data);
    });
  }
 
  loadFormData() {
    this.zoneService.getZones().subscribe((data) => this.zones.set(data));
    this.categoryService
      .getCategories()
      .subscribe((data) => this.categories.set(data));
    this.supplierService
      .getSuppliersByCategoryId(this.categoryId(),this.zoneId())
      .subscribe((data) => this.suppliers.set(data));
  }
 
  handleSuccess(message: string) {
    this.productForm.markAsPristine();
    this.closeModal();
    this.loadProducts(this.categoryId());
    Swal.fire({
      title: 'Success',
      text: message,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  }
 
  // NEW: central error handler — shows zone-full inline OR generic Swal
  handleApiError(err: any) {
    const body = err?.error;
    if (err.status === 409 && body?.message) {
      this.zoneCapacityError.set(body.message);
    } else {
      Swal.fire('Error', body?.message || 'Something went wrong.', 'error');
    }
  }
 
  onSupplierToggle(supplierId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentSuppliers =
      (this.productForm.get('supplierids')?.value as string[]) || [];
 
    if (isChecked) {
      this.productForm
        .get('supplierids')
        ?.setValue([...currentSuppliers, supplierId]);
    } else {
      this.productForm
        .get('supplierids')
        ?.setValue(currentSuppliers.filter((id) => id !== supplierId));
    }
    this.productForm.get('supplierids')?.markAsDirty();
  }
 
  isSupplierSelected(supplierId: string): boolean {
    const currentSuppliers =
      (this.productForm.get('supplierids')?.value as string[]) || [];
    return currentSuppliers.includes(supplierId);
  }
 
  onSubmit() {
    if (this.productForm.valid) {
      const formValue = this.productForm.getRawValue();
      const id = this.editingProductId();
      this.zoneCapacityError.set(null); // NEW: clear before each submit
 
      if (id) {
        const existingProd = this.products().find((p) => p.id === id);
        if (existingProd) {
          const { zoneName, categoryName, supplierName, ...cleanExisting } = existingProd;
          const oldIds = [...(existingProd.supplierids || [])];
 
          const updatedProduct = {
            ...cleanExisting,
            id: id,
            name: formValue.name,
            price: formValue.price,
            supplierids: formValue.supplierids,
          };
 
          this.productService.updateProduct(id, updatedProduct).subscribe({
            next: (result) => {
            
                 const removedSupplierIds = oldIds.filter(
          (oldId) => !formValue.supplierids.includes(oldId)
        );
        if (removedSupplierIds.length > 0) {
          this.supplierService.removeProductFromSuppliers(id, removedSupplierIds);
        }

              this.supplierService.matchSupplierWithProduct(id, formValue.supplierids);
              this.handleSuccess('Product Updated Successfully');
            },
            error: (err) => this.handleApiError(err), // NEW
          });
        }
      } else {
        const existingProduct = this.products().find(
          (p) =>
            p.name.toLowerCase().trim() === formValue.name.toLowerCase().trim(),
        );
 
        if (existingProduct) {
          const { zoneName, categoryName, supplierName, ...cleanExisting } = existingProduct;
 
          const updatedWithBatch = {
            ...cleanExisting,
            supplierids: formValue.supplierids,
            inventory: [
              ...cleanExisting.inventory,
              { quantity: formValue.quantity, expirydate: formValue.expirydate ,price:formValue.price},
            ],
          };
 
          this.productService
            .updateProduct(existingProduct.id, updatedWithBatch)
            .subscribe({
              next: () => this.handleSuccess(`New batch added to ${existingProduct.name}`),
              error: (err) => this.handleApiError(err), // NEW
            });
          this.activityService.updateActivity(updatedWithBatch.name,`A new ${updatedWithBatch.name} batch added to Inventory`).subscribe()
        } else {
          const { quantity, expirydate,price, ...baseProductData } = formValue;
 
          const newProduct = {
            ...baseProductData,
            inventory: [
              { quantity: formValue.quantity, expirydate: formValue.expirydate ,price: formValue.price},
            ],
          };
 
          this.productService.addProduct(newProduct).subscribe({
            next: (result) => {
              if (result.supplierids && result.supplierids.length > 0) {
                this.supplierService.matchSupplierWithProduct(result.id, result.supplierids);
              }
              this.handleSuccess('New product added to the inventory');
            },
            error: (err) => this.handleApiError(err), // NEW
          });
 
            this.activityService.updateActivity(newProduct.name,`A new product  ${newProduct.name}  added to Inventory`).subscribe()
        }
      }
    }
  }
 
  onDeleteProdcut(product: ProductWithNames) {
    Swal.fire({
      title: `Delete ${product.name}?`,
      text: 'This will remove all batches and cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (result.isConfirmed) {
        const previousData = this.products();
        this.products.update((prev) => prev.filter((p) => p.id !== product.id));
 
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.supplierService.removeProductFromSuppliers(product.id, product.supplierids);
            Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
          },
          error: () => {
            this.products.set(previousData);
            Swal.fire('Error', 'Server connection failed. Item restored.', 'error');
          },
        });
 
          this.activityService.updateActivity(product.name,` ${product.name} product has deleted from Inventory`).subscribe()
      }
    });
  }
 
  openEdit(product: ProductWithNames) {
    this.editingProductId.set(product.id);
    this.showModal.set(true);
    this.productForm.patchValue(product);
    this.productForm.get('quantity')?.disable();
    this.productForm.get('expirydate')?.disable();
    this.productForm.get('price')?.disable();
  }
 
  closeModal() {
    this.showModal.set(false);
    this.editingProductId.set('');
    this.zoneCapacityError.set(null); // NEW: clear on close
    this.currentStockForPrediction.set(0);
    this.productForm.reset({
      supplierids: [],
      categoryid: this.categoryId(),
      zoneid: this.zoneId(),
      quantity: 0,
      price: 0,
    });
    this.productForm.get('quantity')?.enable();
    this.productForm.get('expirydate')?.enable();
    this.productForm.get('price')?.enable();
  }
 
  openModal() {
    this.productForm.patchValue({
      categoryid: this.categoryId(),
      zoneid: this.zoneId(),
    });
    this.showModal.set(true);
  }
 
  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery.set(inputElement.value);
  }
 
  getTotalQuantity(inventory: InventoryBatch[]): number {
    return inventory
      ? inventory.reduce((sum, batch) => sum + batch.quantity, 0)
      : 0;
  }
 
  getNearestExpiry(inventory: InventoryBatch[]): string {
    if (!inventory || inventory.length === 0) return '';
    const dates = inventory.map((b) => new Date(b.expirydate).getTime());
    return new Date(Math.min(...dates)).toISOString();
  }
 
 getBatchClass(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
 
  if (diffDays < 0)  return 'bg-danger text-white border-danger';        // EXPIRED — solid red
  if (diffDays <= 7) return 'bg-danger-subtle text-danger border-danger-subtle';   // expiring soon
  if (diffDays <= 30) return 'bg-warning-subtle text-warning border-warning-subtle'; // expiring
  return 'bg-light text-secondary border-light-subtle';
}
  getTotalValue(inventory: InventoryBatch[]): number {
  return inventory
    ? inventory.reduce((sum, batch) => sum + (batch.quantity * (batch.price || 0)), 0)
    : 0;
}
} 
 