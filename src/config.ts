import { setup } from 'slacklibbot'

const { setConfig, getConfig, register } = setup<Config>(
  {
    name: 'FarkBot',
    emoji: ':kimcry:',
    channel: 'team-productanddev',
    timezone: 8,
    jiraUsername: '',
    jiraPassword: '',
    confluenceUsername: '',
    confluencePassword: '',
    incidents: {}
  },
  ['jiraUsername', 'jiraPassword', 'confluenceUsername', 'confluencePassword']
)

export { setConfig, getConfig, register }

export interface Incident {
  channel: string
  ticketId: string
  severity: '1' | '2' | '3' | '4'
  description: string
  roles: { [user: string]: { name: string; assigns: string[] } }
  confluenceUrl: string
  jiraUrl: string
  isOpen: boolean
}

export interface Config {
  incidents: { [channel: string]: Incident }

  jiraUsername: string
  jiraPassword: string
  confluenceUsername: string
  confluencePassword: string
}
