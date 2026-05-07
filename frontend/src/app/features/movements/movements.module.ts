import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MovementListComponent } from './movement-list/movement-list.component';
import { MovementInComponent } from './movement-in/movement-in.component';
import { MovementOutComponent } from './movement-out/movement-out.component';

const routes: Routes = [
  { path: '', component: MovementListComponent },
  { path: 'in', component: MovementInComponent },
  { path: 'out', component: MovementOutComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class MovementsModule { }