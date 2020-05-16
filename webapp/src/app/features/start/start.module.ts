import { NgModule } from '@angular/core';
import { StartComponent } from './start.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [StartComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  exports: [StartComponent]
})
export class StartModule { }
