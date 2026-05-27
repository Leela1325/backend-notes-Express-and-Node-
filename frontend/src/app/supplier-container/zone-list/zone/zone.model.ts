import { Category } from "../../category-list/category/category.model"
import { Supplier } from "../../supplier-list/supplier/supplier.model"

export interface Zone{
    id:string,
    name:string,
    maxcapacity:number,
    currentcapacity:number,
    availablecapacity:number
}
export interface ZoneWithSupplierAndCategories extends Zone{
    categories:Category[],
    suppliers:Supplier[]
}