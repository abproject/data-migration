import { NgModule } from '@angular/core';
import { ApiService } from './api/api.service';
import { StateModule } from './state/state.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule, StateModule],
  providers: [ApiService]
})
export class CoreModule { }
