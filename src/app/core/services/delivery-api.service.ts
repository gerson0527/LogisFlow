import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, delay, tap, map } from 'rxjs/operators';
import { Delivery, DeliveryStatus } from '../models/delivery.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class DeliveryApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) { }

  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries`).pipe(
      map(deliveries => {
        return deliveries;
      }),
      catchError(this.handleError)
    );
  }

  updateDeliveryStatus(deliveryId: string, status: DeliveryStatus): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/deliveries/${deliveryId}`, { status }).pipe(
      map(() => {
      }),
      catchError(this.handleError)
    );
  }

  validateToken(): Observable<{ valid: boolean; timestamp: number }> {
    return this.http.post<{ valid: boolean; timestamp: number }>(
      `${this.baseUrl}/auth/validate`,
      {}
    ).pipe(
      map(response => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
          break;
        case 401:
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error(`[DeliveryApiService] HTTP Error: ${errorMessage}`, error);
    return throwError(() => new Error(errorMessage));
  }
}