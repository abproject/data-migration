import * as AWS from 'aws-sdk';
import { createValidator } from '../../validator';
import { PipelineStorageModel } from './pipeline.model';

interface S3ServerConfig {
  bucket: string;
  region: string;
}

export class PipelineRepository {
  private config: S3ServerConfig;
  private s3: AWS.S3;

  constructor(config: any) {
    this.config = this.parseConfig(config);
    AWS.config.update({ region: this.config.region });
    this.s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  }

  getAll(): Promise<PipelineStorageModel[]> {
    return new Promise((resolve, reject) => {
      const request: AWS.S3.ListObjectsRequest = {
        Bucket: this.config.bucket,
        Delimiter: '/',
      }
      this.s3.listObjects(request, (error, data) => {
        if (error) {
          console.warn(error);
          return reject(error)
        }
        return resolve(data.Contents);
      })
    }).then((files: AWS.S3.Types.ObjectList) => {
      return Promise.all(files.map(async file => {
        return this.get(file.Key);
      }));
    });
  }

  get(key: string): Promise<PipelineStorageModel> {
    return new Promise((resolve, reject) => {
      const getObjectRequest: AWS.S3.Types.GetObjectRequest = {
        Bucket: this.config.bucket,
        Key: key,
      }
      this.s3.getObject(getObjectRequest, (error, data: AWS.S3.Types.GetObjectOutput) => {
        if (error) {
          console.warn(error);
          return reject(error)
        }
        const body: PipelineStorageModel = JSON.parse(data.Body.toString())
        return resolve(body);
      })
    });
  }


  save(key: string, model: PipelineStorageModel): Promise<AWS.S3.Types.PutObjectOutput> {
    return new Promise((resolve, reject) => {
      const putObjectRequest: AWS.S3.Types.PutObjectRequest = {
        Bucket: this.config.bucket,
        Key: key,
        Body: JSON.stringify(model),
        ContentType: 'application/json; charset=utf-8'
      };
      this.s3.putObject(putObjectRequest, (error, data) => {
        if (error) {
          console.warn(error);
          return reject(error)
        }
        return resolve(data)
      })
    });
  }

  delete(key: string): Promise<AWS.S3.Types.DeleteObjectsOutput> {
    return new Promise((resolve, reject) => {
      const deleteObjectRequest: AWS.S3.Types.DeleteObjectRequest = {
        Bucket: this.config.bucket,
        Key: key
      };
      this.s3.deleteObject(deleteObjectRequest, (error, data) => {
        if (error) {
          console.warn(error);
          return reject(error)
        }
        return resolve(data)
      })
    });
  }

  private parseConfig(config: any): S3ServerConfig {
    const validator = createValidator(config);
    return {
      bucket: validator.isNotEmptyString('bucket'),
      region: validator.isNotEmptyString('region')
    }
  }
}