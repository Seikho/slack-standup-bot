import { register } from '../config'
import { readMessage } from 'slacklibbot'

register(
  'roshambo',
  `Highly advanced and diplomatic decision maker and arugment resolver. *Usage*: roshambo @user`,
  async (bot, msg, cfg, args) => {
    const isChannel = msg.channel.startsWith('C') || msg.channel.startsWith('G')
    if (!isChannel) {
      return bot.postMessage({
        channel: msg.channel,
        text: 'This feature must be used in a channel',
        ...cfg.defaultParams
      })
    }

    const opponentId = (args[0] || '').slice(2, -1)

    if (opponentId === msg.user) {
      return bot.postMessage({
        channel: msg.channel,
        text: 'You cannot challenge yourself',
        ...cfg.defaultParams
      })
    }

    const challenger = bot.users.find(u => u.id === msg.user)
    const opponent = bot.users.find(u => u.id === opponentId)

    if (!opponent) {
      bot.postMessage({
        channel: msg.channel,
        text: `Roshambo cancelled: Couldn't find opponent with that name.`,
        ...cfg.defaultParams
      })
      return
    }

    if ((opponent as any).is_bot) {
      return bot.postMessage({
        channel: msg.channel,
        text: 'You cannot challenge a bot user',
        ...cfg.defaultParams
      })
    }

    if (!challenger) {
      bot.postMessage({
        channel: msg.channel,
        text: `Roshambo cancelled: Unexpected error (Challenger user not found)`,
        ...cfg.defaultParams
      })
      return
    }

    const getSelection = async (
      userId: string,
      preText: string = '',
      tryAgain?: boolean
    ): Promise<string> => {
      const pre = tryAgain ? `Invalid selection. ` : ''
      await bot.directMessage(userId, {
        text: pre + preText + 'Enter your selection: rock, scissors, paper',
        ...cfg.defaultParams
      })
      const response = await readMessage(bot, userId, { directOnly: true, timeout: 120 })
      if (!isValid(response)) {
        return getSelection(userId, '', true)
      }
      return response.toLowerCase().trim()
    }

    try {
      const [left, right] = await Promise.all([
        getSelection(msg.user),
        getSelection(opponent.id, `${challenger.real_name} has challenged you to Roshambo.\n`)
      ])

      const winner = getWinner(left, right)

      const pre = [
        `*Challenger*: ${challenger!.real_name} picked ${left}`,
        `*Opponent*: ${opponent.real_name} picked ${right}`
      ]

      const sendResult = (text: string) => {
        bot.postMessage({
          channel: msg.channel,
          text: [...pre, `*Result*: ${text}`, ''].join('\n'),
          ...cfg.defaultParams
        })
      }

      switch (winner) {
        case Result.Draw:
          return sendResult('Draw!')

        case Result.Left:
          return sendResult(`${challenger!.real_name} wins!`)

        case Result.Right:
          return sendResult(`${opponent.real_name} wins!`)
      }
    } catch (ex) {
      bot.postMessage({
        channel: msg.channel,
        text: `Roshambo between ${challenger!.real_name} and ${
          opponent.real_name
        } cancelled: Timed out`,
        ...cfg.defaultParams
      })
    }
  }
)

function getWinner(left: string, right: string) {
  switch (left) {
    case 'rock':
      return right === 'rock' ? Result.Draw : right === 'scissors' ? Result.Left : Result.Right

    case 'paper':
      return right === 'rock' ? Result.Left : right === 'scissors' ? Result.Right : Result.Draw

    case 'scissors':
      return right === 'rock' ? Result.Right : right === 'scissors' ? Result.Draw : Result.Left
  }
}

function isValid(selection: string) {
  const lowered = (selection || '').toLowerCase().trim()
  return lowered === 'rock' || lowered === 'paper' || lowered === 'scissors'
}

enum Result {
  Left,
  Right,
  Draw
}
