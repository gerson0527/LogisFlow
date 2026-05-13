import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptorFn, mockApiInterceptorFn, errorInterceptorFn } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptorFn,
        mockApiInterceptorFn,
        errorInterceptorFn
      ])
    ),
    provideAnimations(),
    importProvidersFrom(HttpClientModule)
  ]
};