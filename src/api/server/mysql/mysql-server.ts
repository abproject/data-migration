import { Server, ServerResponseModel, ServerType, QueryResult } from '../server.model';
import { MySQLServerConfig } from './mysql-server.model';
import { createValidator } from '../../../validator';
import { createPool, Pool } from 'mysql';
import { PropertyMapper } from '../../pipeline';

export class MySQLServer implements Server {
  readonly id: string;
  private config: MySQLServerConfig;
  private pool: Pool;

  constructor(config: any) {
    this.config = this.parseConfig(config);
    this.id = this.config.id;
    const { host, port, user, password, database, pool } = this.config;
    this.pool = createPool({
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
      connectionLimit: pool
    });
  }

  async query(request: any): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      this.pool.query(request, (error, rows) => {
        resolve({ error, rows });
      });
    })

  }

  async mapper(rows: { [key: string]: any }[], mapper: PropertyMapper[]): Promise<any[]> {
    throw Error('MySQL mapper is not implemented');
  }

  async save(result: { [key: string]: any }[], table: string) {
    throw Error('MySQL save is not implemented');
  }

  toServerResponseModel(): ServerResponseModel {
    const { password, ...model } = this.config;
    return model;
  }

  private parseConfig(config: any): MySQLServerConfig {
    const validator = createValidator(config, 'password');
    return {
      id: validator.isNotEmptyString('id'),
      type: ServerType.MySQL,
      name: validator.isNotEmptyString('name'),
      host: validator.isNotEmptyString('host'),
      port: validator.isInteger('port'),
      database: validator.isNotEmptyString('database'),
      pool: validator.isInteger('pool'),
      user: validator.isNotEmptyString('user'),
      password: config.password
    }
  }
}