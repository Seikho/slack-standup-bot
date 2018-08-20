import fetch from 'node-fetch'
import { getConfig } from '../../config'

export interface Ticket {
  id: string
  url: string
}

export async function createJiraTicket(description: string): Promise<Ticket> {
  const config = getConfig()
  if (!canCreate()) {
    return {
      id: `${config.jiraSpace || 'NA'}-???`,
      url: 'No URL available'
    }
  }

  const req = {
    fields: {
      project: {
        key: config.jiraSpace
      },
      summary: description,
      description: 'Description of incident',
      issuetype: {
        name: 'Incident'
      }
    }
  }

  const authHash = `${config.jiraUsername}:${config.jiraPassword}`

  const res = await fetch(
    `https://${config.atlassianAccount}.atlassian.net/rest/api/latest/issue`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + new Buffer(authHash).toString('base64')
      },
      body: JSON.stringify(req)
    }
  )

  if (res.status !== 201) {
    return {
      id: `${config.jiraSpace}-???`,
      url: `No URL available`
    }
  }

  const ticket: any = await res.json()
  return {
    id: ticket.key,
    url: ticketToURL(ticket.key)
  }
}

export function ticketToURL(ticketId: string) {
  const cfg = getConfig()
  return `https://${cfg.atlassianAccount}.atlassian.net/browse/${ticketId}`
}

function canCreate() {
  const cfg = getConfig()
  if (!cfg.jiraSpace || !cfg.jiraUsername || !cfg.jiraPassword) {
    return false
  }

  return true
}
