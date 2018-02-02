import { register } from '../command'

register('incident-help', `View this message`, async (bot, message, config, params) => {
  
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

https://confluence.swmdigital.io/display/DPT/Incident+response+process

`

  bot.postMessage({
    channel: message.channel,
    text: helpMessage,
    ...config.defaultParams
  })
})
