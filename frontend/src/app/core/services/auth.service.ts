import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs'; // Import BehaviorSubject

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  // 1. Create BehaviorSubjects to hold the current state
  private loggedInStatus = new BehaviorSubject<boolean>(this.isLoggedIn());
  private userRole = new BehaviorSubject<string | null>(this.getRole());
  private userName = new BehaviorSubject<string | null>(this.getUserName());

  // 2. Expose them as Observables for components to subscribe to
  loggedIn$ = this.loggedInStatus.asObservable();
  userRole$ = this.userRole.asObservable();
  userName$ = this.userName.asObservable();

  constructor(private http: HttpClient) { }

  login(payload: any): Observable<any> {
    // Assuming your login endpoint is something like this
    return this.http.post<any>(`${this.apiUrl}/login`, payload);
  }

  register(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, payload);
  }

  setSession(token: string, role: string, userName: string): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('role', role);
    sessionStorage.setItem('userName', userName);

    // 3. Notify all subscribers that the user is logged in and what their role is
    this.loggedInStatus.next(true);
    this.userRole.next(role);
    this.userName.next(userName);
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');

    // 4. Notify all subscribers that the user has logged out
    this.loggedInStatus.next(false);
    this.userRole.next(null);
    this.userName.next(null);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getRole(): string | null {
    return sessionStorage.getItem('role');
  }

  getUserName(): string | null {
    return sessionStorage.getItem('userName');
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { password });
  }

  changePassword(current: string, newPass: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, {
      currentPassword: current,
      newPassword: newPass
    });
  }
}