# LogisFlow - Documentación Completa del Proyecto

Angular 21 + Tailwind CSS v3 + Señales (Signals) + Interceptors Funcionales

---

## Tabla de Contenidos

1. [Arquitectura General](#1-arquitectura-general)
2. [Entry Point - main.ts](#2-entry-point---mainttsrc-maints)
3. [Configuración de la App - app.config.ts](#3-configuración-de-la-app---appconfigts)
4. [Rutas - app.routes.ts](#4-rutas---approutests)
5. [Modelo de Usuario - user.model.ts](#5-modelo-de-usuario---usermodelts)
6. [Modelo de Delivery - delivery.model.ts](#6-modelo-de-delivery---deliverymodelts)
7. [Mock Data - mock-data.ts](#7-mock-data---mock-datats)
8. [Auth Service - auth.service.ts](#8-auth-service---authservicets)
9. [Delivery Service - delivery.service.ts](#9-delivery-service---deliveryservicets)
10. [Delivery API Service - delivery-api.service.ts](#10-delivery-api-service---delivery-apiservicets)
11. [Notification Service - notification.service.ts](#11-notification-service---notificationservicets)
12. [Auth Guard - auth.guard.ts](#12-auth-guard---authguardts)
13. [Interceptors - auth.interceptor.ts](#13-interceptors---authinterceptorts)
14. [Login Component](#14-login-component)
15. [Dashboard Component](#15-dashboard-component)
16. [Delivery List Component](#16-delivery-list-component)
17. [Confirm Dialog Component](#17-confirm-dialog-component)
18. [Notification Toast Component](#18-notification-toast-component)
19. [Pagination Component](#19-pagination-component)
20. [Flujo de Datos Completo](#20-flujo-de-datos-completo)
21. [Credenciales de Prueba](#21-credenciales-de-prueba)

---

## 1. Arquitectura General

### Stack Tecnológico
- **Angular 21** con componentes standalone
- **Angular Signals** para estado reactivo
- **Tailwind CSS v3** para estilos
- **Angular Animations** para transiciones
- **Interceptors funcionales** (Angular 15+)
- **Lazy Loading** para rutas

### Estructura de Carpetas
```
src/app/
├── core/
│   ├── guards/       → AuthGuard
│   ├── interceptors/ → 3 interceptores funcionales
│   ├── models/       → User, Delivery
│   └── services/     → Auth, Delivery, Notification, API
├── features/
│   ├── auth/login/   → Login
│   └── board/        → Dashboard, DeliveryList
├── shared/
│   └── components/   → ConfirmDialog, NotificationToast, Pagination
├── app.config.ts
├── app.routes.ts
└── app.component.ts
```

### Patrones de Diseño Usados
- **Standalone Components**: Sin NgModules, todo usa array `imports`
- **Angular Signals**: Estado reactivo en servicios y componentes
- **Functional Guards/Interceptors**: Patrones modernos Angular 15+
- **Lazy Loading**: Code splitting por ruta
- **Smart/Dumb Components**: Componentes reutilizables separados

---

## 2. Entry Point - main.ts (`src/main.ts`)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### ¿Qué hace?
- Punto de entrada de la aplicación Angular
- Usa `bootstrapApplication` (Angular standalone, no NgModule)
- Recibe `appConfig` que contiene todos los providers
- Recibe `AppComponent` como componente raíz

### Decisión de Diseño
- No usa `platformBrowserDynamic().bootstrapModule()` (patrón antiguo)
- Patrón standalone para Angular 17+

---

## 3. Configuración de la App - app.config.ts (`src/app/app.config.ts`)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptorFn,      // 1. Adjunta token JWT
        mockApiInterceptorFn,   // 2. Simula API responses
        errorInterceptorFn      // 3. Maneja errores HTTP
      ])
    ),
    provideAnimations()
  ]
};
```

### Providers Configurados

| Provider | Función |
|----------|---------|
| `provideRouter(routes)` | Configura el enrutador con las rutas definidas |
| `provideHttpClient(withInterceptors([...]))` | Configura HTTP con 3 interceptores encadenados |
| `provideAnimations()` | Habilita animaciones de Angular |

### Orden de Interceptores (Importante)
1. **authInterceptorFn** → Primero: adjunta token a requests salientes
2. **mockApiInterceptorFn** → Segundo: intercepta llamadas y retorna mock data
3. **errorInterceptorFn** → Tercero: captura errores y limpia sesión en 401

### Interceptor 1: authInterceptorFn
```typescript
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  return next(req);
};
```

### Interceptor 2: mockApiInterceptorFn
```typescript
export const mockApiInterceptorFn: HttpInterceptorFn = (req, next) => {
  // POST /api/auth/login → mock login response
  if (req.method === 'POST' && req.url.includes('/api/auth/login')) {
    return of(mockLogin(req)).pipe(delay(800));
  }
  // GET /api/deliveries → mock deliveries (empty, real API handles data)
  if (req.method === 'GET' && req.url.includes('/api/deliveries')) {
    return of(mockDeliveries).pipe(delay(600));
  }
  // PATCH /api/deliveries/:id → mock success
  if (req.method === 'PATCH' && req.url.includes('/api/deliveries/')) {
    return of({ success: true }).pipe(delay(500));
  }
  return next(req);
};
```

### Interceptor 3: errorInterceptorFn
```typescript
export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      }
      return throwError(() => error);
    })
  );
};
```

### Decisión de Diseño
- **Interceptores funcionales** (HttpInterceptorFn) en lugar de clases basadas en HttpInterceptor
- Encadenamiento en orden específico para flujo correcto

---

## 4. Rutas - app.routes.ts (`src/app/app.routes.ts`)

```typescript
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/board/board.routes')
      .then(m => m.boardRoutes)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
```

### Explicación de Rutas

| Ruta | Tipo | Protección | Descripción |
|------|------|------------|-------------|
| `/login` | Lazy | No | Página de login (público) |
| `/dashboard` | Lazy | **AuthGuard** | Dashboard con entrega/board anidado |
| `''` | Static | No | Redirige a `/login` |

### Lazy Loading
```typescript
loadComponent: () => import('./features/auth/login/login.component')
  .then(m => m.LoginComponent)
```
- Carga el componente solo cuando se necesita
- Reduce bundle inicial

### authGuard
```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
```
- Verifica si el usuario está autenticado
- Si NO → redirige a `/login`
- Si SÍ → permite acceso

---

## 5. Modelo de Usuario - user.model.ts (`src/app/core/models/user.model.ts`)

```typescript
export type Role = 'ADMIN' | 'DRIVER';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  name: string;
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | string | Identificador único |
| `username` | string | Nombre de usuario para login |
| `password` | string | Contraseña (en mock data) |
| `role` | Role | Rol: ADMIN o DRIVER |
| `name` | string | Nombre completo para mostrar |

### Roles Definidos

```typescript
export type Role = 'ADMIN' | 'DRIVER';
```

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Ve todas las entregas, puede actualizar cualquier estado |
| **DRIVER** | Ve solo sus entregas asignadas, solo puede cambiar PENDING → DELIVERED |

---

## 6. Modelo de Delivery - delivery.model.ts (`src/app/core/models/delivery.model.ts`)

```typescript
export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';

export interface Delivery {
  id: string;
  packageCode: string;
  destination: string;
  driverId: string;
  status: DeliveryStatus;
  assignedAt: string;
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | string | Identificador único de la entrega |
| `packageCode` | string | Código del paquete (ej: PKG-0001) |
| `destination` | string | Dirección de destino |
| `driverId` | string | ID del conductor asignado |
| `status` | DeliveryStatus | Estado actual |
| `assignedAt` | string | Fecha de asignación |

### Estados Posibles

```typescript
export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
```

| Estado | Traducción | Descripción |
|--------|------------|-------------|
| PENDING | Pendiente | Entrega asignada, no iniciada |
| IN_TRANSIT | En Camino | En proceso de entrega |
| DELIVERED | Entregada | Completada exitosamente |

---

## 7. Mock Data - mock-data.ts (`src/app/core/services/mock-data.ts`)

```typescript
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Administrador'
  },
  {
    id: 'u2',
    username: 'driver1',
    password: 'driver123',
    role: 'DRIVER',
    name: 'Conductor 1'
  },
  {
    id: 'u3',
    username: 'driver2',
    password: 'driver456',
    role: 'DRIVER',
    name: 'Conductor 2'
  }
];
```

### Usuarios Mock

| Username | Password | Rol | ID | Nombre |
|----------|----------|-----|-----|--------|
| admin | admin123 | ADMIN | u1 | Administrador |
| driver1 | driver123 | DRIVER | u2 | Conductor 1 |
| driver2 | driver456 | DRIVER | u3 | Conductor 2 |

### Generación de 150 Deliveries

```typescript
const generateMockDeliveries = (count: number): Delivery[] => {
  const statuses: DeliveryStatus[] = ['PENDING', 'IN_TRANSIT', 'DELIVERED'];
  const destinations = [
    'Av. Libertador 1234, Santiago',
    'Calle Mayor 567, Buenos Aires',
    'Av. 9 de Julio 890, Buenos Aires',
    // ... 20 direcciones predefinidas
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `del-${i + 1}`,
    packageCode: `PKG-${String(i + 1).padStart(4, '0')}`,
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    driverId: i < 75 ? 'u2' : 'u3',
    status: statuses[Math.floor(Math.random() * statuses.length)] as DeliveryStatus,
    assignedAt: generateDate(i)
  }));
};
```

### Decisión de Diseño
- Datos mock para desarrollo sin backend real
- 150 entregas para probar paginación
- Distribución aleatoria de estados y conductores

---

## 8. Auth Service - auth.service.ts (`src/app/core/services/auth.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signals - Estado reactivo
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  // Método principal de login
  async login(username: string, password: string): Promise<boolean> {
    this.loading.set(true);
    try {
      // 1. Intentar login HTTP real
      const response = await firstValueFrom(
        this.http.post<{ token: string; user: User }>(
          `${environment.apiUrl}/auth/login`,
          { username, password }
        )
      );
      // 2. Guardar token y usuario
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
      this.currentUser.set(response.user);
      return true;
    } catch {
      // 3. Fallback: mock login
      const mockUser = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );
      if (mockUser) {
        const fakeToken = `mock-token-${Date.now()}`;
        localStorage.setItem('auth_token', fakeToken);
        localStorage.setItem('current_user', JSON.stringify(mockUser));
        this.currentUser.set(mockUser);
        return true;
      }
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  loadFromStorage(): void {
    const userJson = localStorage.getItem('current_user');
    if (userJson) {
      this.currentUser.set(JSON.parse(userJson));
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isTokenValid(): boolean {
    return this.getToken() !== null;
  }
}
```

### Signals (Estado Reactivo)

| Signal | Tipo | Descripción |
|--------|------|-------------|
| `currentUser` | `signal<User \| null>` | Usuario autenticado actual |
| `isAuthenticated` | `computed<boolean>` | True si hay usuario (derivado de currentUser) |
| `isAdmin` | `computed<boolean>` | True si el usuario es ADMIN (derivado de currentUser) |

### Métodos Principales

| Método | Descripción | Retorna |
|--------|-------------|---------|
| `login(username, password)` | Autentica usuario | `Promise<boolean>` |
| `logout()` | Cierra sesión | void |
| `loadFromStorage()` | Restaura sesión de localStorage | void |
| `getToken()` | Obtiene JWT del localStorage | `string \| null` |
| `isTokenValid()` | Verifica si token existe | `boolean` |

### Flujo de Login
1. Intenta HTTP POST a `/api/auth/login`
2. Si falla → busca en MOCK_USERS
3. Si encuentra credenciales → guarda token + usuario en localStorage
4. Setea `currentUser` con signal
5. Retorna true/false

### Persistencia
- Usa `localStorage` para mantener sesión entre recargas de página
- `loadFromStorage()` se llama en `AppComponent` ngOnInit

---

## 9. Delivery Service - delivery.service.ts (`src/app/core/services/delivery.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class DeliveryService {
  // Signals
  deliveries = signal<Delivery[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Constructor inyecta AuthService
  constructor(private auth: AuthService) {
    this.loadFromStorage();
  }

  // Cargar entregas (API real o fallback mock)
  async fetchDeliveriesFromApi(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<Delivery[]>(`${environment.apiUrl}/deliveries`)
      );
      this.deliveries.set(data);
      this.saveToStorage(data);
    } catch {
      // Fallback: usar mock data
      this.deliveries.set(MOCK_DELIVERIES);
    } finally {
      this.loading.set(false);
    }
  }

  // Filtrar entregas por rol
  getDeliveriesForUser(user: User): Delivery[] {
    if (user.role === 'ADMIN') {
      return this.deliveries();
    }
    return this.deliveries().filter(d => d.driverId === user.id);
  }

  // Actualizar estado de entrega
  async updateStatus(deliveryId: string, status: DeliveryStatus): Promise<void> {
    const updated = this.deliveries().map(d =>
      d.id === deliveryId ? { ...d, status } : d
    );
    this.deliveries.set(updated); // Optimistic update
    try {
      await firstValueFrom(
        this.http.patch(
          `${environment.apiUrl}/deliveries/${deliveryId}`,
          { status }
        )
      );
    } catch {
      // Fallback: ya se actualizó localmente (optimistic)
    }
  }

  // Contadores por estado
  getPendingCount(): number {
    return this.deliveries().filter(d => d.status === 'PENDING').length;
  }
  getInTransitCount(): number {
    return this.deliveries().filter(d => d.status === 'IN_TRANSIT').length;
  }
  getDeliveredCount(): number {
    return this.deliveries().filter(d => d.status === 'DELIVERED').length;
  }

  // Persistencia local
  private saveToStorage(data: Delivery[]): void {
    localStorage.setItem('deliveries', JSON.stringify(data));
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('deliveries');
    if (stored) {
      this.deliveries.set(JSON.parse(stored));
    }
  }
}
```

### Signals

| Signal | Tipo | Descripción |
|--------|------|-------------|
| `deliveries` | `signal<Delivery[]>` | Array de todas las entregas |
| `loading` | `signal<boolean>` | Estado de carga |
| `error` | `signal<string \| null>` | Mensaje de error |

### Métodos Principales

| Método | Descripción | Retorna |
|--------|-------------|---------|
| `fetchDeliveriesFromApi()` | Carga entregas desde API o mock | `Promise<void>` |
| `getDeliveriesForUser(user)` | Filtra por rol (ADMIN ve todo, DRIVER solo lo suyo) | `Delivery[]` |
| `updateStatus(id, status)` | Actualiza estado de entrega | `Promise<void>` |
| `getPendingCount()` | Cuenta entregas PENDING | `number` |
| `getInTransitCount()` | Cuenta entregas IN_TRANSIT | `number` |
| `getDeliveredCount()` | Cuenta entregas DELIVERED | `number` |

### Decisiones de Diseño
- **Optimistic Updates**: Actualiza UI inmediatamente, luego hace request
- **Fallback a Mock**: Si API falla, usa MOCK_DELIVERIES
- **Persistencia Local**: Guarda entregas en localStorage
- **Filtrado por Rol**: ADMIN ve todo, DRIVER ve solo sus entregas

---

## 10. Delivery API Service - delivery-api.service.ts (`src/app/core/services/delivery-api.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class DeliveryApiService {
  constructor(private http: HttpClient) {}

  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${environment.apiUrl}/deliveries`);
  }

  updateDeliveryStatus(id: string, status: DeliveryStatus): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/deliveries/${id}`,
      { status }
    );
  }

  validateToken(): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(
      `${environment.apiUrl}/auth/validate',
      {}
    );
  }

  private handleError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar al servidor';
    }
    if (error.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      return 'Sesión expirada';
    }
    if (error.status === 403) return 'No tienes permisos';
    if (error.status === 404) return 'Recurso no encontrado';
    if (error.status >= 500) return 'Error interno del servidor';
    return 'Error desconocido';
  }
}
```

### Métodos

| Método | HTTP | URL | Descripción |
|--------|------|-----|-------------|
| `getDeliveries()` | GET | `/api/deliveries` | Obtiene todas las entregas |
| `updateDeliveryStatus(id, status)` | PATCH | `/api/deliveries/:id` | Actualiza estado |
| `validateToken()` | POST | `/api/auth/validate` | Valida token de sesión |

### Manejo de Errores

| Status | Mensaje | Acción |
|--------|---------|--------|
| 0 | No se pudo conectar al servidor | Network error |
| 401 | Sesión expirada | Limpia localStorage |
| 403 | No tienes permisos | Forbidden |
| 404 | Recurso no encontrado | Not found |
| 500 | Error interno del servidor | Server error |

---

## 11. Notification Service - notification.service.ts (`src/app/core/services/notification.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messages = [
    'Nueva entrega asignada: PKG-00X',
    'Alerta de tráfico en Zona Norte',
    'Entrega PKG-00X marcada como completada',
    'Paquete en camino a destino',
    'Retraso reportado en Ruta 5',
    'Paquete entregado exitosamente'
  ];

  notifications$ = new Observable<string>((observer) => {
    setInterval(() => {
      const msg = this.messages[Math.floor(Math.random() * this.messages.length)];
      observer.next(msg.replace('PKG-00X', `PKG-${String(Math.floor(Math.random() * 150) + 1).padStart(4, '0')}`));
    }, 8000);
  });
}
```

### Funcionamiento
- **Observable** que emite mensajes aleatorios cada **8 segundos**
- Usado en Dashboard para mostrar notificaciones en tiempo real
- Mensajes incluyen códigos de paquete simulados

---

## 12. Auth Guard - auth.guard.ts (`src/app/core/guards/auth.guard.ts`)

```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');
  if (token && auth.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

### ¿Qué hace?
- Protege rutas que requieren autenticación
- Verifica que exista **token** Y **usuario** en AuthService
- Si ambos existen → permite acceso (return `true`)
- Si no → redirige a `/login` (return `UrlTree`)

### Decisión de Diseño
- **Functional Guard** (Angular 15+) en lugar de clase con `CanActivate`
- Composable con `inject()` para acceder a servicios

---

## 13. Interceptors - auth.interceptor.ts (`src/app/core/interceptors/auth.interceptor.ts`)

### Los 3 Interceptores

#### 1. authInterceptorFn
```typescript
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  return next(req);
};
```
- Adjunta header `Authorization: Bearer {token}` a todas las requests
- Solo si existe token en localStorage

#### 2. mockApiInterceptorFn
```typescript
export const mockApiInterceptorFn: HttpInterceptorFn = (req, next) => {
  // Login
  if (req.method === 'POST' && req.url.includes('/api/auth/login')) {
    const body = JSON.parse(req.body);
    const user = MOCK_USERS.find(
      u => u.username === body.username && u.password === body.password
    );
    if (user) {
      return of({
        token: `mock-jwt-${Date.now()}`,
        user
      }).pipe(delay(800));
    }
    return throwError(() => new Error('Credenciales inválidas'));
  }

  // Get deliveries
  if (req.method === 'GET' && req.url.includes('/api/deliveries')) {
    return of(MOCK_DELIVERIES).pipe(delay(600));
  }

  // Update status
  if (req.method === 'PATCH' && req.url.includes('/api/deliveries/')) {
    const deliveryId = req.url.split('/').pop();
    const body = JSON.parse(req.body);
    const delivery = MOCK_DELIVERIES.find(d => d.id === deliveryId);
    if (delivery) {
      return of({ ...delivery, ...body }).pipe(delay(500));
    }
    return throwError(() => new Error('Entrega no encontrada'));
  }

  return next(req);
};
```

#### 3. errorInterceptorFn
```typescript
export const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      }
      return throwError(() => error);
    })
  );
};
```
- Captura TODOS los errores HTTP
- En 401 → limpia sesión (logout forzado)
- Re-lanza el error para que el componente lo maneje

---

## 14. Login Component

### login.component.ts

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  animations: [/* container, form, input, error animations */]
})
export class LoginComponent {
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  currentTime = '';

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Por favor complete todos los campos');
      return;
    }

    const { username, password } = this.loginForm.value;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.login(username!, password!).then(success => {
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Credenciales inválidas');
      }
      this.isLoading.set(false);
    });
  }
}
```

### Signals del Login

| Signal | Tipo | Descripción |
|--------|------|-------------|
| `isLoading` | `signal<boolean>` | Muestra spinner durante login |
| `errorMessage` | `signal<string \| null>` | Mensaje de error a mostrar |

### Animaciones

| Animación | Descripción |
|-----------|-------------|
| `containerAnimation` | Container aparece con fade desde abajo |
| `formAnimation` | Formulario aparece con fade |
| `inputAnimation` | Inputs aparecen escalonados |
| `errorAnimation` | Mensaje de error aparece con slide |

### Validación del Formulario
- `username`: Requerido
- `password`: Requerido
- Si inválido → muestra "Por favor complete todos los campos"
- Si credenciales incorrectas → muestra "Credenciales inválidas"

---

## 15. Dashboard Component

### dashboard.component.ts

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificationToastComponent]
})
export class DashboardComponent {
  currentUser = signal<User | null>(null);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  mobileNavOpen = signal(false);
  notificationMessage = signal<string | null>(null);
  currentUtcTime = signal('');

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService,
    private destroyRef: DestroyRef
  ) {
    this.currentUser.set(this.auth.currentUser());

    // Subscribe to notifications
    this.notificationService.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => this.showNotification(msg));

    // Update clock every second
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateTime());
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.set(!this.mobileNavOpen());
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }

  showNotification(message: string): void {
    this.notificationMessage.set(message);
    setTimeout(() => this.notificationMessage.set(null), 4000);
  }

  updateTime(): void {
    this.currentUtcTime.set(new Date().toUTCString().split(' ').slice(4, 5)[0] + ' UTC');
  }
}
```

### Signals del Dashboard

| Signal | Tipo | Descripción |
|--------|------|-------------|
| `currentUser` | `signal<User \| null>` | Usuario actual desde AuthService |
| `isAdmin` | `computed<boolean>` | True si es ADMIN |
| `mobileNavOpen` | `signal<boolean>` | Estado del menú móvil |
| `notificationMessage` | `signal<string \| null>` | Mensaje del toast |
| `currentUtcTime` | `signal<string>` | Hora UTC actual |

### Métodos

| Método | Descripción |
|--------|-------------|
| `toggleMobileNav()` | Alterna visibilidad del menú móvil |
| `closeMobileNav()` | Cierra menú móvil |
| `logout()` | Cierra sesión via AuthService |
| `showNotification(msg)` | Muestra toast por 4 segundos |
| `updateTime()` | Actualiza reloj UTC |

### Subscriptions con takeUntilDestroyed
```typescript
this.notificationService.notifications$
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(msg => this.showNotification(msg));

interval(1000)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(() => this.updateTime());
```
- **Previene memory leaks**: destruye subscriptions cuando el componente se destruye
- Angular 16+ patrón de cleanup

---

## 16. Delivery List Component

### delivery-list.component.ts

```typescript
@Component({ selector: 'app-delivery-list', standalone: true })
export class DeliveryListComponent {
  // Signals
  isUpdating = signal(false);
  errorMessage = signal<string | null>(null);
  packageCodeFilter = signal('');
  statusFilter = signal<DeliveryStatus | ''>('');
  currentPage = signal(1);
  pageSize = signal(10);
  showConfirmDialog = signal(false);
  selectedDelivery = signal<Delivery | null>(null);

  // Computed
  allDeliveries = computed(() => {
    const user = this.auth.currentUser();
    return user ? this.deliveryService.getDeliveriesForUser(user) : [];
  });

  filteredDeliveries = computed(() => {
    let result = this.allDeliveries();
    const codeFilter = this.packageCodeFilter().toLowerCase();
    const statusFilter = this.statusFilter();

    if (codeFilter) {
      result = result.filter(d => d.packageCode.toLowerCase().includes(codeFilter));
    }
    if (statusFilter) {
      result = result.filter(d => d.status === statusFilter);
    }
    return result;
  });

  totalDeliveries = computed(() => this.filteredDeliveries().length);

  deliveries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredDeliveries().slice(start, start + this.pageSize());
  });

  isAdmin = computed(() => this.auth.isAdmin());

  // Acciones
  onPageChange(event: { page: number; pageSize: number }): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.pageSize);
  }

  onPackageCodeFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.packageCodeFilter.set(value);
    this.currentPage.set(1);
  }

  onStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as DeliveryStatus | '';
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  confirmDelivery(delivery: Delivery): void {
    // DRIVER solo puede confirmar PENDING
    if (delivery.status === 'PENDING') {
      this.selectedDelivery.set(delivery);
      this.showConfirmDialog.set(true);
    }
  }

  onConfirmDelivery(): void {
    const delivery = this.selectedDelivery();
    if (!delivery) return;
    this.isUpdating.set(true);

    this.deliveryService.updateStatus(delivery.id, 'DELIVERED').then(() => {
      this.showConfirmDialog.set(false);
      this.selectedDelivery.set(null);
      this.isUpdating.set(false);
    });
  }

  onCancelDelivery(): void {
    this.showConfirmDialog.set(false);
    this.selectedDelivery.set(null);
  }

  clearFilters(): void {
    this.packageCodeFilter.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
  }

  getStatusBadgeClass(status: DeliveryStatus): string {
    const map: Record<DeliveryStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_TRANSIT: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-green-100 text-green-800'
    };
    return map[status];
  }

  getStatusLabel(status: DeliveryStatus): string {
    const map: Record<DeliveryStatus, string> = {
      PENDING: 'Pendiente',
      IN_TRANSIT: 'En Camino',
      DELIVERED: 'Entregada'
    };
    return map[status];
  }
}
```

### Signals

| Signal | Tipo | Descripción |
|--------|------|-------------|
| `isUpdating` | `signal<boolean>` | Loading para actualizar estado |
| `errorMessage` | `signal<string \| null>` | Error a mostrar |
| `packageCodeFilter` | `signal<string>` | Filtro por código de paquete |
| `statusFilter` | `signal<DeliveryStatus \| ''>` | Filtro por estado |
| `currentPage` | `signal<number>` | Página actual |
| `pageSize` | `signal<number>` | Elementos por página |
| `showConfirmDialog` | `signal<boolean>` | Mostrar diálogo de confirmación |
| `selectedDelivery` | `signal<Delivery \| null>` | Entrega seleccionada para confirmar |

### Computed Properties (Señales Derivadas)

| Computed | Dependencias | Descripción |
|----------|--------------|-------------|
| `allDeliveries` | AuthService | Deliveries filtrados por rol (ADMIN ve todo, DRIVER solo lo suyo) |
| `filteredDeliveries` | allDeliveries + filters | Deliveries filtrados por búsqueda y estado |
| `totalDeliveries` | filteredDeliveries | Contador total de resultados |
| `deliveries` | filteredDeliveries + pagination | Página actual de deliveries |
| `isAdmin` | AuthService | Verificar si es admin |

### Flujo de Confirmación de Entrega

```
1. DRIVER hace click en "CONFIRMAR ENTREGA" (solo visible en PENDING)
2. Se abre ConfirmDialog con datos de la entrega
3. DRIVER confirma → onConfirmDelivery()
4. isUpdating.set(true) → muestra spinner
5. deliveryService.updateStatus(id, 'DELIVERED')
6. Se cierra diálogo → isUpdating.set(false)
7. Signal filteredDeliveries se recalcula automáticamente
```

### Filtros Implementados

| Filtro | Tipo | Reset Page | Descripción |
|--------|------|------------|-------------|
| Código de paquete | Text input | Sí | Busca coincidencias parciales en packageCode |
| Estado | Select dropdown | Sí | Filtra por PENDING, IN_TRANSIT, DELIVERED |

---

## 17. Confirm Dialog Component

### confirm-dialog.component.ts

```typescript
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  animations: [backdropAnimation, dialogAnimation]
})
export class ConfirmDialogComponent {
  @Input() isOpen = input(false);
  @Input() loading = input(false);
  @Input() packageCode = input('');
  @Input() destination = input('');

  @Output() confirm = output<void>();
  @Output() cancel = output<void>();
}
```

### Inputs (Angular 17+ Signals)

| Input | Tipo | Descripción |
|-------|------|-------------|
| `isOpen` | `boolean` | Controla visibilidad del diálogo |
| `loading` | `boolean` | Muestra spinner en botones |
| `packageCode` | `string` | Código del paquete a confirmar |
| `destination` | `string` | Dirección de destino |

### Outputs (Events)

| Output | Event | Descripción |
|--------|-------|-------------|
| `confirm` | `output<void>()` | Emite cuando usuario confirma |
| `cancel` | `output<void>()` | Emite cuando usuario cancela |

### Animaciones

```typescript
backdropAnimation = trigger('backdrop', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms', style({ opacity: 0 }))
  ])
]);

dialogAnimation = trigger('dialog', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.9)' }),
    animate('200ms', style({ opacity: 1, transform: 'scale(1)' }))
  ]),
  transition(':leave', [
    animate('150ms', style({ opacity: 0, transform: 'scale(0.9)' }))
  ])
]);
```

- **Backdrop**: Fade in/out del overlay
- **Dialog**: Scale + fade para el diálogo

---

## 18. Notification Toast Component

### notification-toast.component.ts

```typescript
@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  animations: [slideAnimation, fadeAnimation]
})
export class NotificationToastComponent {
  @Input() message = input<string | null>(null);
}
```

### Inputs

| Input | Tipo | Descripción |
|-------|------|-------------|
| `message` | `string \| null` | Mensaje a mostrar (null = oculto) |

### Animación Slide

```typescript
slideAnimation = trigger('slide', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);
```
- Aparece desde la derecha
- Desaparece hacia la derecha

---

## 19. Pagination Component

### pagination.component.ts

```typescript
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaginationComponent {
  @Input() total = input(0);
  @Input() pageSize = input(10);
  @Input() currentPage = input(1);

  @Output() pageChange = output<PageEvent>();

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));

  visiblePages = computed(() => {
    const tp = this.totalPages();
    const cp = this.currentPage();
    const pages: (number | string)[] = [];

    if (tp <= 7) {
      return Array.from({ length: tp }, (_, i) => i + 1);
    }

    if (cp <= 4) {
      return [1, 2, 3, 4, 5, '...', tp];
    }
    if (cp >= tp - 3) {
      return [1, '...', tp - 4, tp - 3, tp - 2, tp - 1, tp];
    }
    return [1, '...', cp - 1, cp, cp + 1, '...', tp];
  });

  goToPage(page: number | string): void {
    if (typeof page === 'string' || page < 1 || page > this.totalPages()) {
      return;
    }
    this.pageChange.emit({
      page,
      pageSize: this.pageSize()
    });
  }

  onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageChange.emit({ page: 1, pageSize: size });
  }
}
```

### Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `total` | `number` | - | Total de elementos |
| `pageSize` | `number` | 10 | Elementos por página |
| `currentPage` | `number` | 1 | Página actual |

### Output

```typescript
@Output() pageChange = output<PageEvent>();

interface PageEvent {
  page: number;
  pageSize: number;
}
```

### Computed: visiblePages

Genera array inteligente de páginas para mostrar:

```
Si totalPages <= 7: [1, 2, 3, 4, 5, 6, 7]
Si currentPage <= 4: [1, 2, 3, 4, 5, '...', total]
Si currentPage >= total - 3: [1, '...', total-4, total-3, total-2, total-1, total]
Si intermedio: [1, '...', cp-1, cp, cp+1, '...', total]
```

---

## 20. Flujo de Datos Completo

### Flujo de Login

```
1. Usuario entra credenciales en LoginComponent
2. LoginComponent.onSubmit() llama authService.login(username, password)
3. AuthService.login() intenta HTTP POST /api/auth/login
   - mockApiInterceptorFn intercepta y retorna mock user
4. AuthService guarda token + user en localStorage
5. AuthService.currentUser.set(user) (signal se actualiza)
6. LoginComponent.router.navigate(['/dashboard'])
7. authGuard verifica token en localStorage → permite acceso
```

### Flujo de Carga de Deliveries

```
1. DashboardComponent carga DeliveryListComponent (ruta /dashboard/entregas)
2. DeliveryListComponent usa deliveryService.deliveries()
3. Si empty → fetchDeliveriesFromApi()
4. HTTP GET /api/deliveries
   - mockApiInterceptorFn intercepta y retorna MOCK_DELIVERIES
5. deliveryService.deliveries.set(data)
6. Computed allDeliveries filtra por rol
7. Template muestra tabla con deliveries
```

### Flujo de Confirmación de Entrega

```
1. DRIVER hace click en "CONFIRMAR ENTREGA" (solo en PENDING)
2. DeliveryListComponent.selectedDelivery.set(delivery)
3. DeliveryListComponent.showConfirmDialog.set(true)
4. ConfirmDialogComponent se muestra
5. DRIVER confirma → DeliveryListComponent.onConfirmDelivery()
6. deliveryService.updateStatus(id, 'DELIVERED')
7. Signal deliveries se actualiza (optimistic update)
8. filteredDeliveries se recalcula automáticamente
9. Tabla se re-renderiza con nuevo estado
```

### Flujo de Notificaciones

```
1. NotificationService.notifications$ emite cada 8 segundos
2. DashboardComponent subscribe con takeUntilDestroyed
3. showNotification(msg) → notificationMessage.set(msg)
4. NotificationToastComponent detecta message no null
5. Animación slide in aparece
6. setTimeout 4s → notificationMessage.set(null)
7. Animación slide out desaparece
```

### Flujo de Filtros

```
1. Usuario escribe en input código → onPackageCodeFilterChange(event)
2. packageCodeFilter.set(value)
3. filteredDeliveries computed se recalcula
4. currentPage.set(1) (reset a página 1)
5. deliveries computed se recalcula con nuevos filtros
6. Tabla se re-renderiza
```

### Flujo de Paginación

```
1. Usuario cambia página → PaginationComponent.goToPage(page)
2. pageChange.emit({ page, pageSize })
3. DeliveryListComponent.onPageChange(event)
4. currentPage.set(page), pageSize.set(pageSize)
5. deliveries computed se recalcula con slice
6. Tabla muestra página correcta
```

---

## 21. Credenciales de Prueba

| Username | Password | Rol | Nombre | Ver Entregas |
|----------|----------|-----|--------|--------------|
| admin | admin123 | ADMIN | Administrador | Todas (150) |
| driver1 | driver123 | DRIVER | Conductor 1 | Solo las suyas (~75) |
| driver2 | driver456 | DRIVER | Conductor 2 | Solo las suyas (~75) |

---

## Apéndice: Conceptos Clave para la Exposición

### ¿Qué son los Signals?
- Nueva forma de manejar estado reactivo en Angular 16+
- `signal(value)` crea una señal inicializable
- `computed(() => ...)` crea una señal derivada
- `signal.set(value)` actualiza el valor
- `signal()` lee el valor actual

```typescript
// Crear
const count = signal(0);

// Leer
console.log(count()); // 0

// Escribir
count.set(1);

// Computed (derivada)
const doubled = computed(() => count() * 2);
console.log(doubled()); // 2
```

### ¿Qué son los Functional Interceptors?
- Patrón moderno (Angular 15+) para interceptar requests HTTP
- `HttpInterceptorFn` es una función, no una clase
- Se registran en `provideHttpClient(withInterceptors([...]))`

```typescript
// Antes (clase)
export class AuthInterceptor implements HttpInterceptor {
  intercept(req, next) { ... }
}

// Ahora (función)
export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  // lógica
};
```

### ¿Qué es takeUntilDestroyed?
- Patrón para prevenir memory leaks en subscriptions
- Angular 16+ DestroyRef API
- Destruye automáticamente cuando el componente se destruye

```typescript
constructor(private destroyRef: DestroyRef) {
  interval(1000)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => console.log('tick'));
}
```

### ¿Qué es Lazy Loading?
- Carga código bajo demanda
- Reduce bundle inicial
- Mejora performance

```typescript
// Lazy component
loadComponent: () => import('./features/auth/login/login.component')
  .then(m => m.LoginComponent)

// Lazy routes (children)
loadChildren: () => import('./features/board/board.routes')
  .then(m => m.boardRoutes)
```

### Arquitectura de Interceptores en Cadena

```
Request → [authInterceptorFn] → [mockApiInterceptorFn] → [server/mock]
         ← [errorInterceptorFn] ← [response/error]
```

1. Request entra a authInterceptorFn → adjunta token
2. Pasa a mockApiInterceptorFn → retorna mock o continua
3. Si error → pasa a errorInterceptorFn → limpia sesión en 401
4. Response fluye en reversa

---

**LogisFlow v1.0** - Angular 21 + Tailwind CSS v3 + Signals + Interceptors Funcionales