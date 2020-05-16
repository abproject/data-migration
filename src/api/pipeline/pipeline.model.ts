export interface PropertyMapper {
  source: string;
  dist: string;
  distType: string;
}

export interface PipelineModel {
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

export interface PipelineStorageModel {
  id: string;
  name: string;
  sql: string;
  sourceServerId: string;
  distServerId: string;
  distTable: string;
  mapping: PropertyMapper[];
  modifiedAt: string;
  createdAt: string;
}

export type PipelineGetAllResponseModel = Pick<PipelineModel, 'id' | 'name'> & { modifiedAt: string };

export type PipelineResponseModel = Omit<PipelineModel, 'modifiedAt' | 'createdAt'> & { modifiedAt: string, createdAt: string };

export type PipelineRequestModel = Omit<PipelineModel, 'id' | 'modifiedAt' | 'createdAt'>;

export interface PipelineExecutionModel {
  timestamp: Date;
  data?: any;
  error?: string;
}

export type PipelineExecutionResponseModel = Omit<PipelineExecutionModel, 'timestamp'> & { timestamp: string };