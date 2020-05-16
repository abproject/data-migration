
import { StateModel } from '../state.model';
import { ApiService } from '@core/api';
import { State, Action, StateContext } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ServerResponseModel, ServerType } from '@api/server';

export class ServerGetAllAction {
  static readonly type = '[Servers] Get All';
}

export interface ServerDataStateModel {
  id: string;
  type: ServerType;
  name: string;
  host: string;
  port: number;
  user: string;
}
export type ServerStateModel = StateModel<ServerDataStateModel[]>;

@State<ServerStateModel>({
  name: 'servers',
  defaults: {
    pending: false,
    data: []
  }
})
@Injectable()
export class ServerState {

  private apiUrl = '/servers';
  constructor(private api: ApiService) { }

  @Action(ServerGetAllAction)
  getAllServers(ctx: StateContext<ServerStateModel>) {
    ctx.patchState({ pending: true });
    return this.api.get<ServerResponseModel[]>(this.apiUrl).pipe(
      tap(servers => {
        ctx.patchState({
          pending: false,
          data: servers.map(this.mapApiGetResponseToData)
        });
      }),
      catchError(error => this.errorHandler(ctx, error))
    );
  }

  private mapApiGetResponseToData = (dto: ServerResponseModel): ServerDataStateModel => ({
    id: dto.id,
    type: dto.type,
    name: dto.name,
    host: dto.host,
    port: dto.port,
    user: dto.user
  })

  private errorHandler(ctx: StateContext<ServerStateModel>, error: any) {
    console.warn(error);
    ctx.patchState({ pending: false });
    return throwError(error);
  }
}
