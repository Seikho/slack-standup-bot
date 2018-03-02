import { register } from '../config'
import { setOpenState, getIncident } from './incident'

register('incidents', 'List the open incidents', async (bot, msg, cfg) => {
  const incidentKeys = Object.keys(cfg.incidents)
  const messages = ['*Current open incidents*:']

  for (const key of incidentKeys) {
    const incident = cfg.incidents[key]
    if (!incident.isOpen) {
      continue
    }

    const channel = bot.channels.find(ch => ch && ch.id === incident.channel)
    messages.push(
      `<#${channel!.id}|${channel!.name}>: ${incident.ticketId} -- ${incident.description}`
    )
  }

  if (messages.length === 1) {
    await bot.postMessage({
      channel: msg.channel,
      text: 'There are currently no open incidents',
      ...cfg.defaultParams
    })
    return
  }
  await bot.postMessage({ channel: msg.channel, text: messages.join('\n'), ...cfg.defaultParams })
})

register('close', 'Close an incident', async (bot, msg, cfg, params) => {
  try {
    await setOpenState(msg.channel, false)
    await bot.postMessage({
      channel: msg.channel,
      text: `Incident has been closed`,
      ...cfg.defaultParams
    })

    const channel = bot.channels.find(ch => ch.id === msg.channel)
    await bot.postMessage({
      channel: cfg.channel,
      text: `The incident in <#${msg.channel}|${channel!.name}> has been closed`,
      ...cfg.defaultParams
    })
    return
  } catch (ex) {
    await bot.postMessage({
      channel: msg.channel,
      text: `Failed to change incident state: ${ex.message}`,
      ...cfg.defaultParams
    })
  }
})

register('open', 'Re-open an incident', async (bot, msg, cfg, params) => {
  try {
    await setOpenState(msg.channel, true)
    const incident = getIncident(msg.channel)

    const incidentInfo = [
      `*Severity*: ${incident.severity}`,
      `*Issue*: ${incident.description}`,
      `*Jira*: ${incident.ticketId}: ${incident.jiraUrl}`,
      `*Confluence*: ${incident.confluenceUrl}`
    ]

    await bot.postMessage({
      channel: msg.channel,
      text: [`Incident has been re-opened`, ...incidentInfo].join('\n'),
      ...cfg.defaultParams
    })

    const channel = bot.channels.find(ch => ch.id === msg.channel)

    await bot.postMessage({
      channel: cfg.channel,
      text: [
        `:rotating_light: An incident has been *re-opened* in <#${msg.channel}|${
          channel!.name
        }> :rotating_light:`,
        ...incidentInfo
      ].join('\n'),
      ...cfg.defaultParams
    })

    return
  } catch (ex) {
    await bot.postMessage({
      channel: msg.channel,
      text: `Failed to change incident state: ${ex.message}`,
      ...cfg.defaultParams
    })
  }
})
