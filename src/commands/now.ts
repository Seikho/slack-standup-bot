import { register } from '../config'

register('now', `What the current time is on the bot`, async (bot, message, config, params) => {
  bot.postMessage({
    channel: message.channel,
    text: new Date().toLocaleString(),
    ...config.defaultParams
  })
})
