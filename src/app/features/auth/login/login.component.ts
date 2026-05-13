import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, style, transition, animate, state } from '@angular/animations';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule],
    animations: [
        trigger('containerAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('formAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('errorAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(-10px)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
            ]),
            transition(':leave', [
                animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(10px)' }))
            ])
        ]),
        trigger('inputAnimation', [
            state('void', style({ transform: 'translateX(-5px)', opacity: 0 })),
            state('*', style({ transform: 'translateX(0)', opacity: 1 })),
            transition(':enter', [
                style({ transform: 'translateX(-10px)', opacity: 0 }),
                animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ])
        ])
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  currentTime = '';
  private timeInterval: ReturnType<typeof setInterval> | null = null;
  private loginSubscription: Subscription | null = null;

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  ngOnInit(): void {
    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) clearInterval(this.timeInterval);
    if (this.loginSubscription) this.loginSubscription.unsubscribe();
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toISOString().slice(0, 19) + ' UTC';
  }

  onSubmit(): void {
    const trimmed = {
      username: (this.loginForm.value.username ?? '').trim(),
      password: (this.loginForm.value.password ?? '').trim(),
    };
    this.loginForm.patchValue(trimmed);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.loginSubscription) this.loginSubscription.unsubscribe();

    this.loginSubscription = this.authService.login(trimmed.username, trimmed.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        const fallback = 'CREDENCIALES INVÁLIDAS - ACCESO DENEGADO';
        this.errorMessage.set(
          err instanceof Error && err.message ? err.message : fallback
        );
      }
    });
  }
}