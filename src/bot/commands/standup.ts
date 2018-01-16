import { register } from '../command'
import { setConfig } from '../../config'

register('standup', 'Manually start standup', async (bot, message, config, params) => {
  await setConfig('standupCompleted', false)

  await bot.postMessage({
    channel: message.channel,
    text: 'Starting standup...',
    ...config.defaultParams
  })
})
