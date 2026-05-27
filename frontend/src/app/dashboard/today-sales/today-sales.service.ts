import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export interface todaySalesSummary
{
    date : Date ;
    totalQuantity : number ;
    totalRevenue : number ;

}
@Injectable({
    providedIn : "root"
})
export class TodaySalesService {
    constructor (private http : HttpClient) {}

    private salesData$ =  this.http.get<todaySalesSummary>("http://localhost:4040/dashboard/todaySalesSummary") ;

    getTodaySalesSummary ()
    {
        return this.salesData$ ;
    }
}