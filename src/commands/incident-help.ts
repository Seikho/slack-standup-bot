import { register, getConfig } from '../config'
import { sleep } from './util'
import { SlackClient } from 'slacklib'

register('first', `Show quick help for first responders`, async (bot, message, config, params) => {
  await sendHelp(bot, message.channel)
})

register(
  'command-help',
  `Show quick help for incident command`,
  async (bot, message, config, params) => {
    const helpMessage = `Placeholder text`
    bot.postMessage({
      channel: message.channel,
      text: helpMessage,
      ...config.defaultParams
    })
  }
)

register(
  'comms-help',
  `Show quick help for the communications officer`,
  async (bot, message, config, params) => {
    const helpMessage = `Placeholder text`
    bot.postMessage({
      channel: message.channel,
      text: helpMessage,
      ...config.defaultParams
    })
  }
)

register('point-help', `Show quick help for point`, async (bot, message, config, params) => {
  const helpMessage = `Placeholder text`
  bot.postMessage({
    channel: message.channel,
    text: helpMessage,
    ...config.defaultParams
  })
})

register('recon-help', `Show quick help for recon`, async (bot, message, config, params) => {
  const helpMessage = `Placeholder text`
  bot.postMessage({
    channel: message.channel,
    text: helpMessage,
    ...config.defaultParams
  })
})

register(
  'transition-help',
  `Show quick help for incident command`,
  async (bot, message, config, params) => {
    const helpMessage = `Placeholder text`
    bot.postMessage({
      channel: message.channel,
      text: helpMessage,
      ...config.defaultParams
    })
  }
)

export async function sendHelp(bot: SlackClient, channel: string) {
  const config = getConfig()

  bot.postMessage({
    channel,
    text: getRulesOfEngagement(bot),
    ...config.defaultParams
  })

  await sleep(250)

  bot.postMessage({
    channel,
    text: getGettingStarted(bot),
    ...config.defaultParams
  })
}

export function getRulesOfEngagement(bot: SlackClient) {
  return `

  *Rules of engagement*

  These rules apply to all participants in the Incident Response process:

  • Follow the rules of engagement
  • If you haven't read the process, you may not participate in incident response
  • Read the run sheet for your role in full
  • Keep detailed notes
  • Minimise change to all systems, software and configuration
  • Do not disengage from the process until is is completed

  Also remember that human intuition and risk assessment are total bullshit under pressure - trust the process.

  In hindsight, every incident has a very simple solution.

  `
}

export function getGettingStarted(bot: SlackClient) {
  return `

  *First Responder*

  If you are the first to notice something is wrong, you should:

  *Raise an incident*:

  1. Notify stakeholders that there is an incident
  2. Create a new channel
  3. In that channel use: \`@${bot.self.name} raise\`

  Once the incident has been resolved:

  *Close an incident*:

  1. In the incident channel use: \`@${bot.self.name} close\`

  This will create a Jira ticket and Confluence incident journal.

  *For more help regarding the incident process*: \`@${bot.self.name} help\`
  `
}
