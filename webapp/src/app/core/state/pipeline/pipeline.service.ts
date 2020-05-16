import { StateModel } from '../state.model';
import { ApiService } from '@core/api';
import { State, Action, StateContext } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { PipelineGetAllResponseModel, PipelineResponseModel, PropertyMapper, PipelineRequestModel } from '@api/pipeline';
import { MatSnackBar } from '@angular/material/snack-bar';

export class PipelineGetAllAction {
  static readonly type = '[Pipelines] Get All';
}

export class PipelineGetAction {
  static readonly type = '[Pipelines] Get by ID';
  constructor(public id: string) { }
}

export class PipelineNewAction {
  static readonly type = '[Pipelines] Create New';
}

export class PipelineSaveNewAction {
  static readonly type = '[Pipelines] Save New';
  constructor(public model: PipelineDataModifyStateModel) { }
}

export class PipelineUpdateAction {
  static readonly type = '[Pipelines] Update by id';
  constructor(public id: string, public model: PipelineDataModifyStateModel) { }
}

export class PipelineDeleteAction {
  static readonly type = '[Pipelines] Delete by id';
  constructor(public id: string) { }
}


export interface PipelineDataShortStateModel {
  id: string;
  name: string;
  modifiedAt: Date;
}

export interface PipelineDataModifyStateModel {
  name: string;
  sql: string;
  sourceServerId: string;
  distServerId: string;
  distTable: string;
  mapping: PropertyMapper[];
}

export interface PipelineDataStateModel {
  id: string;
  name: string;
  sql: string;
  sourceServerId: string;
  distServerId: string;
  distTable: string;
  mapping: PropertyMapper[];
  modifiedAt: Date;
  createdAt: Date;
}

export type PipelineStateModel = {
  all: StateModel<PipelineDataShortStateModel[]>
  current: StateModel<PipelineDataStateModel>
};

const defaultState: PipelineStateModel = {
  all: {
    pending: false,
    data: [],
  },
  current: {
    pending: false,
    data: {
      id: '',
      name: '',
      sql: '',
      sourceServerId: '',
      distServerId: '',
      distTable: '',
      mapping: [],
      modifiedAt: new Date(),
      createdAt: new Date()
    }
  }
};


@State<PipelineStateModel>({
  name: 'pipelines',
  defaults: defaultState
})
@Injectable()
export class PipelineState {

  private apiUrl = '/pipelines';
  constructor(private api: ApiService, private flash: MatSnackBar) { }

  @Action(PipelineGetAllAction)
  getAllPipelines(ctx: StateContext<PipelineStateModel>) {
    ctx.setState({ ...ctx.getState(), all: { pending: true, data: [] } });
    return this.api.get<PipelineGetAllResponseModel[]>(this.apiUrl).pipe(
      tap(pipelines => {
        const all = {
          pending: false,
          data: pipelines.map(this.mapApiGetAllResponseToShortData)
        }
        ctx.setState({ ...ctx.getState(), all });
      }),
      catchError(error => this.errorAllHandler(ctx, error))
    );
  }

  @Action(PipelineGetAction)
  getPipelineById(ctx: StateContext<PipelineStateModel>, action: PipelineGetAction) {
    const state = ctx.getState();
    ctx.setState({ ...state, current: { pending: true, data: state.current.data } });
    return this.api.get<PipelineResponseModel>(`${this.apiUrl}/${action.id}`).pipe(
      tap(pipeline => {
        const current = {
          pending: false,
          data: this.mapApiResponseToShortData(pipeline)
        }
        ctx.setState({ ...ctx.getState(), current });
      }),
      catchError(error => this.errorCurrentHandler(ctx, error))
    );
  }

  @Action(PipelineNewAction)
  getNewPipeline(ctx: StateContext<PipelineStateModel>) {
    ctx.setState({ ...ctx.getState(), current: { pending: false, data: defaultState.current.data } });
  }

  @Action(PipelineSaveNewAction)
  saveNewPipeline(ctx: StateContext<PipelineStateModel>, action: PipelineSaveNewAction) {
    const state = ctx.getState();
    ctx.setState({ ...state, current: { pending: true, data: state.current.data } });
    return this.api.post<PipelineResponseModel, PipelineRequestModel>(`${this.apiUrl}`, action.model).pipe(
      tap(pipeline => {
        ctx.setState({ ...state, current: { pending: false, data: state.current.data } });
        ctx.dispatch(new PipelineGetAllAction());
        ctx.dispatch(new Navigate(['/', pipeline.id]));
      }),
      catchError(error => this.errorCurrentHandler(ctx, error))
    );
  }

  @Action(PipelineUpdateAction)
  updatePipeline(ctx: StateContext<PipelineStateModel>, action: PipelineUpdateAction) {
    const state = ctx.getState();
    ctx.setState({ ...state, current: { pending: true, data: state.current.data } });
    return this.api.put<PipelineResponseModel, PipelineRequestModel>(`${this.apiUrl}/${action.id}`, action.model).pipe(
      tap(pipeline => {
        const current = {
          pending: false,
          data: this.mapApiResponseToShortData(pipeline)
        }
        ctx.setState({ ...ctx.getState(), current });
        ctx.dispatch(new PipelineGetAllAction());
      }),
      catchError(error => this.errorCurrentHandler(ctx, error))
    );
  }

  @Action(PipelineDeleteAction)
  deletePipeline(ctx: StateContext<PipelineStateModel>, action: PipelineDeleteAction) {
    const state = ctx.getState();
    ctx.setState({ ...state, current: { pending: true, data: state.current.data } });
    return this.api.delete<PipelineResponseModel>(`${this.apiUrl}/${action.id}`).pipe(
      tap(pipeline => {
        ctx.setState({ ...state, current: { pending: false, data: state.current.data } });
        ctx.dispatch(new PipelineGetAllAction());
        ctx.dispatch(new Navigate(['/new']));
      }),
      catchError(error => this.errorCurrentHandler(ctx, error))
    );
  }

  private mapApiGetAllResponseToShortData = (dto: PipelineGetAllResponseModel): PipelineDataShortStateModel => ({
    id: dto.id,
    name: dto.name,
    modifiedAt: new Date(dto.modifiedAt)
  })

  private mapApiResponseToShortData = (dto: PipelineResponseModel): PipelineDataStateModel => ({
    id: dto.id,
    name: dto.name,
    sql: dto.sql,
    sourceServerId: dto.sourceServerId,
    distServerId: dto.distServerId,
    distTable: dto.distTable,
    mapping: dto.mapping,
    modifiedAt: new Date(dto.createdAt),
    createdAt: new Date(dto.createdAt),
  })


  private errorAllHandler(ctx: StateContext<PipelineStateModel>, error: any) {
    console.warn(error);
    this.flash.open(error.error.message, 'close');
    const all = {
      pending: false,
      data: ctx.getState().all.data
    }
    ctx.setState({ ...ctx.getState(), all });
    return throwError(error);
  }

  private errorCurrentHandler(ctx: StateContext<PipelineStateModel>, error: any) {
    console.warn(error);
    this.flash.open(error.error.message, 'close');
    const current = {
      pending: false,
      data: ctx.getState().current.data
    }
    ctx.setState({ ...ctx.getState(), current });
    return throwError(error);
  }
}


