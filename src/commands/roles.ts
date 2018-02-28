import { register } from '../config'
import * as incident from './incident'

register('roles', 'List assigned roles', async (bot, message, config, params) => {
  const inc = incident.getIncident(message.channel)
  if (!inc) {
    await bot.postMessage({
      channel: message.channel,
      text: `Unable to get roles: There is no incident in this channel`,
      ...config.defaultParams
    })
    return
  }

  const users = Object.keys(inc.roles)
  if (!users.length) {
    await bot.postMessage({
      channel: message.channel,
      text: 'No roles are currently assigned',
      ...config.defaultParams
    })
    return
  }

  const msg = [
    `[*${inc.ticketId || 'OPS-???'}*] The following roles are assigned:`,
    ...users.map(user => `*${inc.roles[user].name}*: ${inc.roles[user].assigns.join(', ')}`)
  ].join('\n')

  await bot.postMessage({
    channel: message.channel,
    text: msg,
    ...config.defaultParams
  })
})
