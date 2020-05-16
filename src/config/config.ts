import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';

interface ConfigBody {
  storage: any;
  servers: any;
}

class Config {
  private configPath = 'config.yaml';
  private config: ConfigBody;

  constructor() {
    this.config = this.parseConfig();
  }

  get path(): string {
    return this.configPath;
  }

  get servers(): any {
    return this.config.servers;
  }

  get storage(): any {
    return this.config.storage;
  }

  private parseConfig(): ConfigBody {
    return yaml.safeLoad(readFileSync(this.configPath, 'utf8'), {});
  }
}

let config: Config;

export function getConfig() {
  if (config == null) {
    config = new Config();
  }
  return config;
}