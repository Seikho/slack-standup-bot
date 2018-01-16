import { register } from '../command'
import { getConfig } from '../../config'
import { setableKeys } from './set'

register('get', `Get the value of a configuration key`, async (bot, message, config, params) => {
  const key = params[0]
  if (key in setableKeys) {
    const value = (getConfig() as any)[key]
    bot.postMessage({
      channel: message.channel,
      text: `*${key}*: \`${JSON.stringify(value, null, 2)}\``,
      ...config.defaultParams
    })
    return
  }

  const availableKeys = Object.keys(setableKeys).join(', ')
  await bot.postMessage({
    channel: message.channel,
    text: `Invalid configuration key. Available keys: ${availableKeys}`,
    ...config.defaultParams
  })
})
