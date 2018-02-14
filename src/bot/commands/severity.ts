import { register } from '../command'
import { setSeverity } from '../incident'

register('severity', 'Set the severity of the incident', async (bot, message, config, params) => {
  try {
    await setSeverity(message.channel, params[0] as any)
    await bot.postMessage({
      channel: message.channel,
      text: `Severity set to '${params[0]}'`
    })
    return
  } catch (ex) {
    await bot.postMessage({
      channel: message.channel,
      text: `Failed to set seveity: ${ex.message}`
    })
  }
})
