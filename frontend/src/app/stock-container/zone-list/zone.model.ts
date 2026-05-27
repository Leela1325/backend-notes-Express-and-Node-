export interface Zone{
    id:string,
    name:string,
    maxcapacity:number,
    currentcapacity:number,
    availablecapacity:number
}
export interface ZoneWithCounts extends Zone{
    categoryCount:number,
    productCount:number,
    status:string
}