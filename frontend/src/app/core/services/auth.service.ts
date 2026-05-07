import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';
  private isBrowser: boolean;

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    if (!this.isBrowser) return;

    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      try {
        this.userSubject.next(JSON.parse(storedUser));
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.handleAuthSuccess(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: { name: string; email: string; password: string }): Observable<AuthResponse> {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'operator'
    };

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(
        tap(response => {
          if (response.success) {
            this.handleAuthSuccess(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.userSubject.value?.role === 'admin';
  }

  isManager(): boolean {
    const role = this.userSubject.value?.role;
    return role === 'admin' || role === 'manager';
  }

  private handleAuthSuccess(data: AuthResponse['data']): void {
    if (!this.isBrowser) return;

    localStorage.setItem(this.TOKEN_KEY, data.tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.tokens.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    this.userSubject.next(data.user);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.status === 401) {
      errorMessage = 'Email ou senha incorretos';
    } else if (error.status === 409) {
      errorMessage = 'Este email já está cadastrado';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Dados inválidos';
    } else if (error.status === 404) {
      errorMessage = 'Serviço indisponível. Tente novamente mais tarde.';
    } else if (error.status === 500) {
      errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
    }

    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
