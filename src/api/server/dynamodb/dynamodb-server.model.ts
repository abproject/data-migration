import { ServerType } from '../server.model';

export interface DynamoDBServerConfig {
  id: string;
  type: ServerType.DynamoDB;
  name: string;
  region: string;
  profile: string;
}