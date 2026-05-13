# LogisFlow Dashboard

Sistema de gestión de entregas desarrollado con Angular.

## Levantar el proyecto

```bash
cd logisflow
npm install
ng serve
```
## Ejecutar los test 
```bash
npx ng test 
```
La aplicación estará disponible en `http://localhost:4200`

## Usuarios de prueba

| Usuario  | Password   | Rol    |
|----------|------------|--------|
| admin    | admin123   | ADMIN  |
| driver1  | driver123  | DRIVER |
| driver2  | driver456  | DRIVER |

## Arquitectura

- **Standalone Components** + Angular Signals
- **Lazy Loading** en módulo Board
- **Auth Guard** protegiendo rutas del dashboard
- **RxJS interval** para notificaciones en tiempo real
- **Tailwind CSS** para estilos

## Estructura del proyecto

```
src/app/
├── core/
│   ├── guards/       # Auth guard
│   ├── interceptors/ # HTTP interceptor
│   ├── models/      # User y Delivery models
│   └── services/    # Auth, Delivery, Notification services
├── shared/
│   └── components/  # Componentes reutilizables
└── features/
    ├── auth/        # Login
    └── board/       # Dashboard con lazy loading
```

## Funcionalidades

- Login con validación de credenciales
- Filtro de entregas por rol (Admin ve todas, Driver solo las suyas)
- Actualización de estado de entregas
- Notificaciones en tiempo real cada 8 segundos
- UI responsive con tema oscuro
