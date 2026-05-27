import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductDaoService } from '../dao/productdao.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private productDao: ProductDaoService) {}

  getAllProducts(): Observable<Product[]> {
    return this.productDao.getAllProducts();
  }

  getProductByName(name: string): Observable<Product[]> {
    return this.productDao.getProductByName(name);
  }
  getProductById(id: string): Observable<Product> {
  return this.productDao.getProductById(id);
}

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.productDao.updateProduct(id, product);
  }
}
