import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PipelineExecutionState, PipelineExecutionStateModel } from '@core/state/pipeline-execution';
import { Select } from '@ngxs/store';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: PipelineExecutionStateModel) { }

  ngOnInit(): void {
  }

}
