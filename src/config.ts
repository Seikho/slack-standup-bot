import * as db from 'webscaledb'
import * as path from 'path'
import * as fs from 'fs'

const DB_NAME = path.join(__dirname, '..', 'database', 'config.json')

export interface Incident {
  channel: string
  ticketId: string
  severity: '1' | '2' | '3' | '4'
  description: string
  roles: { [user: string]: { name: string; assigns: string[] } }
  confluenceUrl: string
  jiraUrl: string
}

export interface Config {
  token: string

  botName: string
  botEmoji: string
  botChannel: string
  botTimezone: number

  incidents: { [channel: string]: Incident }

  jiraUsername: string
  jiraPassword: string

  confluenceUsername: string
  confluencePassword: string

  debug: boolean
  log: boolean
  defaultParams: any
}

export async function initaliseConfig() {
  // If the config file does not exist, create one
  try {
    fs.statSync(DB_NAME)
  } catch (ex) {
    fs.writeFileSync(DB_NAME, JSON.stringify({ token: process.env.SLACK_TOKEN || '' }, null, 2))
  }

  const raw = await restoreAsync()
  if (!raw.token) {
    throw new Error('ConfigError: Token is not configured')
  }

  await backupAsync({ ...(defaultConfig as any), ...raw })
}

export function getConfig(): Config {
  const raw = db.get()
  const config = parseConfig(raw)
  return config
}

function parseConfig(rawConfig: db.Config) {
  const cfg = rawConfig as Config

  const config = { ...defaultConfig, ...cfg }
  return {
    ...config,
    defaultParams: { icon_emoji: config.botEmoji, username: config.botName, as_user: false }
  }
}

export async function setConfig(key: keyof typeof defaultConfig, value: any) {
  const originalValue = db.get(key)
  const parseReqd = typeof originalValue !== 'string' && typeof value === 'string'
  const valueToStore = parseReqd ? JSON.parse(value) : value
  db.set(key, valueToStore)
  await backupAsync()
  const newConfig = parseConfig(db.get())
  return newConfig
}

function restoreAsync() {
  return new Promise<db.Config>((resolve, reject) => {
    db.restore(DB_NAME, (err, raw) => {
      if (err) {
        return reject(err)
      }

      return resolve(raw)
    })
  })
}

function backupAsync(cfg?: Config) {
  if (cfg) {
    for (const key in cfg) {
      db.set(key, (cfg as any)[key])
    }
  }

  return new Promise<void>(resolve => {
    db.backup(DB_NAME, () => resolve())
  })
}

const defaultConfig = {
  botName: 'FarkBot',
  botEmoji: ':kimcry:',
  botChannel: 'serenity-testing',
  botTimezone: 8,
  incidents: {},
  debug: false,
  log: false
}
