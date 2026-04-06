import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="search-container">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>{{ placeholder }}</mat-label>
        <input
          matInput
          [(ngModel)]="searchValue"
          (ngModelChange)="onSearchChange()"
          [placeholder]="placeholder"
        >
        <mat-icon matSuffix>search</mat-icon>
        <button
          *ngIf="searchValue"
          mat-icon-button
          matSuffix
          (click)="clear()"
          class="clear-button"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .search-container {
      width: 100%;
    }
    .search-field {
      width: 100%;
    }
    .clear-button {
      position: absolute;
      right: 32px;
      top: 0;
    }
  `]
})
export class SearchBarComponent implements OnInit {
  @Input() placeholder: string = 'Buscar...';
  @Input() debounceTime: number = 300;
  @Output() search = new EventEmitter<string>();

  searchValue = '';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(value => {
      this.search.emit(value);
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchValue);
  }

  clear(): void {
    this.searchValue = '';
    this.search.emit('');
  }
}
