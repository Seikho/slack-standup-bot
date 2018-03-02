import { register, setConfig } from '../config'

register('rebase', `Tell us all you rebased! \\o/`, async (bot, msg, cfg) => {
  await setConfig('rebaseCount', ++cfg.rebaseCount)
  const alarm = `:rotating_light: :rotating_light: :rotating_light:`

  const user = bot.users.find(user => user.id === msg.user)
  await bot.postMessage({
    channel: cfg.rebaseChannel,
    text: `${alarm} ${user!.real_name} has rebased!\n*Rebases today*: ${cfg.rebaseCount +
      1} ${alarm}`,
    ...cfg.defaultParams
  })
})
