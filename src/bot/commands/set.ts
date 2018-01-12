import { register } from '../command'
import { setConfig, setableKeys } from '../../config'

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
