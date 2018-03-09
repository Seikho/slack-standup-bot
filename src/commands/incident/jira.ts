import fetch from 'node-fetch'
import { getConfig } from '../../config'

export async function createJiraTicket(description: string) {
  const config = getConfig()
  const req = {
    fields: {
      project: {
        key: 'OPS'
      },
      summary: description,
      description: 'Description of incident',
      issuetype: {
        name: 'Incident'
      }
    }
  }

  const authHash = `${config.jiraUsername}:${config.jiraPassword}`

  const res = await fetch('https://jira.swmdigital.io/rest/api/latest/issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + new Buffer(authHash).toString('base64')
    },
    body: JSON.stringify(req)
  })

  if (res.status !== 201) {
    return {
      id: 'OPS-???',
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
  return `https://jira.swmdigital.io/browse/${ticketId}`
}
