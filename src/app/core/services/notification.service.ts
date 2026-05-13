import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { map, share } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messages = [
    'Nueva entrega asignada: PKG-00X',
    'Alerta de tráfico en Zona Norte',
    'Entrega PKG-00X marcada como completada',
    'Paquete en camino a destino',
  ];

  readonly notifications$ = interval(8000).pipe(
    map(() => this.messages[Math.floor(Math.random() * this.messages.length)]),
    share()
  );
}