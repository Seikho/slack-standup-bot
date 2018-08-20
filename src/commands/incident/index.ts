import { SlackClient, Chat } from 'slacklib'
import { setConfig, getConfig, Incident } from '../../config'
import { createJiraTicket } from './jira'
import { createConfluenceDoc } from './confluence'

export async function create(
  bot: SlackClient,
  msg: Chat.Message,
  severity: Incident['severity'],
  desc: string
) {
  const incidents = getConfig().incidents
  const existing = incidents[msg.channel]
  if (existing) {
    throw new Error(`Unable to create incident: One already exists for this channel`)
  }

  const ticket = await createJiraTicket(desc)
  const confluenceUrl = await createConfluenceDoc(`${ticket.id} - ${desc}`)
  if (!confluenceUrl) {
    return
  }

  const incident: Incident = {
    channel: msg.channel,
    roles: {},
    severity,
    description: desc,
    ticketId: ticket.id,
    confluenceUrl,
    jiraUrl: ticket.url,
    isOpen: true
  }

  incidents[msg.channel] = incident
  await save(incident)
  return incident
}

export function getIncident(channel: string) {
  const incidents = getConfig().incidents
  const incident = incidents[channel]
  return incident
}

export async function setSeverity(channel: string, severity: '1' | '2' | '3' | '4') {
  const allowed = ['1', '2', '3', '4']
  if (allowed.every(a => a !== severity)) {
    throw new Error(`Invalid severity. Please use: ${allowed.join(', ')}`)
  }

  const inc = getIncident(channel)
  if (!inc) {
    throw new Error(`No incident in this channel`)
  }

  inc.severity = severity
  await save(inc)
}

export async function setOpenState(channel: string, isOpen: boolean) {
  const inc = getIncident(channel)
  if (!inc) {
    throw new Error('No incident in this channel')
  }

  if (inc.isOpen === isOpen) {
    throw new Error(`Incident is already ${isOpen ? 'open' : 'closed'}`)
  }

  inc.isOpen = isOpen
  await save(inc)
}

export async function assignRole(bot: SlackClient, message: Chat.Message, params: string[]) {
  const config = getConfig()
  const incident = getIncident(message.channel)
  if (!incident) {
    throw new Error(`No incident in this channel (${message.channel})`)
  }

  const username = params[0]
  const id = username.startsWith('<') ? username.slice(2, -1) : username

  const user = bot.users.find(user => user.id === id || user.name == id)
  if (!user) {
    throw new Error(`User '${id}' does not exist`)
  }

  const assignee = user.real_name
  if (!incident.roles[id]) {
    incident.roles[id] = {
      name: user.real_name,
      assigns: []
    }
  }

  const role = params.slice(1).join(' ')
  incident.roles[id].assigns.push(role)

  await save(incident)

  await bot.postMessage({
    channel: message.channel,
    text: `[${incident.ticketId || 'OPS-???'}] ${assignee} has been assigned to the ${role} role`,
    ...config.defaultParams
  })
}

async function save(incident: Incident) {
  const cfg = getConfig()
  cfg.incidents[incident.channel] = incident
  await setConfig('incidents', cfg.incidents)
}
