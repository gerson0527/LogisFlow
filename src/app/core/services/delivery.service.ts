import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { Delivery, DeliveryStatus } from '../models/delivery.model';
import { User } from '../models/user.model';
import { MOCK_DELIVERIES } from './mock-data';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private _deliveries = signal<Delivery[]>(MOCK_DELIVERIES);
  readonly deliveries = this._deliveries.asReadonly();

  getDeliveriesForUser(user: User): Delivery[] {
    if (user.role === 'ADMIN') return this._deliveries();
    return this._deliveries().filter(d => d.driverId === user.id);
  }

  updateStatus(deliveryId: string, newStatus: DeliveryStatus): Observable<void> {
    return of(void 0).pipe(
      delay(400),
      tap(() => {
        this._deliveries.update(deliveries =>
          deliveries.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d)
        );
      }),
      catchError(() => throwError(new Error('Error al actualizar el estado')))
    );
  }
}