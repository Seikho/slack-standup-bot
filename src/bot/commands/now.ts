import { register } from '../command'

register('now', `What the current time is on the bot`, async (bot, message, config, params) => {
  bot.postMessage(message.channel, new Date().toLocaleString(), config.defaultParams)
})
