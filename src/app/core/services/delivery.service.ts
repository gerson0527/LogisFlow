import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError, switchMap } from 'rxjs/operators';
import { Delivery, DeliveryStatus } from '../models/delivery.model';
import { User } from '../models/user.model';
import { MOCK_DELIVERIES } from './mock-data';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private http = inject(HttpClient);

  private _deliveries = signal<Delivery[]>(MOCK_DELIVERIES);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly deliveries = this._deliveries.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  fetchDeliveriesFromApi(): Observable<Delivery[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Delivery[]>('/api/deliveries').pipe(
      tap(deliveries => {
        this._deliveries.set(deliveries);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        this._error.set('Usando datos locales');
        return of(MOCK_DELIVERIES);
      })
    );
  }

  getDeliveriesForUser(user: User): Delivery[] {
    if (user.role === 'ADMIN') return this._deliveries();
    return this._deliveries().filter(d => d.driverId === user.id);
  }

  updateStatus(deliveryId: string, newStatus: DeliveryStatus): Observable<void> {
    return this.http.patch<void>(`/api/deliveries/${deliveryId}`, { status: newStatus }).pipe(
      tap(() => {
        this._deliveries.update(deliveries =>
          deliveries.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d)
        );
      }),
      catchError(err => {
        console.warn('[DeliveryService] API call failed, updating local state only');
        this._deliveries.update(deliveries =>
          deliveries.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d)
        );
        return of(void 0);
      })
    );
  }

  clearError(): void {
    this._error.set(null);
  }

  getDeliveriesCount(user: User): number {
    return this.getDeliveriesForUser(user).length;
  }

  getPendingCount(user: User): number {
    return this.getDeliveriesForUser(user).filter(d => d.status === 'PENDING').length;
  }

  getInTransitCount(user: User): number {
    return this.getDeliveriesForUser(user).filter(d => d.status === 'IN_TRANSIT').length;
  }

  getDeliveredCount(user: User): number {
    return this.getDeliveriesForUser(user).filter(d => d.status === 'DELIVERED').length;
  }
}