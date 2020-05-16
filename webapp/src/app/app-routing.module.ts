import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StartComponent } from './features/start/start.component';
import { PipelineComponent } from './features/pipeline/pipeline.component';


const routes: Routes = [
  { path: ':id', component: PipelineComponent },
  { path: '', component: StartComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
