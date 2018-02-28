import { register } from '../config'
import * as incident from './incident'

register('assign', 'Assign a role', async (bot, message, config, params) => {
  try {
    await incident.assignRole(bot, message, params)
  } catch (ex) {
    await bot.postMessage({
      channel: message.channel,
      text: `Unable to assign role: ${ex.message}`,
      ...config.defaultParams
    })
  }
})
