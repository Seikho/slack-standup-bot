import * as db from 'webscaledb'
import * as path from 'path'
import * as fs from 'fs'

class ConfigError extends Error {
  constructor(msg: string) {
    super(`ConfigError: ${msg}`)
  }
}

const DB_NAME = path.join(__dirname, '..', 'config.json')

export interface Config {
  token: string

  botName: string
  botEmoji: string
  botChannel: string

  users: string[]

  standupCompleted: boolean
  standupTime: string
  standupDays: number[]
  standupTimeout: 900 // 15 minutes

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
    throw new ConfigError('Token is not configured')
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
  return { ...config, defaultParams: { icon_emoji: config.botEmoji, username: config.botName } }
}

export async function setConfig(key: string, value: any) {
  const originalValue = db.get(key)
  const parseReqd = typeof originalValue !== 'string' && typeof value === 'string'
  const valueToStore = parseReqd ? JSON.parse(value) : value
  db.set(key, valueToStore)
  await backupAsync()
  const newConfig = parseConfig(db.get())
  return newConfig
}

export async function toggleUser(user: string, op: 'add' | 'del') {
  const users = db.get('users') as string[]

  const exists = users.some(u => user === u)
  if (op === 'add') {
    if (exists) {
      return
    }
    users.push(user)
    await setConfig('users', users)
    return
  }

  if (op === 'del') {
    if (!exists) {
      return
    }

    await setConfig('users', users.filter(u => user !== u))
    return
  }
}

export async function toggleDays(days: number[]) {
  await setConfig('days', days)
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
  botName: 'Standup Phteve',
  botEmoji: ':derpderp:',
  botChannel: 'topic-standup',
  users: [],
  standupCompleted: true,
  standupTime: '09:00', // 24hour format
  standupDays: [1, 2, 3, 4, 5], // Monday to Friday
  standupTimeout: 7200,
  debug: false,
  log: false
}
