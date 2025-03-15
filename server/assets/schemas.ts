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

export interface RPGInit {
  title: string
  premise: string
  classes: string[]
}

export interface RPGEntity {
  name: string
  description: string
  hp: number
}

export interface RPGAttack {
  name: string
  damage: number
}

export interface RPGPercent {
  percentage: number
}

export interface RPGEnemyAction {
  percentage: number
  action: string
}

export interface RPGActionResult {
  description: string
  result: {
    name: string
    damage: number
  }[]
}
