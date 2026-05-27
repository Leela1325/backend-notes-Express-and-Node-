import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CreateStaff {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4040/user'; // change to your URL

  createStaff(staff: {
    name: string;
    email: string;
    password: string;
    token: string;
  }): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.baseUrl}/Signup`, staff);
  }
}