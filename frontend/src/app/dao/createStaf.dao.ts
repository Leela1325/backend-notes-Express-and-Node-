import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

 @Injectable(
    {
        providedIn : 'root' 
    }
 )
 export class CreateStaffDao {
    http = inject(HttpClient) ;
    postUser(userData :  {name ?: string , email ?: string , password ?: string })
    {
       return  this.http.post('http://localhost:4040/users' , {...userData , role : 'staff' } , {observe : 'response'}) ;
    }
 }