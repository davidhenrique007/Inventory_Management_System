import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule) },
      { path: 'categories', loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesModule) },
      { path: 'movements', loadChildren: () => import('./features/movements/movements.module').then(m => m.MovementsModule) },
      { path: 'reports', loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule) }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
