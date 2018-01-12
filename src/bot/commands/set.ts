import { register } from '../command'
import { setConfig } from '../../config'

const setableKeys = {
  botName: 'Bot display name. Default: `Standup Phteve`',
  botEmoji: 'Bot emoji. Must be a default emoji. Default: `:derpderp:`',
  botChannel: 'Standup channel. Default: `topic-standup`',
  botTimezone: 'Timezone the bot should operate in. Default: `8`',
  standupTime: 'Standup time. 24hour format. Default: `09:00`',
  standupTimeout: 'Standup timeout in seconds. Default: `900` (15minutes)',
  standupCompleted: 'Manually reset the standupCompleted flag. E.g. `set standupCompleted false`',
  debug: 'Enable debug mode. Default: `false`'
}

const keys = Object.keys(setableKeys)

register(
  'set',
  `Update configuration. Available keys: ${keys.join(
    ', '
  )}.\n Usage: set [key] [...value].\n For info on the keys, use \`help\` with no parameters.`,
  async (bot, message, config, params) => {
    const [key, ...values] = params
    const value = values.join(' ')

    if (!key || !value) {
      await bot.postMessage(message.channel, getHelpMessage(), config.defaultParams)
      return
    }

    try {
      const newConfig = await setConfig(key, value)
      await bot.postMessage(
        message.channel,
        `Successfully updated *${key}*`,
        newConfig.defaultParams
      )
    } catch (ex) {
      await bot.postMessage(
        message.channel,
        `${ex.message}\n${getHelpMessage()}`,
        config.defaultParams
      )
    }
  }
)

function getHelpMessage() {
  const lines: string[] = []
  for (const key in setableKeys) {
    lines.push(`*${key}*: ${(setableKeys as any)[key]}`)
  }
  return lines.join('\n')
}
