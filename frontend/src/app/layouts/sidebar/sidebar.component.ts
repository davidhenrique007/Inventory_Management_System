import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Inventory Management</h2>
      </div>

      <mat-nav-list>
        <a mat-list-item
           routerLink="/dashboard"
           routerLinkActive="active"
           class="sidebar-link">
          <mat-icon>dashboard</mat-icon>
          <span>Dashboard</span>
        </a>

        <a mat-list-item
           routerLink="/products"
           routerLinkActive="active"
           class="sidebar-link">
          <mat-icon>inventory_2</mat-icon>
          <span>Produtos</span>
        </a>

        <a mat-list-item
           routerLink="/categories"
           routerLinkActive="active"
           class="sidebar-link">
          <mat-icon>category</mat-icon>
          <span>Categorias</span>
        </a>

        <a mat-list-item
           routerLink="/movements"
           routerLinkActive="active"
           class="sidebar-link">
          <mat-icon>swap_horiz</mat-icon>
          <span>Movimentações</span>
        </a>

        <a mat-list-item
           routerLink="/reports"
           routerLinkActive="active"
           class="sidebar-link">
          <mat-icon>assessment</mat-icon>
          <span>Relatórios</span>
        </a>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      position: fixed;
      left: 0;
      top: 0;
      overflow-y: auto;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid #334155;
      margin-bottom: 20px;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: white;
    }

    .sidebar-link {
      color: #cbd5e1 !important;
      margin: 8px 12px;
      border-radius: 12px;
      transition: all 0.3s;
    }

    .sidebar-link:hover {
      background: #334155 !important;
      color: white !important;
    }

    .sidebar-link.active {
      background: #3b82f6 !important;
      color: white !important;
    }

    mat-icon {
      margin-right: 12px;
      color: inherit;
    }
  `]
})
export class SidebarComponent {}
