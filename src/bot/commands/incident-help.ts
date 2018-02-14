import { SlackClient } from 'slacklib'
import { register } from '../command'
import { sleep } from '../util'
import { Config } from '../../config'

register('first', `Show quick help for first responders`, async (bot, message, config, params) => {
  await sendHelp(bot, message.channel, config)
})

register(
  'command-help',
  `Show quick help for incident command`,
  async (bot, message, config, params) => {
    const helpMessage = `https://confluence.swmdigital.io/display/DPT/Incident+Command`
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
    const helpMessage = `https://confluence.swmdigital.io/display/DPT/Communications+officer`
    bot.postMessage({
      channel: message.channel,
      text: helpMessage,
      ...config.defaultParams
    })
  }
)

register('point-help', `Show quick help for point`, async (bot, message, config, params) => {
  const helpMessage = `https://confluence.swmdigital.io/display/DPT/Point`
  bot.postMessage({
    channel: message.channel,
    text: helpMessage,
    ...config.defaultParams
  })
})

register('recon-help', `Show quick help for recon`, async (bot, message, config, params) => {
  const helpMessage = `https://confluence.swmdigital.io/display/DPT/Recon`
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
    const helpMessage = `https://confluence.swmdigital.io/display/DPT/Transition+officer`
    bot.postMessage({
      channel: message.channel,
      text: helpMessage,
      ...config.defaultParams
    })
  }
)

export async function sendHelp(bot: SlackClient, channel: string, config: Config) {
  const helpMessage = `

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

  const gettingStartedMessage = `

  *First Responder*

  The rules of engagement can be found here:

  https://confluence.swmdigital.io/display/DPT/Incident+response+process

  If you are the first to notice something is wrong, you should follow the first responder document:

  https://confluence.swmdigital.io/display/DPT/First+responder

  *Raise an incident*:

  \`@${bot.self.name} raise incident name\`

  This will create a jira ticket and confluence doc.

  *For more help regarding the incident process*: \`@${bot.self.name} help\`

  `

  bot.postMessage({
    channel,
    text: helpMessage,
    ...config.defaultParams
  })

  await sleep(250)

  bot.postMessage({
    channel,
    text: gettingStartedMessage,
    ...config.defaultParams
  })
}
