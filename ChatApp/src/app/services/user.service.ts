import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  url = 'http://localhost:5243/api';
  private tokenKey = 'auth_token';

  signup(user: any): Observable<any> {
    return this.http.post(this.url + '/register', user);
  }

  login(user: any): Observable<any> {
    return this.http.post(this.url + '/login', user);
  }

  // Save the token to local storage
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Retrieve the token from local storage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Remove the token from local storage
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  retrieveUsers(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    });
    return this.http.get<any[]>(this.url + '/users', { headers: headers });
  }

  getLoggedInUser(): number {
    const decodedToken: any = jwt_decode(this.getToken()!.toString());
    const id =
      decodedToken[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];

    return +id;
  }
}
