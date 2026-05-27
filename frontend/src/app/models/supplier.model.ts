import { Product } from "./product.model"

export interface Supplier{

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