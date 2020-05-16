import { Server, ServerResponseModel, ServerType, QueryResult } from '../server.model';
import { DynamoDBServerConfig } from './dynamodb-server.model';
import { createValidator } from '../../../validator';
import * as AWS from 'aws-sdk';
import { PropertyMapper, PipelineRequestModel } from '../../pipeline';

export class DynamoDBServer implements Server {
  readonly id: string;
  private config: DynamoDBServerConfig;
  private dynamodb: AWS.DynamoDB;
  private chunkSize = 25;

  constructor(config: any) {
    this.config = this.parseConfig(config);
    this.id = this.config.id;
    AWS.config.update({ region: this.config.region });
    this.dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
  }

  async query(): Promise<QueryResult> {
    throw Error('DynamoDB query is not implemented');
  }

  async mapper(rows: { [key: string]: any }[], mapper: PropertyMapper[]): Promise<any[]> {
    return rows.map(row => this.createPutItemInputAttributeMap(row, mapper));
  }

  async save(items: AWS.DynamoDB.PutItemInputAttributeMap[], table: string): Promise<(void | AWS.DynamoDB.BatchWriteItemOutput)[]> {

    const paramsChunks = this.createDynamoDBBatchRequest(items, table);

    return await Promise.all(paramsChunks.map(async params => {
      let promiseResult = await this.dynamodb.batchWriteItem(params).promise()
      if (promiseResult.$response.error) {
        throw promiseResult.$response.error
      }
      return promiseResult.$response.data;
    }));
  }

  toServerResponseModel(): ServerResponseModel {
    const { region, ...model } = this.config;
    return { ...model, host: region };
  }

  private parseConfig(config: any): DynamoDBServerConfig {
    const validator = createValidator(config);
    return {
      id: validator.isNotEmptyString('id'),
      type: ServerType.DynamoDB,
      name: validator.isNotEmptyString('name'),
      region: validator.isNotEmptyString('region'),
      profile: validator.isNotEmptyString('profile')
    }
  }


  private createDynamoDBBatchRequest(items: AWS.DynamoDB.PutItemInputAttributeMap[], table: string): AWS.DynamoDB.Types.BatchWriteItemInput[] {
    return this.splitRowsToChunks(items)
      .map(rowsChunk => this.createBatchWriteItemInput(rowsChunk, table));
  }

  private splitRowsToChunks(items: AWS.DynamoDB.PutItemInputAttributeMap[]): AWS.DynamoDB.PutItemInputAttributeMap[][] {
    const chunks: AWS.DynamoDB.PutItemInputAttributeMap[][] = [];
    for (let i = 0; i < items.length; i += this.chunkSize) {
      chunks.push(items.slice(i, i + this.chunkSize))
    }
    return chunks;
  }

  private createBatchWriteItemInput(items: AWS.DynamoDB.PutItemInputAttributeMap[], table: string): AWS.DynamoDB.Types.BatchWriteItemInput {
    return {
      RequestItems: {
        [table]: items.map(item => ({
          PutRequest: {
            Item: item
          }
        }))
      }
    }
  }

  private createPutItemInputAttributeMap(item: { [key: string]: any }, mapper: PropertyMapper[]): AWS.DynamoDB.PutItemInputAttributeMap {
    return mapper.reduce((total, mapperItem) => {
      const value = item[mapperItem.source];
      if (value != null) {
        total[mapperItem.dist] = { [mapperItem.distType]: value + '' };
      }
      return total;
    }, {} as AWS.DynamoDB.PutItemInputAttributeMap)
  }
}