import { getConfig } from '../../config';
import { ServerService } from './server.service';
import { Server, ServerType } from './server.model';
import { MySQLServer } from './mysql';
import { createValidator } from '../../validator';
import { DynamoDBServer } from './dynamodb';

let serverService: ServerService = null;

export function getServerService(): ServerService {
  if (serverService == null) {
    serverService = new ServerService(getServerConfigs());
  }
  return serverService;
}

function getServerConfigs(): Server[] {
  const servers = createValidator(getConfig())
    .isArray('servers');

  return servers.map(serverFactory);
}

function serverFactory(config: any): Server {
  switch (config.type) {
    case ServerType.MySQL:
      return new MySQLServer(config);
    case ServerType.DynamoDB:
      return new DynamoDBServer(config)
  }
  throw Error(`Unknown server type '${config.type}'`);
}