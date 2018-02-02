import { register } from '../command'
import { setConfig } from '../../config'

register(
  'severity',
  'Set the severity of the incident',
  async (bot, message, config, params) => {
    const severity = params.join(" ")

    const isValid = (severity.length > 0)
    if (!isValid) {
      await bot.postMessage({
        channel: message.channel,
        text: `What is the severity of the incident?`,
        ...config.defaultParams
      })
      return
    }

    await setConfig('incidentName', severity)
    await bot.postMessage({
      channel: message.channel,
      text: 'Severity is ' + severity,
      ...config.defaultParams
    })
  }
)
