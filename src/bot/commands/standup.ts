import { register } from '../command'
import { setConfig } from '../../config'

register('standup', 'Manually start standup', async (bot, message, config, params) => {
  await setConfig('standupCompleted', false)

  await bot.postMessage(message.channel, 'Starting standup...', config.defaultParams)
})
