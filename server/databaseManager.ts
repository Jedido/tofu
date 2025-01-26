const dotenv = require('dotenv')

dotenv.config({ path: `.env.local` })
dotenv.config()

import fs from "fs"
import { Database, Statement } from 'sqlite3'
const dbFile = "./tofu.db"

export function run(sql: string, ...args: string[]) {
  const db: Database = new Database(dbFile)
  db.run(sql, ...args)
  db.close()
}

export function get(sql: string, ...args: string[]) {
  const db: Database = new Database(dbFile)
  const stmt: Statement = db.prepare(sql)
  stmt.run(...args, () => {

  })
  db.serialize(() => {
    db.run(sql)
  })
}

export async function initDatabaseManager() {
  const sqlCommands = fs.readFileSync("./scripts/initDatabases.sql", 'utf-8')
  const db: Database = new Database(dbFile)
  db.serialize(() => {
    db.run(sqlCommands)
  })
}

