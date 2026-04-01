import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AlertComponent
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <div class="logo-container">
          <img src="assets/images/logo.svg" alt="Logo" class="logo">
          <h1>Inventory Management</h1>
          <p>Sistema de Gestão de Inventário</p>
        </div>

        <app-alert
          *ngIf="errorMessage"
          type="error"
          [message]="errorMessage"
          [dismissible]="true"
          (closed)="clearError()">
        </app-alert>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="seu@email.com" autocomplete="email">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched">
              Email é obrigatório
            </mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched">
              Email inválido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Senha</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" autocomplete="current-password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">
              Senha é obrigatória
            </mat-error>
            <mat-error *ngIf="loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched">
              Senha deve ter no mínimo 6 caracteres
            </mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || loading" class="submit-btn">
            <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
            <span *ngIf="!loading">Entrar</span>
          </button>

          <div class="register-link">
            Não tem conta? <a routerLink="/auth/register">Criar conta</a>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      max-width: 420px;
      width: 100%;
      padding: 32px;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .logo-container {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .logo-container h1 {
      font-size: 24px;
      font-weight: 500;
      margin: 0 0 8px;
      color: #333;
    }

    .logo-container p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 8px;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 16px;
    }

    .submit-btn mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .register-link {
      text-align: center;
      margin-top: 24px;
      color: #666;
      font-size: 14px;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message;
      }
    });
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
