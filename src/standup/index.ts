import { getConfig, setConfig } from '../config'
import { sendStandup } from './send'
import { sleep } from './util'
import { Chat, Users, SlackClient, getBot, start } from 'slacklibbot'

export async function initStandup() {
  try {
    const config = getConfig()
    const standupDate = toDate(config.standupTime)
    const haveStoodup = config.standupCompleted
    const canStandup = shouldStandup(config.standupDays, standupDate, config.debug)

    if (canStandup && !haveStoodup) {
      await performStandup()
    }

    // If it's a new day, reset the standupCompleted flag
    if (getNow() < standupDate) {
      await setConfig('standupCompleted', false)
    }

    await sleep(1)
    start()
  } catch (ex) {
    console.error(ex)
  }
}

async function performStandup() {
  console.log('Starting standup')
  const users = await getUsers()
  if (!users.length) {
    return
  }

  const bot = await getBot()
  const config = getConfig()

  // We want to reply to a message thread
  // We'll do that by replying to our own message
  // There isn't a really trivial way to get a message thread ID except wait for it
  await setConfig('standupCompleted', true)
  const startText = `Standup for *${getNow().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}*:`

  bot.postMessage({ channel: config.channel, text: startText, ...config.defaultParams })
  const msg = await waitForMessage(bot, startText)

  for (const user of users) {
    // We want to make sure we don't exceed Slack API limits
    // We will wait a second or two between each message
    sendStandup(bot, user).then(cb => cb(msg.ts))
    await sleep(1.5)
  }
}

async function getUsers() {
  const users: Users.User[] = []
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

async function waitForMessage(bot: SlackClient, text: string) {
  return new Promise<Chat.Message>((resolve, reject) => {
    const callback = (msg: Chat.Message) => {
      if (msg.subtype !== 'bot_message' && msg.user !== bot.self.id) {
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

function shouldStandup(standupDays: number[], standupDate: Date, debug: boolean) {
  if (debug) {
    return true
  }

  const adjustedNow = getNow()

  // We check 'isSameDay' as timezone offsets can create a scenario where:
  // adjustedNow vs standupDate are on different days
  const isSameDay = adjustedNow.getDay() === standupDate.getDay()

  // Must check the standupDate instead of 'now' because 'now' is adjusted for the user timezone
  // This can be adjusted into a new day which could be a standupDay and lead to a type I error (false positive)
  const isStandupDay = standupDays.includes(standupDate.getDay())

  const isStandupTime = getNow() > standupDate
  return isSameDay && isStandupDay && isStandupTime
}

/**
 * Returns 'now' adjusted for the user's timezone
 */
function getNow() {
  const config = getConfig()
  const now = new Date()

  const actualOffset = now.getTimezoneOffset()
  const botOffset = config.timezone * 60 * -1
  const adjustment = actualOffset - botOffset

  now.setMinutes(now.getMinutes() + adjustment)
  return now
}
