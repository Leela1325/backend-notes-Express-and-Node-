export interface Category{
    id:string,
    name:string,
    zoneid:string,
    description:string
}
export interface CategoryWithDetails extends Category{
    productCount:number,
    zoneName:string
}