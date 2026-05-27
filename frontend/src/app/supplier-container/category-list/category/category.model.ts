import { Supplier } from "../../supplier-list/supplier/supplier.model"

export interface Category{
    id:string,
    name:string,
    zoneid:string,
    description:string
}

export interface CategoryWithSuppliers extends Category{
    suppliers:Supplier[]
}