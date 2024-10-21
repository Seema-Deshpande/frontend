import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {jwtDecode} from  'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Replace with your API URL
  private tokenKey = 'authToken';
  private usernameKey = 'username';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setUsername(username);
          this.isLoggedInSubject.next(true);
        })
      );
  }

  logout(): Observable<any> {
    const token = this.getToken();

    if (!token) {
      // If no token, just logout locally
      this.removeToken();
      this.isLoggedInSubject.next(false);
      return new Observable(observer => {
        observer.next({ message: 'Logged out locally' });
        observer.complete();
      });
    }

    return this.http.post<any>(`${this.apiUrl}/logout`, { token })
      .pipe(
        tap(() => {
          this.removeToken();
          this.isLoggedInSubject.next(false);
        })
      );
  }


  private setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private setUsername(username: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.usernameKey, username);
    }
  }

  // Method to retrieve username from localStorage
  getUsername(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.usernameKey);
    }
    return null;
  }

  private removeToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.tokenKey);
    }
  }
  getUserId(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      const decodedToken: any = jwtDecode(token); // Decode the token
      return decodedToken.userId; // Assuming your token contains the user ID in 'id'
    }
    return null;
  }
  private hasToken(): boolean {
    return !!this.getToken();
  }

  getProfile(): Observable<any> {
    const userId = this.getUserId();
    return this.http.get<any>(`${this.apiUrl}/profile/${userId}`);
  }

  updateProfile(updatedData: object): Observable<any> {
    const userId = this.getUserId()
    return this.http.put<any>(`${this.apiUrl}/profile/${userId}`, updatedData)
      .pipe(
        tap(response => {
          // Assuming the response contains the updated profile data
          if (response && response.username) {
            this.setUsername(response.username);
          }
        })
      );
  }
}
