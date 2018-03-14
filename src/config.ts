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
    rebaseRecord: 0,
    rebaseUrl: '',
    rebaseUrlToken: '',
    roshambo: {}
  },
  ['rebaseCount', 'rebaseRecord', 'rebaseUrlToken', 'roshambo']
)

export { setConfig, getConfig, register }

/**
 * The top-level configuration keys changed
 * This will backfill them if they aren't set
 */

export async function backfillConfig() {
  const cfg: any = getConfig()

  // Set all players to out of game
  const roshambo = cfg.roshambo
  const players = Object.keys(roshambo)
  for (const id of players) {
    roshambo[id].inGame = false
  }

  await setConfig('roshambo', roshambo)

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
  rebaseUrl: string
  rebaseUrlToken: string

  roshambo: { [userId: string]: Roshambo }
}

export interface Roshambo {
  rating: number
  userId: string
  inGame: boolean
  wins: number
  losses: number
  draws: number
}
