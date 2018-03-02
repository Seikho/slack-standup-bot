import { setup } from 'slacklibbot'

const { setConfig, getConfig, register } = setup<Config>(
  {
    name: 'Phtandup Phteve',
    emoji: ':derpderp:',
    channel: 'topic-standup',
    timezone: 8,
    users: [],
    standupCompleted: true,
    standupTime: '09:00', // 24hour format
    standupDays: [1, 2, 3, 4, 5], // Monday to Friday
    standupTimeout: 900, // 15 minutes
    rebaseChannel: 'interest-memes-sfw',
    rebaseCount: 0,
    rebaseRecord: 0
  },
  ['rebaseCount', 'rebaseRecord']
)

export { setConfig, getConfig, register }

/**
 * The top-level configuration keys changed
 * This will backfill them if they aren't set
 */

export async function backfillConfig() {
  const cfg: any = getConfig()
  if (cfg.name !== cfg.botName) {
    await setConfig('name', cfg.botName)
    await setConfig('emoji', cfg.botEmoji)
    await setConfig('timezone', cfg.botTimezone)
    await setConfig('channel', cfg.botChannel)
  }
}

export interface Config {
  name: string
  emoji: string
  channel: string
  timezone: number

  users: string[]

  standupCompleted: boolean
  standupTime: string
  standupDays: number[]
  standupTimeout: number

  rebaseChannel: string
  rebaseCount: number
  rebaseRecord: number
}
