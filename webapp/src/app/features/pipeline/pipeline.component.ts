import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { PipelineState, PipelineStateModel, PipelineGetAction, PipelineNewAction, PipelineDataStateModel, PipelineDataModifyStateModel, PipelineSaveNewAction, PipelineUpdateAction } from '@core/state/pipeline';
import { PipelineCheckAction, PipelineRunAction } from '@core/state/pipeline-execution';
import { Observable, Subject } from 'rxjs';
import { FormControl, Validators, FormGroupDirective, NgForm, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { takeUntil, map, tap } from 'rxjs/operators';
import { ServerState, ServerStateModel, ServerDataStateModel } from '@core/state/server';
import { PropertyMapper } from '@api/pipeline';

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent implements OnInit {
  @Select(PipelineState) pipelines$: Observable<PipelineStateModel>;
  @Select(ServerState) servers$: Observable<ServerStateModel>;
  id: string | null;
  isLoading = true;
  matcher = new CustomErrorStateMatcher();
  servers: ServerDataStateModel[] = [];

  form: FormGroup;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private activatedRoute: ActivatedRoute, private store: Store, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.parseIdParam(this.activatedRoute.snapshot.params['id']);
    this.activatedRoute.paramMap
      .subscribe(params => {
        this.parseIdParam(params.get('id'))
      });

    this.form = this.formBuilder.group({
      'name': ['', Validators.required],
      'sourceServerId': ['', Validators.required],
      'distServerId': ['', Validators.required],
      'distTable': ['', Validators.required],
      'sql': ['', Validators.required],
      'mapping': this.formBuilder.array([
        this.createMappingGroup({
          source: 'source',
          dist: 'dist',
          distType: 'S'
        }),
        this.createMappingGroup({
          source: 'source-1',
          dist: 'dist-2',
          distType: 'S'
        })
      ]),
    });

    this.pipelines$.pipe(
      takeUntil(this.unsubscribe$),
      map(pipelineState => pipelineState.current)
    ).subscribe(currentPipelineState => {
      this.isLoading = currentPipelineState.pending;
      this.updateForm(currentPipelineState.data);
    });

    this.servers$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(servers => {
      this.servers = servers.data;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  private parseIdParam(paramId: string) {
    const newId = paramId == 'new' ? null : paramId;
    if (newId != this.id) {
      this.id = newId;
      if (this.id == null) {
        this.store.dispatch(new PipelineNewAction());
      } else {
        this.store.dispatch(new PipelineGetAction(this.id));
      }
    }
  }

  private updateForm(pipeline: PipelineDataStateModel) {
    this.form.patchValue({
      name: pipeline.name,
      sourceServerId: pipeline.sourceServerId,
      distServerId: pipeline.distServerId,
      distTable: pipeline.distTable,
      sql: pipeline.sql,
    });
    this.form.controls['mapping'] = this.formBuilder.array(
      pipeline.mapping.map(mapping => this.createMappingGroup(mapping))
    );
  }

  private createMappingGroup(prepertyMapper: PropertyMapper): FormGroup {
    return this.formBuilder.group({
      source: [prepertyMapper.source, Validators.required],
      dist: [prepertyMapper.dist, Validators.required],
      distType: [prepertyMapper.distType, Validators.required]
    });
  }

  getControlError(control: string, validator: string): boolean {
    return this.form.controls[control].hasError(validator);
  }

  getMappingError(index: number, control: string, validator: string): boolean {
    return (this.mapping.controls[index] as FormGroup).controls[control].hasError(validator);
  }

  get mapping(): FormArray {
    return this.form.get('mapping') as FormArray;
  }

  addMapping() {
    const mapping: PropertyMapper = {
      source: '',
      dist: '',
      distType: 'S',
    };
    this.mapping.push(this.createMappingGroup(mapping));
  }

  deleteMapping(index: number) {
    this.mapping.controls.splice(index, 1);
  }

  save() {
    if (this.id == null) {
      this.store.dispatch(new PipelineSaveNewAction(this.getFormData()));
    } else {
      this.store.dispatch(new PipelineUpdateAction(this.id, this.getFormData()));
    }
  }

  check() {
    this.store.dispatch(new PipelineCheckAction(this.getFormData()));
  }

  run() {
    this.store.dispatch(new PipelineRunAction(this.getFormData()));
  }

  private getFormData(): PipelineDataModifyStateModel {
    const form = this.form.value;
    return {
      name: form.name,
      sql: form.sql,
      sourceServerId: form.sourceServerId,
      distServerId: form.distServerId,
      distTable: form.distTable,
      mapping: this.form.get('mapping').value
    }
  }
}

class CustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}