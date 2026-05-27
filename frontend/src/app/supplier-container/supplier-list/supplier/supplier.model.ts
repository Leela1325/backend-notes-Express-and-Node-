import { Product } from "../../../models/product.model"

export interface Supplier{
    length(arg0: string, length: any, arg2: any): void

    id:string,
    name:string,
    contact:string,
    address:string,
    performance:string,
    email:string,
    zoneid:string,
    categoryid:string,
    active:boolean,
    rating:number,
    productids:string[]
}
export interface SupplierWithProducts extends Supplier{
    products:Product[]
}

export interface SupplierWithoutId {
    name:string,
    contact:string,
    address:string,
    performance:string,
    email:string,
    zoneid:string,
    categoryid:string,
    active:boolean,
    rating:number,
    productids:string[]
}