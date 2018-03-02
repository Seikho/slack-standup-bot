import { register, setConfig } from '../config'

register('rebase', `Tell us all you rebased! \\o/`, async (bot, msg, cfg) => {
  const nextCount = ++cfg.rebaseCount
  await setConfig('rebaseCount', nextCount)
  const alarm = `:rotating_light: :rotating_light: :rotating_light:`

  const user = bot.users.find(user => user.id === msg.user)
  await bot.postMessage({
    channel: cfg.rebaseChannel,
    text: `${alarm} ${user!.real_name} has rebased! ${alarm}\n*Rebases today*: ${nextCount}`,
    ...cfg.defaultParams
  })
})

register('rebases', `Find out how many people enjoyed rebasing today`, async (bot, msg, cfg) => {
  await bot.postMessage({
    channel: msg.channel,
    text: `*Rebases today*: ${cfg.rebaseCount}`,
    ...cfg.defaultParams
  })
})
