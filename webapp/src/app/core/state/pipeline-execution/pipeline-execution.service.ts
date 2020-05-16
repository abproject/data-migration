import { Injectable } from '@angular/core';
import { PipelineExecutionResponseModel, PipelineRequestModel } from '@api/pipeline';
import { State, Action, StateContext } from '@ngxs/store';
import { StateModel } from '../state.model';
import { PipelineDataModifyStateModel } from '../pipeline';
import { ApiService } from '@core/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@features/shared';

export class PipelineCheckAction {
  static readonly type = '[Pipelines] Check';
  constructor(public model: PipelineDataModifyStateModel) { }
}

export class PipelineRunAction {
  static readonly type = '[Pipelines] Run';
  constructor(public model: PipelineDataModifyStateModel) { }
}

export interface PipelineExecutionModel {
  type: 'run' | 'check';
  timestamp: Date;
  data?: any;
  error?: string;
}

export type PipelineExecutionStateModel = StateModel<PipelineExecutionModel>;

@State<PipelineExecutionStateModel>({
  name: 'pipelineExecution',
  defaults: {
    pending: false,
    data: {
      type: 'run',
      timestamp: new Date(),
      data: 'Started'
    }
  }
})
@Injectable()
export class PipelineExecutionState {
  private apiUrl = '/pipelines';

  constructor(private api: ApiService, private flash: MatSnackBar, private dialog: MatDialog) { }

  @Action(PipelineCheckAction)
  checkPipeline(ctx: StateContext<PipelineExecutionStateModel>, action: PipelineCheckAction) {
    ctx.setState({
      data: {
        ...ctx.getState().data,
        type: 'check'
      }, pending: true
    });
    const dialogRef = this.dialog.open(DialogComponent, { data: ctx.getState() });

    return this.api.post<PipelineExecutionResponseModel, PipelineRequestModel>(`${this.apiUrl}/check`, action.model).pipe(
      tap(result => {
        ctx.setState({ data: this.mapApiResponseModel(result, 'check'), pending: false });
        dialogRef.componentInstance.data = ctx.getState();
      }),
      catchError(error => this.errorHandler(ctx, error))
    );
  }

  @Action(PipelineRunAction)
  runPipeline(ctx: StateContext<PipelineExecutionStateModel>, action: PipelineRunAction) {
    ctx.setState({
      data: {
        ...ctx.getState().data,
        type: 'run'
      }, pending: true
    });
    const dialogRef = this.dialog.open(DialogComponent, { data: ctx.getState() });
    return this.api.post<PipelineExecutionResponseModel, PipelineRequestModel>(`${this.apiUrl}/run`, action.model).pipe(
      tap(result => {
        ctx.setState({ data: this.mapApiResponseModel(result, 'run'), pending: false });
        dialogRef.componentInstance.data = ctx.getState();
      }),
      catchError(error => this.errorHandler(ctx, error))
    );
  }

  private mapApiResponseModel = (dto: PipelineExecutionResponseModel, type: 'run' | 'check'): PipelineExecutionModel => ({
    timestamp: new Date(dto.timestamp),
    type: type,
    data: dto.data,
    error: dto.error
  })

  private errorHandler(ctx: StateContext<PipelineExecutionStateModel>, error: any) {
    console.warn(error);
    this.flash.open(error.error.message, 'close');
    return throwError(error);
  }
}
