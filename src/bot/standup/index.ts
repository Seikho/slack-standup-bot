import { getBot, User, Message, Bot } from '../'
import { getConfig, setConfig } from '../../config'
import { sendStandup } from './send'
import { sleep } from './util'

export async function start() {
  try {
    const config = getConfig()
    const standupDate = toDate(config.standupTime)
    const haveStoodup = config.standupCompleted
    const canStandup = shouldStandup(config.standupDays, standupDate, config.debug)

    if (canStandup && !haveStoodup) {
      await performStandup()
    }

    // It's a new day! reset standupCompleted
    if (Date.now() < standupDate.valueOf()) {
      await setConfig('standupCompleted', false)
    }

    // wait a few seconds, then check again
    await sleep(10)
  } catch (ex) {
    console.error(ex)
  }
}

async function performStandup() {
  const users = await getUsers()
  if (!users.length) {
    return
  }

  const bot = await getBot()
  const config = getConfig()

  // We want to reply to a message thread
  // We'll do that by replying to our own message
  // There isn't a really trivial way to get a message ID except wait for it
  await setConfig('standupCompleted', true)

  const responses = users.map(user => sendStandup(bot, user))

  Promise.all(responses).then(async funcs => {
    const startText = `Standup for *${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}*:`
    bot.postMessageToChannel(config.botChannel, startText, config.defaultParams)
    const msg = await waitForMessage(bot, startText)

    for (const func of funcs) {
      await func(msg.ts)
    }
  })
}

async function getUsers() {
  const users: User[] = []
  const config = getConfig()
  const bot = await getBot()

  for (const username of config.users) {
    try {
      const user = await bot.getUser(username)
      if (!user) {
        continue
      }
      users.push(user)
    } catch (ex) {
      // Intentional NOOP
      // Handle when a user has been removed from the Slack team
    }
  }

  return users
}

async function waitForMessage(bot: Bot, text: string) {
  return new Promise<Message>((resolve, reject) => {
    const callback = (msg: Message) => {
      console.log(msg)
      if (msg.subtype !== 'bot_message') {
        return
      }

      if (msg.text !== text) {
        return
      }

      clearTimeout(timeout)
      bot.removeListener('message', callback)
      resolve(msg)
    }

    const timeout = setTimeout(() => {
      reject()
      bot.removeListener('message', callback)
    }, 5000)

    bot.on('message', callback)
  })
}

function toDate(time: string) {
  const [hour, minute] = time.split(':').map(t => Number(t))
  const date = new Date()
  date.setHours(hour)
  date.setMinutes(minute)
  date.setSeconds(0)
  return date
}

function shouldStandup(standupDays: number[], date: Date, debug: boolean) {
  if (debug) {
    return true
  }

  const isStandupDay = standupDays.includes(new Date().getDay())
  const isStandupTime = Date.now() > date.valueOf()
  return isStandupDay && isStandupTime
}
