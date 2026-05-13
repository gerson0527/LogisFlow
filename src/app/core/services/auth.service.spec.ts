import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User, Role } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    const mockRouter = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('debe retornar Observable con usuario válido', (done) => {
      service.login('admin', 'admin123').subscribe(user => {
        expect(user).toBeDefined();
        expect(user.username).toBe('admin');
        done();
      });
    });

    it('debe establecer el usuario actual tras login exitoso', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        expect(service.currentUser()).not.toBeNull();
        expect(service.currentUser()?.username).toBe('admin');
        done();
      });
    });

    it('debe establecer isAuthenticated como true tras login', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });
    });

    it('debe establecer isAdmin como true para admin', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        expect(service.isAdmin()).toBe(true);
        done();
      });
    });

    it('debe establecer isAdmin como false para driver', (done) => {
      service.login('driver1', 'driver123').subscribe(() => {
        expect(service.isAdmin()).toBe(false);
        done();
      });
    });

    it('debe guardar token en localStorage', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        const token = localStorage.getItem('auth_token');
        expect(token).toBeTruthy();
        expect(token).toContain('mock-token');
        done();
      });
    });

    it('debe guardar usuario en localStorage', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        const user = localStorage.getItem('auth_user');
        expect(user).toBeTruthy();
        const parsedUser = JSON.parse(user!);
        expect(parsedUser.username).toBe('admin');
        done();
      });
    });

    it('debe fallar con credenciales inválidas', (done) => {
      service.login('invalid', 'invalid').subscribe({
        error: (err) => {
          expect(err).toBeDefined();
          expect(err.message).toBe('Credenciales inválidas');
          done();
        }
      });
    });

    it('debe fallar con contraseña incorrecta', (done) => {
      service.login('admin', 'wrongpassword').subscribe({
        error: (err) => {
          expect(err.message).toBe('Credenciales inválidas');
          done();
        }
      });
    });

    it('debe fallar con usuario vacío', (done) => {
      service.login('', '').subscribe({
        error: (err) => {
          expect(err.message).toBe('Credenciales inválidas');
          done();
        }
      });
    });

    it('no debe establecer usuario si las credenciales son inválidas', (done) => {
      service.login('invalid', 'invalid').subscribe({
        error: () => {
          expect(service.currentUser()).toBeNull();
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });
    });
  });

  describe('logout', () => {
    it('debe limpiar el usuario actual', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        service.logout();
        expect(service.currentUser()).toBeNull();
        done();
      });
    });

    it('debe establecer isAuthenticated como false', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        service.logout();
        expect(service.isAuthenticated()).toBe(false);
        done();
      });
    });

    it('debe limpiar localStorage', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        service.logout();
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_user')).toBeNull();
        done();
      });
    });
  });

  describe('loadFromStorage', () => {
    it('debe cargar usuario desde localStorage al inicializar', () => {
      const mockUser: User = {
        id: 'u1',
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN' as Role,
        name: 'Test Admin'
      };
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      const newService = new AuthService(TestBed.inject(Router));
      expect(newService.currentUser()).not.toBeNull();
      expect(newService.currentUser()?.username).toBe('admin');
    });

    it('no debe cargar nada si no hay datos en localStorage', () => {
      localStorage.clear();
      const newService = new AuthService(TestBed.inject(Router));
      expect(newService.currentUser()).toBeNull();
    });
  });

  describe('signals', () => {
    it('currentUser debe ser readonly', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        expect(() => {
          (service as any).currentUser.set(null);
        }).toThrow();
        done();
      });
    });

    it('isAuthenticated debe ser computed', (done) => {
      expect(service.isAuthenticated()).toBe(false);
      service.login('admin', 'admin123').subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });
    });

    it('isAdmin debe ser computed', (done) => {
      expect(service.isAdmin()).toBe(false);
      service.login('admin', 'admin123').subscribe(() => {
        expect(service.isAdmin()).toBe(true);
        done();
      });
    });
  });
});