import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParkingSlot {
  _id?: string;
  code: string;
  status: 'free' | 'reserved' | 'occupied';
  managerId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  createParking(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/parking`, data);
  }

  getParkingSlots(): Observable<ParkingSlot[]> {
    return this.http.get<ParkingSlot[]>(`${this.apiUrl}/parking`);
  }

  updateParking(id: string, data: Partial<ParkingSlot>): Observable<ParkingSlot> {
    return this.http.put<ParkingSlot>(`${this.apiUrl}/parking/${id}`, data);
  }

  deleteParking(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/parking/${id}`);
  }

  searchParking(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/parking/search`, { params: { q: query } });
  }

  getParkingSlotsDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/parking/slots`);
  }
}