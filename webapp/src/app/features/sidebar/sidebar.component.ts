import { Component, OnInit } from '@angular/core';
import { Store, Select, Actions, ofActionSuccessful } from '@ngxs/store';
import { Navigate, RouterDataResolved } from '@ngxs/router-plugin';
import { ServerGetAllAction } from '@core/state/server';
import { PipelineGetAllAction, PipelineState, PipelineStateModel, PipelineDeleteAction } from '@core/state/pipeline';
import { Observable, Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Select(PipelineState) pipelines$: Observable<PipelineStateModel>;
  id: string | null;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.actions$.pipe(
      ofActionSuccessful(RouterDataResolved),
      takeUntil(this.unsubscribe$)
    ).subscribe((action: RouterDataResolved) => {
      this.id = action.routerState.root.firstChild.params.id;
    });

    this.store.dispatch(new ServerGetAllAction());
    this.store.dispatch(new PipelineGetAllAction());
  }

  createNewPipeline() {
    this.store.dispatch(new Navigate(['/new']));
  }

  selectPipeline(id: string) {
    this.store.dispatch(new Navigate(['/', id]));
  }

  deletePipeline(id: string, event: Event) {
    event.stopPropagation();
    this.store.
      dispatch(new PipelineDeleteAction(id));
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}