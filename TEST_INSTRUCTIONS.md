# Cómo ejecutar los tests unitarios

## Opción 1: Usar ng test directamente (si Node.js >= 18)

```bash
cd logisflow
npm install
npx ng test
```

## Opción 2: Con npm test

```bash
npm test
```

## Opción 3: Ver los archivos de test

Los archivos de test están creados:

### AuthService Tests
`src/app/core/services/auth.service.spec.ts` - 20 tests

### DeliveryService Tests  
`src/app/core/services/delivery.service.spec.ts` - 15 tests

---

## Estructura de los tests

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  // Tests de login
  // Tests de logout
  // Tests de loadFromStorage
  // Tests de signals
});

// delivery.service.spec.ts
describe('DeliveryService', () => {
  // Tests de getDeliveriesForUser (ADMIN vs DRIVER)
  // Tests de updateStatus
  // Tests del signal deliveries
});
```

## Para ver el código de los tests

Puedes abrir los archivos directamente:
- `src/app/core/services/auth.service.spec.ts`
- `src/app/core/services/delivery.service.spec.ts`

## Nota importante

Los tests requieren Node.js v18+ y Chrome/Chromium instalado.
Si tienes problemas con `npm install`, asegúrate de tener Node.js actualizado.

Para actualizar Node.js: https://nodejs.org/