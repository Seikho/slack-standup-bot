import { register, setConfig } from '../config'
import * as needle from 'needle'

register('rebase', `Tell us all you rebased! \\o/`, async (bot, msg, cfg) => {
  const nextCount = cfg.rebaseCount + 1
  await setConfig('rebaseCount', nextCount)
  const alarm = `:rotating_light: :rotating_light: :rotating_light:`

  const user = bot.users.find(user => user.id === msg.user)

  const sendMessage = (postMessage?: string) => {
    const messages = [
      `${alarm} ${user!.real_name} has rebased! ${alarm}`,
      `*Rebases today*: ${nextCount}`
    ]

    if (postMessage) {
      messages.push(postMessage)
    }

    bot.postMessage({
      channel: cfg.rebaseChannel,
      text: messages.join('\n'),
      ...cfg.defaultParams
    })
  }

  if (cfg.rebaseUrl) {
    needle.post(`${cfg.rebaseUrl}/rebase?token=${cfg.rebaseUrlToken}`, {}, (err, res) => {
      if (err) {
        console.error(`Failed to reset rebase count: ${err}`)
        return
      }

      if (!res) {
        return
      }

      if (res.statusCode === 200) {
        sendMessage(`<${cfg.rebaseUrl}|DaysSinceLastRebase> has been reset!`)
        return
      }

      console.error(`Failed to reset rebase count: Status code: ${res.statusCode}`)
    })
    return
  }

  sendMessage()
})

register('rebases', `Find out how many people enjoyed rebasing today`, async (bot, msg, cfg) => {
  await bot.postMessage({
    channel: msg.channel,
    text: `*Rebases today*: ${cfg.rebaseCount}`,
    ...cfg.defaultParams
  })
})
