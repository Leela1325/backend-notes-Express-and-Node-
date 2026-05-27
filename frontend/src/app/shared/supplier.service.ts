import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SupplierDaoService } from '../dao/supplierdao.service';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  constructor(private supplierDao: SupplierDaoService) {}

  getAllSuppliers(): Observable<Supplier[]> {
    return this.supplierDao.getAllSuppliers();
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.supplierDao.getSupplierById(id);
  }

  getSuppliersByIds(ids: string[]): Observable<Supplier[]> {
    return this.supplierDao.getSuppliersByIds(ids);
  }
}
