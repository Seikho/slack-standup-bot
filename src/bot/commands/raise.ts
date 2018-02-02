import { register } from '../command'
import { default as fetch } from 'node-fetch'

register('raise', `Raise an incident record in JIRA`, async (bot, message, config, params) => {
  await bot.postMessage({
    channel: message.channel,
    text: `K. Hold on...`,
    ...config.defaultParams
  })

  const req = {
    fields: {
      project: {
        key: 'OPS'
      },
      summary: params.join(' '),
      description: 'Description of incident',
      issuetype: {
        name: 'Incident'
      }
    }
  }

  const authHash: string = new Buffer(config.jiraUsername + ':' + config.jiraPassword).toString(
    'base64'
  )

  const res = await fetch('https://jira.swmdigital.io/rest/api/latest/issue', {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + authHash
    }
  })
  if (res.status !== 201) {
    await bot.postMessage({
      channel: message.channel,
      text: `Something went wrong. Please raise an incident ;) - ${res.statusText}`,
      ...config.defaultParams
    })
    return
  }

  const ticket: any = await res.json()
  console.log(ticket)
  await bot.postMessage({
    channel: message.channel,
    text: `Yep. Good. I've raised https://jira.swmdigital.io/browse/${ticket.key}`,
    ...config.defaultParams
  })
})
