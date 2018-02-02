import { register } from '../command'
import { setConfig } from '../../config'

register(
  'uh-oh',
  'Create a new incident. Start here.',
  async (bot, message, config, params) => {
    const name = params.join(" ")

    const nameIsValid = (name.length > 0)
    if (!nameIsValid) {
      await bot.postMessage({
        channel: message.channel,
        text: `What name do you want for the incident?`,
        ...config.defaultParams
      })
      return
    }

    await setConfig('incidentName', name)
    await bot.postMessage({
      channel: message.channel,
      text: 'New incident! ' + name,
      ...config.defaultParams
    })
  }
)
