import fs from "fs"
import { Database } from "bun:sqlite"
import { getDurationMs } from "./utils/timing.ts"

const dbFile = "./server/tofu.db"
const db = new Database(dbFile)

export async function run(sql: string, ...args: any[]): Promise<{ lastID: number, changes: number }> {
  const start = process.hrtime()
  try {
    const result = db.prepare(sql).run(...args)
    return {
      lastID: Number(result.lastInsertRowid),
      changes: result.changes
    }
  } catch (err) {
    console.error({
      cat: "client",
      client: "db-client",
      status: "error",
      durationms: getDurationMs(start),
      in: { sql, args },
      out: err
    })
    throw err
  }
}

export async function get(sql: string, ...args: any[]): Promise<any[]> {
  const start = process.hrtime()
  try {
    return db.prepare(sql).all(...args)
  } catch (err) {
    console.error({
      cat: "client",
      client: "db-client",
      status: "error",
      durationms: getDurationMs(start),
      in: { sql, args },
      out: err
    })
    throw err
  }
}

export function initDatabaseManager() {
  const sqlCommands = fs.readFileSync("./server/scripts/initDatabases.sql", 'utf-8')
  db.exec(sqlCommands)
}
