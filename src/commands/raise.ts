import { register } from '../config'
import * as incident from './incident'
import { sendHelp } from './incident-help'
import { sleep } from './util'

register('assign', 'Assign a role', async (bot, message, config, params) => {
  try {
    await incident.assignRole(bot, message, params)
  } catch (ex) {
    await bot.postMessage({
      channel: message.channel,
      text: `Unable to assign role: ${ex.message}`,
      ...config.defaultParams
    })
  }
})

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

register('raise', `Raise an incident record in JIRA`, async (bot, message, config, params) => {
  await bot.postMessage({
    channel: message.channel,
    text: `K. Hold on...`,
    ...config.defaultParams
  })

  try {
    const result = await incident.create(bot, message, params.join(' '))
    await bot.postMessage({
      channel: message.channel,
      text: [
        `Yep. Good.`,
        `I've raised *${result.ticketId}* (${result.jiraUrl})`,
        `*Journal*: ${result.confluenceUrl}`
      ].join('\n'),
      ...config.defaultParams
    })

    await sleep(250)
    const channel = await bot.getChannel(message.channel)
    await sleep(250)

    await bot.postMessage({
      channel: config.channel,
      text: `:rotating_light: An incident has been raised in <#${message.channel}|${
        channel.name
      }> :rotating_light:`,
      ...config.defaultParams
    })

    await sleep(250)

    await sendHelp(bot, message.channel)
  } catch (ex) {
    await bot.postMessage({
      channel: message.channel,
      text: ex.message,
      ...config.defaultParams
    })
  }
})
