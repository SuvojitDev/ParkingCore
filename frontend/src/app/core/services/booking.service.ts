import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  _id: string;
  parkingId: { _id: string; code: string; };
  userId: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:5000/api/bookings';

  constructor(private http: HttpClient) { }

  createBooking(bookingData: { parkingId: string; startTime: string; endTime: string; }): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, bookingData);
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  updateBookingStatus(id: string, status: 'cancelled' | 'completed'): Observable<Booking> {
    const url = `${this.apiUrl}/${id}/status`;
    return this.http.patch<Booking>(url, { status });
  }
}