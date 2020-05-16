import { Router } from 'express';
import { ServerService } from './server.service';
import { ServerResponseModel } from './server.model';
import { getServerService } from './server.factory';

const router = Router();

const serverService = getServerService();

router.get('/', async (req, res) => {
  const servers: ServerResponseModel[] = serverService.getAll()
    .map(server => server.toServerResponseModel());

  return res.json(servers);
});

export const ServerRouter = router;