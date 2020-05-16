export function createValidator(object: any, ...protectedKeys: string[]) {
  parseIsObject(object);
  const obfuscatedObject = { ...object };
  protectedKeys.forEach(protectedKey => {
    if (protectedKey in obfuscatedObject) {
      obfuscatedObject[protectedKey] = '<obfuscated>'
    }
  })
  return {
    isNotEmptyString(key: string): string {
      const value = object[key];
      if ((typeof value === 'string' || value instanceof String) && value !== '') {
        return value as string;
      }
      throw Error(`value='${value}' of property='${key}' in object='${JSON.stringify(obfuscatedObject)}' must be not empty string`);
    },
    isInteger(key: string): number {
      const value = object[key];
      if (Number.isInteger(value)) {
        return value;
      }
      throw Error(`value='${value}' of property='${key}' in object='${JSON.stringify(obfuscatedObject)}' must be integer`);
    },
    isArray(key: string): any[] {
      const value = object[key];
      if (Array.isArray(value)) {
        return value;
      }
      throw Error(`value='${value}' of property='${key}' in object='${JSON.stringify(obfuscatedObject)}' must be an array`);
    }
  }
}

function parseIsObject(obj: any): void | never {
  if (typeof obj !== 'object' || obj === null) {
    throw Error(`'${obj}' is not an object`);
  }
}
