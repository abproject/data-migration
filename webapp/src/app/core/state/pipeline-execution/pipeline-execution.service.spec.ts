import { TestBed } from '@angular/core/testing';

import { PipelineExecutionService } from './pipeline-execution.service';

describe('PipelineExecutionService', () => {
  let service: PipelineExecutionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PipelineExecutionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
