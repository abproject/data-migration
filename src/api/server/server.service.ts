import { Server } from './server.model';

export class ServerService {
  constructor(private servers: Server[]) {
  }

  getAll(): Server[] {
    return this.servers.slice();
  }

  getServerById(id: string): Server | never {
    const server = this.servers.find(server => server.id === id);
    if (server == null) {
      throw Error(`server id=${id} not found`);
    }
    return server;
  }
}