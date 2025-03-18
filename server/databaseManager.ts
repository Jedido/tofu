const dotenv = require('dotenv')

dotenv.config({ path: `.env.local` })
dotenv.config()

import fs from "fs"
import { Database, Statement } from 'sqlite3'
const { getDurationMs } = require("./utils/timing")

const dbFile = "./server/tofu.db"
const db: Database = new Database(dbFile)


export async function run(sql: string, ...args: any[]): Promise<{ lastID: number, changes: number }> {
  const start = process.hrtime()
  return new Promise((resolve, reject) => {
    db.run(sql, args, function(this: { lastID: number, changes: number }, err: Error | null) {
      if (err) {
        console.error({
          cat: "client",
          client: "db-client",
          status: "error",
          durationms: getDurationMs(start),
          in: {
            sql, args
          },
          out: err
        })    
        reject(err)
      } else {
        console.log({
          cat: "client",
          client: "db-client",
          status: "success",
          durationms: getDurationMs(start),
          in: {
            sql, args: args.map(arg => JSON.stringify(arg).substring(0, 20))
          },
          out: {
            lastID: this.lastID,
            changes: this.changes
          }
        })
        resolve({
          lastID: this.lastID,
          changes: this.changes
        })
      }
    })
  })
}

export async function get(sql: string, ...args: any[]): Promise<any> {
  const start = process.hrtime()
  return new Promise((resolve, reject) => {
    db.all(sql, ...args, (err: Error | null, rows: any[]) => {
      if (err) {
        console.error({
          cat: "client",
          client: "db-client",
          status: "error",
          durationms: getDurationMs(start),
          in: {
            sql, args
          },
          out: err
        })    
        reject(err)
      } else {
        console.log({
          cat: "client",
          client: "db-client",
          status: "success",
          durationms: getDurationMs(start),
          in: {
            sql, args
          },
          out: `${rows?.length || 0} rows`
        })    
        resolve(rows)
      }
    })
  })
}

export async function initDatabaseManager() {
  const sqlCommands = fs.readFileSync("./server/scripts/initDatabases.sql", 'utf-8')
  db.serialize(() => {
    db.exec(sqlCommands)
  })
}
