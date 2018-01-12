import { Bot, User, Message } from '../'
import { sleep } from './util'
import { getConfig } from '../../config'

const questions = {
  yesterday: 'What did you do yesterday?',
  today: 'What do you intend to do today?',
  blockers: 'Do you have any blockers?'
}

// ask the standup questions
export async function sendStandup(bot: Bot, user: User) {
  const config = getConfig()
  const timeout = config.debug ? 60 : config.standupTimeout

  const params = { ...config.defaultParams }

  try {
    await bot.postMessageToUser(user.name, questions.yesterday, params)
    const yesterday = await readMessage(bot, user, timeout)

    await bot.postMessageToUser(user.name, questions.today, params)
    const today = await readMessage(bot, user, timeout)

    await bot.postMessageToUser(user.name, questions.blockers, params)
    const blockers = await readMessage(bot, user, timeout)

    const doneText = 'Happy hacking!'
    await bot.postMessageToUser(user.name, doneText, params)

    const standupMsgs: string[] = [
      `*${questions.yesterday}*`,
      yesterday,
      `*${questions.today}*`,
      today,
      `*${questions.blockers}*`,
      blockers
    ]

    return (thread: number) =>
      bot.postMessageToChannel(config.botChannel, standupMsgs.join('\n'), {
        thread_ts: thread,
        username: user.real_name,
        icon_url: user.profile.image_48
      })
  } catch (e) {
    bot.postMessageToUser(user.name, `Your standup has been canceled due to inactivity`, params)
    bot.postMessageToChannel(config.botChannel, `*${user.name}* missed today's standup`, params)
    return (_: number) => {
      /** Intentional NOOP */
    }
  }
}

function parseResponse(text: string) {
  return text
    .split('\n')
    .map(el => `> ${el}`)
    .join('\n')
}

// Read a message from the user, and return the text
function readMessage(bot: Bot, user: User, timeout = 3600): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const callback = async (data: Message) => {
      const channel = data.channel || ''
      const isDirect = data.type === 'message' && channel.startsWith('D')
      if (isDirect && data.user === user.id) {
        bot.removeListener('message', callback)
        resolve(parseResponse(data.text))
        return
      }

      await sleep(timeout)
      bot.removeListener('message', callback)
      reject()
    }

    bot.on('message', callback)
  })
}
