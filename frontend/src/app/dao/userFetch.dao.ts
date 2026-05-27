import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../login/user.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserFetchDao {
  http = inject(HttpClient);

  getUser(email: string): Observable<User[]> {
    // this.getUseer();
    console.log('staff', email);

    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    let params = new HttpParams().set('email', email);
    return this.http
      .get<User[]>(`http://localhost:3000/users`, {
        params,
        headers,
      })
      .pipe(tap((data) => console.log(data)));
  }
  getUseer() {
    this.http
      .get<User>('http://localhost:3000/users?email=admin@example.com')
      .subscribe((data) => {
        console.log(data);
      });
  }
}
