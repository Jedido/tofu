import { createGenerator } from "ts-json-schema-generator";

const schemas = new Map<string, Object>()

export class JsonSchema {
  jsonSchema: Object

  constructor(className: string) {
    if (schemas.has(className)) {
      this.jsonSchema = schemas.get(className)!!
    } else {
      const config = {
        path: "./server/assets/schemas.ts",
        tsconfig: "./tsconfig.json",
        type: className
      }
      const generator = createGenerator(config)
      this.jsonSchema = generator.createSchema(config.type)
    }
  }

  getJsonSchema(): Object {
    return this.jsonSchema
  }
}

export interface AnidleNames {
  properNouns: string[]
}
