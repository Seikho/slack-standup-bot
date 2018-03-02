import { getConfig } from '../config'
import { SlackClient, Users, Chat } from 'slacklibbot'

const questions = {
  yesterday: 'What did you do yesterday?',
  today: 'What do you intend to do today?',
  blockers: 'Do you have any blockers?'
}

export async function sendStandup(bot: SlackClient, user: Users.User) {
  const config = getConfig()
  const timeout = (config.debug ? 60 : config.standupTimeout) * 1000
  const params = config.defaultParams

  try {
    const now = Date.now()
    const getTimeout = () => timeout - (Date.now() - now)

    await bot.directMessage(user.id, { text: questions.yesterday, ...params })
    const yesterday = await readMessage(bot, user, getTimeout())

    await bot.directMessage(user.id, { text: questions.today, ...params })
    const today = await readMessage(bot, user, getTimeout())

    await bot.directMessage(user.id, { text: questions.blockers, ...params })
    const blockers = await readMessage(bot, user, getTimeout())

    const doneText = 'Happy hacking!'
    await bot.directMessage(user.id, { text: doneText, ...params })

    const standupMsgs: string[] = [
      `*${questions.yesterday}*`,
      yesterday,
      `*${questions.today}*`,
      today,
      `*${questions.blockers}*`,
      blockers
    ]

    return (thread: number) =>
      bot.postMessage({
        channel: config.channel,
        text: standupMsgs.join('\n'),
        thread_ts: thread,
        username: user.real_name,
        icon_url: user.profile.image_48,
        as_user: false
      })
  } catch (_) {
    bot.directMessage(user.id, {
      text: `Your standup has been cancelled due to inactivity`,
      ...params
    })
    return (thread: number) =>
      bot.postMessage({
        channel: config.channel,
        text: `> *Missed standup today*`,
        thread_ts: thread,
        username: user.real_name,
        icon_url: user.profile.image_48,
        as_user: false
      })
  }
}

function parseResponse(text: string) {
  return text
    .split('\n')
    .map(el => `> ${el}`)
    .join('\n')
}

// Read a message from the user, and return the text
function readMessage(bot: SlackClient, user: Users.User, timeoutMs: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject()
      bot.removeListener('message', callback)
    }, timeoutMs)

    const callback = async (data: Chat.Message) => {
      const channel = data.channel || ''
      const text = (data.text || '').trim()
      const isDirect = data.type === 'message' && channel.startsWith('D')
      const isCommand = data.type === 'message' && text.startsWith(`<@${bot.self.id}>`)

      if (isDirect && !isCommand && data.user === user.id) {
        bot.removeListener('message', callback)
        resolve(parseResponse(data.text))
        clearTimeout(timer)
        return
      }
    }

    bot.on('message', callback)
  })
}
