import { getConfig } from '../config'
import { Bot, Message } from './types'
import { dispatch } from './command'

const SlackBot = require('slackbots')

export * from './types'

let _bot: any = null

export async function getBot(): Promise<Bot> {
  if (_bot) {
    return _bot
  }

  const config = getConfig()
  const bot = new SlackBot({ token: config.token, name: config.botName })
  try {
    await waitTilReady(bot)
  } catch (ex) {
    console.error('Failed to connect to Slack')
    process.exit(1)
  }

  listenForCommands(bot)

  bot.on('error', (err: any) => console.error(`SlackError: ${err.message || err}`))

  _bot = bot
  return _bot
}

function listenForCommands(bot: Bot) {
  const id = `<@${bot.self.id}>`

  bot.on('message', (data: Message) => {
    if (!data.text) {
      return
    }

    const text = data.text.trim()
    if (!text.startsWith(id)) {
      return
    }

    dispatch(bot, data, text.replace(id, ''))
  })
}

function waitTilReady(bot: Bot) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(), 5000)
    const cb = (data: any) => {
      console.log('Successfully connected')
      clearTimeout(timer)
      resolve()
    }

    bot.on('start', cb)
  })
}
