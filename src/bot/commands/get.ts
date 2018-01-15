import { register } from '../command'
import { getConfig } from '../../config'
import { setableKeys } from './set'

register('get', `Get the value of a configuration key`, async (bot, message, config, params) => {
  const key = params[0]
  if (key in setableKeys) {
    const value = (getConfig() as any)[key]
    bot.postMessage(
      message.channel,
      `*${key}*: \`${JSON.stringify(value, null, 2)}\``,
      config.defaultParams
    )
    return
  }

  await bot.postMessage(message.channel, 'Invalid configuration key', config.defaultParams)
})
