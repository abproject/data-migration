import { ServerType } from '../server.model';

export interface MySQLServerConfig {
  id: string;
  type: ServerType.MySQL;
  name: string;
  host: string;
  port: number;
  database: string;
  pool: number;
  user: string;
  password?: string;
}