import { Component, OnInit } from '@angular/core';
import { ServerState, ServerStateModel } from '@core/state/server';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {
  @Select(ServerState) servers$: Observable<ServerStateModel>;

  constructor() { }

  ngOnInit(): void {
  }

}
