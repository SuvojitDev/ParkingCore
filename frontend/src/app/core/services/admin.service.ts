import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define interfaces for your data models for type safety
export interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Customer';
  password?: string;
}

export interface Booking {
  _id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5000/api'; // Your backend URL

  constructor(
    private http: HttpClient
  ) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  // updateUser(id: string, user: User): Observable<User> {
  //   return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  // }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, data);
  }

  updateUserRole(id: string, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
  }
  
  getManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/managers`);
  }
}