import { Router, Request, Response } from 'express';
import { PipelineService } from './pipeline.service';
import { PipelineGetAllResponseModel, PipelineResponseModel, PipelineRequestModel, PipelineModel, PipelineExecutionModel, PipelineExecutionResponseModel } from './pipeline.model';
import { createValidator } from '../../validator';

const router = Router();

const pipelineService = new PipelineService();

router.get('/', async (req, res) => {
  const promise: PipelineModel[] = await pipelineService.getAll();
  const pipelines: PipelineGetAllResponseModel[] = promise
    .map(({ id, name, modifiedAt }) => ({ id, name, modifiedAt: modifiedAt.toISOString() }));
  return res.json(pipelines);
});

router.get('/:id', async (req, res) => {
  try {
    const entity = await pipelineService.get(req.params.id)
    const pipeline: PipelineResponseModel = {
      ...entity,
      createdAt: entity.createdAt.toISOString(),
      modifiedAt: entity.modifiedAt.toISOString()
    };

    return res.json(pipeline);
  } catch (error) {
    return errorHandler(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = parseAndValidateRequestBody(req);
    const pipeline = await pipelineService.update(id, body);
    if (pipeline == null) {
      throw Error(`'pipeline' with id=${id} not found`);
    }
    return res.json(pipeline);
  } catch (exception) {
    console.warn(exception);
    return res.status(400).json(exception.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pipeline = pipelineService.delete(id);
    if (pipeline == null) {
      throw Error(`'pipeline' with id=${id} not found`);
    }
    return res.json();
  } catch (exception) {
    console.warn(exception);
    return res.status(400).json(exception.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const body = parseAndValidateRequestBody(req);
    const pipeline = pipelineService.save(body);
    return res.json(pipeline);
  } catch (exception) {
    console.warn(exception);
    return res.status(400).json(exception.message);
  }
});

router.post('/check', async (req, res) => {
  try {
    const body = parseAndValidateRequestBody(req);
    const execution: PipelineExecutionModel = await pipelineService.check(body);
    const response: PipelineExecutionResponseModel = {
      ...execution,
      timestamp: execution.timestamp.toISOString()
    }
    return res.json(response);
  } catch (exception) {
    console.warn(exception);

    return res.status(400).json(exception.message);
  }
});

router.post('/run', async (req, res) => {
  try {
    const body = parseAndValidateRequestBody(req);
    const execution: PipelineExecutionModel = await pipelineService.run(body);
    const response: PipelineExecutionResponseModel = {
      ...execution,
      timestamp: execution.timestamp.toISOString()
    }
    return res.json(response);
  } catch (exception) {
    console.warn(exception);

    return res.status(400).json(exception.message);
  }
});

function parseAndValidateRequestBody(req: Request): PipelineRequestModel | never {
  const data = parseRequestBody(req);
  validateRequestBody(data);
  return data;
}

function parseRequestBody(req: Request): PipelineRequestModel {
  const body = req.body;
  return {
    name: body.name,
    sql: body.sql,
    sourceServerId: body.sourceServerId,
    distServerId: body.distServerId,
    distTable: body.distTable,
    mapping: body.mapping
  }
}

function validateRequestBody(data: PipelineRequestModel): void | never {
  const validator = createValidator(data);
  validator.isNotEmptyString('name');
  validator.isNotEmptyString('sql');
  validator.isNotEmptyString('sourceServerId');
  validator.isNotEmptyString('distServerId');
  validator.isNotEmptyString('distTable');
  validator.isArray('mapping').forEach((mappingItem: any) => {
    const itemValidator = createValidator(mappingItem);
    itemValidator.isNotEmptyString('dist');
    itemValidator.isNotEmptyString('distType');
    itemValidator.isNotEmptyString('source');
  });
}

function errorHandler(res: Response, error: Error): Response {
  console.warn(error);
  return res.status(500).json({ message: error.message });
}

export const PipelineRouter = router;