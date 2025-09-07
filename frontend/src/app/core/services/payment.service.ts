import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentRequest {
  bookingId: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  nameOnCard: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5000/api/payment';

  constructor(private http: HttpClient) {}

  processPayment(data: PaymentRequest): Observable<any> {
    return this.http.post<PaymentResponse>(this.apiUrl, data);
  }
}