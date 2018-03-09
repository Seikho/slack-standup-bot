import { register } from '../config'
import { setOpenState, getIncident } from './incident'
import { ticketToURL } from './incident/jira'

register('incidents', 'List the open incidents', async (bot, msg, cfg) => {
  const incidentKeys = Object.keys(cfg.incidents)
  const messages = ['*Current open incidents*:']

  for (const key of incidentKeys) {
    const incident = cfg.incidents[key]
    if (!incident.isOpen) {
      continue
    }

    let channel = bot.channels.find(ch => ch && ch.id === incident.channel)

    if (!channel) {
      // This should re-fill the cache with any missing channels
      const allChannels = await bot.getChannels()
      channel = allChannels.find(ch => ch && ch.id === incident.channel)
    }

    const channelName = channel ? channel.name : 'channel-name-unknown'

    const ticketUrl = ticketToURL(incident.ticketId)
    messages.push(
      `<#${incident.channel}|${channelName}>: <${ticketUrl}|${incident.ticketId}> -- ${
        incident.description
      }`
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

register('details', 'Get the incident information of the incident', async (bot, msg, cfg) => {
  const incident = getIncident(msg.channel)

  if (!incident) {
    await bot.postMessage({
      channel: msg.channel,
      text: 'There is no incident information for this channel',
      ...cfg.defaultParams
    })
    return
  }

  const info = [
    `*Status*: ${incident.isOpen ? 'OPEN' : 'CLOSED'}`,
    `*Severity*: ${incident.severity}`,
    `*Issue*: ${incident.description}`,
    `*Jira*: ${incident.ticketId}: ${incident.jiraUrl}`,
    `*Confluence*: ${incident.confluenceUrl}`
  ]

  await bot.postMessage({
    channel: msg.channel,
    text: info.join('\n'),
    ...cfg.defaultParams
  })
})
