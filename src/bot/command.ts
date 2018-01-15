import { Bot, Message } from './types'
import { getConfig, Config } from '../config'

export type CommandListener = {
  desc: string
  callback: (bot: Bot, message: Message, config: Config, params: string[]) => void
}

const listeners: { [command: string]: CommandListener } = {}

export function register(command: string, desc: string, callback: CommandListener['callback']) {
  listeners[command] = { desc, callback }
}

export async function dispatch(bot: Bot, msg: Message, text: string) {
  const cfg = getConfig()
  const [cmd, ...params] = text.trim().split(' ')
  if (!listeners[cmd]) {
    await bot.postMessage(
      msg.channel,
      `Unrecognized command: *${cmd}*. Type @${bot.self.name} help for more information.`,
      cfg.defaultParams
    )
    return
  }

  const user = bot.users.find(user => user.id === msg.user)
  console.log(`User: ${user!.name} | Cmd: ${cmd} | Params: ${params}`)
  listeners[cmd].callback(bot, msg, cfg, params)
}

export function getDescriptions() {
  const commands = Object.keys(listeners).map(key => ({ command: key, desc: listeners[key].desc }))
  return commands
}
