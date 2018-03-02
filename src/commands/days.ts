import { register, setConfig } from '../config'

register(
  'days',
  'Set standup days. E.g.: `days 1 2 3 4 5` for Mon -> Fri',
  async (bot, message, config, params) => {
    const days = params.map(p => Number(p))

    const allDaysValid = days.every(day => day >= 1 && day <= 7)
    if (!allDaysValid) {
      await bot.postMessage({
        channel: message.channel,
        text: `Invalid days specified. Valid days are 1 -> 7`,
        ...config.defaultParams
      })
      return
    }

    await setConfig('standupDays', days)
    await bot.postMessage({
      channel: message.channel,
      text: 'Successfully updated standup days',
      ...config.defaultParams
    })
  }
)
