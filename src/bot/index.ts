import { getConfig } from '../config'
import { dispatch } from './command'
import { SlackClient, Chat } from 'slacklib'

let _bot: any = null

export async function getBot(): Promise<SlackClient> {
  if (_bot) {
    return _bot
  }

  const config = getConfig()
  const bot = new SlackClient({ token: config.token })
  try {
    await waitTilReady(bot)
  } catch (ex) {
    console.error('Failed to connect to Slack')
    process.exit(1)
  }

  listenForCommands(bot)

  bot.on('error', (err: any) => console.error(`SlackError: ${err.message || err}`))
  bot.setMaxListeners(Infinity)

  _bot = bot
  return _bot
}

function listenForCommands(bot: SlackClient) {
  const id = `<@${bot.self.id}>`

  bot.on('message', (data: Chat.Message) => {
    if (!data.text) {
      return
    }

    if (data.subtype === 'channel_join') {
      return
    }

    const text = data.text.trim()
    if (!text.startsWith(id)) {
      return
    }

    dispatch(bot, data, text.replace(id, ''))
  })
}

function waitTilReady(bot: SlackClient) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(), 5000)
    const cb = (data: any) => {
      console.log('Successfully connected')
      clearTimeout(timer)
      resolve()
    }

    bot.on('connected', cb)
  })
}
