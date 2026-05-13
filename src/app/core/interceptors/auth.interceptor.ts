import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MOCK_USERS } from '../services/mock-data';
import { User } from '../models/user.model';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    console.log(`[AuthInterceptor] No token found for: ${req.method} ${req.url}`);
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log(`[AuthInterceptor] Token attached: ${req.method} ${req.url}`);
  return next(authReq);
};

export const mockApiInterceptorFn: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/deliveries') && req.method === 'GET') {
    console.log(`[MockAPI] GET /api/deliveries`);
    return of(new HttpResponse({
      status: 200,
      body: { deliveries: [] }
    })).pipe(delay(400));
  }

  if (req.url.match(/\/api\/deliveries\/.+/) && req.method === 'PATCH') {
    const deliveryId = req.url.split('/').pop();
    console.log(`[MockAPI] PATCH /api/deliveries/${deliveryId}`);
    return of(new HttpResponse({
      status: 200,
      body: { id: deliveryId, updated: true }
    })).pipe(delay(400));
  }

  if (req.url.includes('/api/auth/login') && req.method === 'POST') {
    const { username, password } = req.body as { username: string; password: string };
    console.log(`[MockAPI] POST /api/auth/login - user: ${username}`);

    const user = MOCK_USERS.find(u => u.username === username && u.password === password);

    if (user) {
      const token = `mock-token-${user.id}-${Date.now()}`;
      return of(new HttpResponse({
        status: 200,
        body: { user, token }
      })).pipe(delay(600));
    }

    console.log(`[MockAPI] Login failed for: ${username}`);
    return of(new HttpResponse({
      status: 401,
      body: { error: 'Credenciales inválidas' }
    }));
  }

  if (req.url.includes('/api/auth/validate') && req.method === 'POST') {
    console.log(`[MockAPI] POST /api/auth/validate`);
    return of(new HttpResponse({
      status: 200,
      body: { valid: true, timestamp: Date.now() }
    })).pipe(delay(200));
  }

  console.log(`[MockAPI] Passing through: ${req.method} ${req.url}`);
  return next(req);
};

export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        console.log(`[ErrorInterceptor] Response ${event.status}: ${req.url}`);
      }
      return event;
    })
  );
};