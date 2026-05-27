import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { UserData } from './user.model';

interface LoginResponse {
  token: string;
  user: UserData;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4040/auth';

  private emptyUser: UserData = { name: '', email: '', role: '' };

  userData = new BehaviorSubject<UserData>(this.emptyUser);
  userData$ = this.userData.asObservable();

  constructor() {
    
    const stored = localStorage.getItem('userData');
    const token = this.getToken();

    if (stored && token) {
      try {
        const parsed: UserData = JSON.parse(stored);
        this.userData.next(parsed);
      } catch {
       
        this.logOut();
      }
    }
  }

  get getAccess(): boolean {
    return !!this.getToken();
  }

 
  login(credentials: { email: string; password: string }): Observable<UserData> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, {
        email: credentials.email.toLowerCase(),
        password: credentials.password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('userData', JSON.stringify(res.user));
          this.userData.next(res.user);
        }),
        map((res) => res.user),
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

 
  getRole(): string {
    return this.userData.value.role;
  }

  logOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.userData.next(this.emptyUser);
  }
}