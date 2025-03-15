const dotenv = require('dotenv')

dotenv.config({ path: `.env.local` })
dotenv.config()

import fs from "fs"
import { Database, Statement } from 'sqlite3'
const { getDurationMs } = require("./utils/timing")

const dbFile = "./server/tofu.db"
const db: Database = new Database(dbFile)


export async function run(sql: string, ...args: (string | number)[]) {
  db.run(sql, ...args)
}

export async function get(sql: string, ...args: string[]): Promise<any> {
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
      }
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
    })
  })
}

export async function initDatabaseManager() {
  const sqlCommands = fs.readFileSync("./server/scripts/initDatabases.sql", 'utf-8')
  db.serialize(() => {
    db.exec(sqlCommands)
  })
}

