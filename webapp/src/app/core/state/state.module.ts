import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { environment } from '../../../environments/environment';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { ServerState } from './server';
import { PipelineState } from './pipeline';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PipelineExecutionState } from './pipeline-execution';
import { SharedModule } from '@features/shared';

@NgModule({
  imports: [
    MatSnackBarModule,
    SharedModule,
    NgxsModule.forRoot([
      ServerState,
      PipelineState,
      PipelineExecutionState
    ], { developmentMode: !environment.production }),
    NgxsRouterPluginModule.forRoot(),
    environment.production ? [] : NgxsReduxDevtoolsPluginModule.forRoot()
  ]

})
export class StateModule { }
