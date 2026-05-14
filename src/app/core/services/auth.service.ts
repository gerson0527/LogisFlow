import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { MOCK_USERS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  constructor(private router: Router, private http: HttpClient) {
    this.loadFromStorage();
  }

  login(username: string, password: string): Observable<User> {

    return this.http.post<{ user: User; token: string }>('/api/auth/login', {
      username,
      password
    }).pipe(
      tap(response => {
        this.saveSession(response.user, response.token);
      }),
      map(response => response.user),
      catchError(err => {
        return this.mockLogin(username, password);
      })
    );
  }

  private mockLogin(username: string, password: string): Observable<User> {
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!user) {
      return throwError(() => new Error('Credenciales inválidas'));
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    this.saveSession(user, token);
    return of(user).pipe(delay(600));
  }

  private saveSession(user: User, token: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    this._currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  loadFromStorage(): void {
    const stored = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    if (stored && token) {
      this._currentUser.set(JSON.parse(stored));
    }
  }

  validateSession(): Observable<boolean> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return of(false);
    }

    return this.http.post<{ valid: boolean }>('/api/auth/validate', {}).pipe(
      map(response => response.valid),
      catchError(() => of(false))
    );
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isTokenValid(): boolean {
    return this.getToken() !== null;
  }
}