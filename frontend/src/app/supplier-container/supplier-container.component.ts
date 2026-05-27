import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { SupplierService } from './supplier-list/supplier/supplier.service';
import { Supplier } from './supplier-list/supplier/supplier.model';

@Component({
  selector: 'app-supplier-container',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './supplier-container.component.html',
  styleUrl: './supplier-container.component.scss'
})
export class SupplierContainerComponent {

    
}
