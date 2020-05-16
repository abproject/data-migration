import { PropertyMapper } from '../pipeline';

export enum ServerType {
  MySQL = 'mysql',
  DynamoDB = 'dynamodb',
}

export interface Server {
  readonly id: string;
  query(request: any): Promise<QueryResult>;

  mapper(rows: { [key: string]: any }[], mapper: PropertyMapper[]): Promise<any[]>

  save(rows: { [key: string]: any }[], table: string): Promise<any>;

  toServerResponseModel: () => ServerResponseModel;
}

export interface ServerResponseModel {
  id: string;
  type: ServerType;
  name: string;
  host?: string;
  port?: number;
  user?: string;
}

export interface QueryResult {
  rows?: { [key: string]: any }[];
  error?: Error,
}

