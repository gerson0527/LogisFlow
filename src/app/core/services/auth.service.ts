import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/user.model';
import { MOCK_USERS } from './mock-data';
import { signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  constructor(private router: Router) {
    this.loadFromStorage();
  }

  login(username: string, password: string): Observable<User> {
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!user) return throwError(new Error('Credenciales inválidas'));
    const token = `mock-token-${user.id}-${Date.now()}`;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    this._currentUser.set(user);
    return of(user).pipe(delay(600));
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  loadFromStorage(): void {
    const stored = localStorage.getItem('auth_user');
    if (stored) this._currentUser.set(JSON.parse(stored));
  }
}