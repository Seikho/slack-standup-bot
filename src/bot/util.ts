import { SlackClient, Users, Chat } from 'slacklib'

// Read a message from the user, and return the text
export function readMessage(
  bot: SlackClient,
  user: Users.User,
  timeoutMs: number
): Promise<string> {
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

function parseResponse(text: string) {
  return text
    .split('\n')
    .map(el => `> ${el}`)
    .join('\n')
}

export function sleep(milliseconds: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), milliseconds)
  })
}
