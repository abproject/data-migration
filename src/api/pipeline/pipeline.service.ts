import { PipelineModel, PipelineRequestModel, PipelineStorageModel, PipelineExecutionModel } from './pipeline.model';
import { v4 as uuidv4 } from 'uuid';
import { getServerService, QueryResult, Server } from '../server';
import { getConfig } from '../../config';
import { PipelineRepository } from './pipeline.repository';

export class PipelineService {
  private serverService = getServerService();
  private pipelineRepository: PipelineRepository = new PipelineRepository(getConfig().storage);

  constructor() {
  }

  async getAll(): Promise<PipelineModel[]> {
    const promise = await this.pipelineRepository.getAll();
    return promise.map(pipeline => this.fromStorageModel(pipeline));
  }

  async get(id: string): Promise<PipelineModel | null> {
    const pipeline = await this.pipelineRepository.get(id);
    return this.fromStorageModel(pipeline);
  }

  async update(id: string, data: PipelineRequestModel): Promise<PipelineModel | null> {
    const newEntity: PipelineModel = {
      id: id,
      name: data.name,
      sql: data.sql,
      sourceServerId: data.sourceServerId,
      distServerId: data.distServerId,
      distTable: data.distTable,
      mapping: data.mapping,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    await this.pipelineRepository.save(newEntity.id, this.toStorageModel(newEntity));

    return newEntity;
  }

  async delete(id: string): Promise<boolean> {

    const result = await this.pipelineRepository.delete(id);

    return true;
  }

  async save(data: PipelineRequestModel): Promise<PipelineModel> {
    const newEntity: PipelineModel = {
      id: uuidv4(),
      name: data.name,
      sql: data.sql,
      sourceServerId: data.sourceServerId,
      distServerId: data.distServerId,
      distTable: data.distTable,
      mapping: data.mapping,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    await this.pipelineRepository.save(newEntity.id, this.toStorageModel(newEntity));

    return { ...newEntity };
  }

  async check(data: PipelineRequestModel): Promise<PipelineExecutionModel> {
    const sourceServer = this.serverService.getServerById(data.sourceServerId);
    const distServer = this.serverService.getServerById(data.distServerId);
    try {
      const queryResult = await sourceServer.query(data.sql);
      if (queryResult.error != null) {
        console.warn(queryResult.error);
        return {
          timestamp: new Date(),
          error: queryResult.error.message
        }
      }
      const mappedData = await distServer.mapper(queryResult.rows, data.mapping)
      return {
        timestamp: new Date(),
        data: mappedData
      }
    } catch (error) {
      console.warn(error);
      return {
        timestamp: new Date(),
        error: error
      }
    }
  }

  async run(data: PipelineRequestModel): Promise<PipelineExecutionModel> {
    const sourceServer = this.serverService.getServerById(data.sourceServerId);
    const distServer = this.serverService.getServerById(data.distServerId);
    try {
      const queryResult = await sourceServer.query(data.sql);
      if (queryResult.error != null) {
        console.warn(queryResult.error);
        return {
          timestamp: new Date(),
          error: queryResult.error.message
        }
      }
      const mappedData = await distServer.mapper(queryResult.rows, data.mapping)
      await distServer.save(mappedData, data.distTable);
      return {
        timestamp: new Date(),
        data: mappedData
      }
    } catch (error) {
      console.warn(error);
      return {
        timestamp: new Date(),
        error: error
      }
    }
  }

  private toStorageModel(pipeline: PipelineModel): PipelineStorageModel {
    return {
      ...pipeline,
      createdAt: pipeline.createdAt.toISOString(),
      modifiedAt: pipeline.modifiedAt.toDateString()
    }
  }

  private fromStorageModel(pipeline: PipelineStorageModel): PipelineModel {
    return {
      ...pipeline,
      createdAt: new Date(pipeline.createdAt),
      modifiedAt: new Date(pipeline.modifiedAt)
    }
  }
}