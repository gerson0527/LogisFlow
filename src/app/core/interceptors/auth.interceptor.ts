import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { MOCK_USERS } from '../services/mock-data';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};

export const mockApiInterceptorFn: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/auth/login') && req.method === 'POST') {
    const body = req.body as { username?: string; password?: string };
    const { username, password } = body || {};

    const user = MOCK_USERS.find(u => u.username === username && u.password === password);

    if (user) {
      const token = `mock-token-${user.id}-${Date.now()}`;
      return of(new HttpResponse({
        status: 200,
        body: { user, token }
      }));
    }

    return throwError(() => new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: { message: 'Credenciales inválidas' }
    }));
  }

  if (req.url.includes('/api/deliveries') && req.method === 'GET') {
    return of(new HttpResponse({
      status: 200,
      body: []
    })).pipe(delay(400));
  }

  if (req.url.match(/\/api\/deliveries\/.+/) && req.method === 'PATCH') {
    const deliveryId = req.url.split('/').pop();
    return of(new HttpResponse({
      status: 200,
      body: { id: deliveryId, updated: true }
    })).pipe(delay(400));
  }

  if (req.url.includes('/api/auth/validate') && req.method === 'POST') {
    return of(new HttpResponse({
      status: 200,
      body: { valid: true, timestamp: Date.now() }
    }));
  }

  return next(req);
};

export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      return throwError(() => error);
    })
  );
};