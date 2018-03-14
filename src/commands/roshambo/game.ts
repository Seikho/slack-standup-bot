import { SlackClient, Chat, readMessage } from 'slacklibbot'
import { getConfig, setConfig, Roshambo } from '../../config'
import { toStats, getUserStats } from './stats'
import * as elo from 'ratings'

export async function game(bot: SlackClient, msg: Chat.Message, opponentId: string) {
  const cfg = getConfig()

  // Only allow groups and channels
  const isChannel = msg.channel.startsWith('C') || msg.channel.startsWith('G')
  if (!isChannel) {
    return bot.postMessage({
      channel: msg.channel,
      text: 'This feature must be used in a channel or group',
      ...cfg.defaultParams
    })
  }

  const toChannel = (text: string) =>
    bot.postMessage({ channel: msg.channel, text, ...cfg.defaultParams })

  // if (opponentId === msg.user) {
  //   return toChannel('You cannot challenge yourself')
  // }

  const challenger = bot.users.find(u => u.id === msg.user)
  const opponent = bot.users.find(u => u.id === opponentId)

  if (!opponent) {
    return toChannel(`Roshambo cancelled: Couldn't find opponent with that name`)
  }

  if ((opponent as any).is_bot) {
    return toChannel('You cannot challenge a bot user')
  }

  if (!challenger) {
    return toChannel(`Roshambo cancelled: Unexpected error (Challenger user not found)`)
  }

  const isOkayToStart = await setInGame(msg.user, opponentId)
  if (!isOkayToStart) {
    return toChannel('Unable to start: Both users can only be in one game at a time')
  }

  try {
    const [left, right] = await Promise.all([
      getSelection(bot, msg.user),
      getSelection(bot, opponent.id, `${challenger.real_name} has challenged you to Roshambo.\n`)
    ])

    const winner = getWinner(left, right)

    const pre = [
      `*Challenger*: ${challenger.real_name} picked ${left}`,
      `*Opponent*: ${opponent.real_name} picked ${right}`
    ]

    const results = await updateResults(msg.user, opponentId, winner)

    const sendResult = (text: string) => {
      const leftStats = getUserStats(msg.user)
      const rightStats = getUserStats(opponentId)

      const preWhite = results.shift.white >= 0 ? '+' : ''
      const preBlack = results.shift.black >= 0 ? '+' : ''

      const shiftText = [
        `(${results.white} *${preWhite}${results.shift.white}*)`,
        `(${results.black} *${preBlack}${results.shift.black}*)`
      ]

      bot.postMessage({
        channel: msg.channel,
        text: [
          ...pre,
          `*Result*: ${text}`,
          `*${challenger.real_name}*: ${toStats(leftStats)} ${shiftText[0]}`,
          `*${opponent.real_name}*: ${toStats(rightStats)} ${shiftText[1]}`,
          ''
        ].join('\n'),
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
      text: `Roshambo between ${challenger.real_name} and ${
        opponent.real_name
      } cancelled: Timed out`,
      ...cfg.defaultParams
    })
  }
}

async function getSelection(bot: SlackClient, userId: string, preText = ''): Promise<string> {
  const cfg = getConfig()
  await bot.directMessage(userId, {
    text: preText + 'Enter your selection: rock, scissors, paper',
    ...cfg.defaultParams
  })
  const response = await readMessage(bot, userId, { directOnly: true, timeout: 120 })
  if (!isValid(response)) {
    return getSelection(bot, userId, 'Invalid selection. ')
  }

  await bot.directMessage(userId, { text: 'Response accepted', ...cfg.defaultParams })
  return response.toLowerCase().trim()
}

async function updateResults(leftId: string, rightId: string, result: Result) {
  const cfg = getConfig()
  const challenger = cfg.roshambo[leftId]
  const opponent = cfg.roshambo[rightId]
  if (!challenger.rating) {
    challenger.rating = 1500
  }

  if (!opponent.rating) {
    opponent.rating = 1500
  }

  const results = elo.adjustment(challenger.rating, opponent.rating, result)
  challenger.rating = results.white
  opponent.rating = results.black

  challenger.inGame = false
  opponent.inGame = false

  switch (result) {
    case Result.Draw:
      challenger.draws++
      opponent.draws++
      break

    case Result.Left:
      challenger.wins++
      opponent.losses++
      break

    case Result.Right:
      challenger.losses++
      opponent.wins++
      break
  }

  const roshambo = cfg.roshambo
  roshambo[leftId] = challenger
  roshambo[rightId] = opponent

  await setConfig('roshambo', roshambo)
  return results
}

function getWinner(left: string, right: string) {
  if (left === right) {
    return Result.Draw
  }

  switch (left) {
    case 'rock':
      return right === 'scissors' ? Result.Left : Result.Right

    case 'paper':
      return right === 'rock' ? Result.Left : Result.Right

    case 'scissors':
      return right === 'paper' ? Result.Left : Result.Right
  }

  throw new Error('Unable to determine Roshambo winner: Invalid selections')
}

function isValid(selection: string) {
  const lowered = (selection || '').toLowerCase().trim()
  return lowered === 'rock' || lowered === 'paper' || lowered === 'scissors'
}

enum Result {
  Left = 1,
  Right = -1,
  Draw = 0
}

async function setInGame(challengerId: string, opponentId: string) {
  const cfg = getConfig()
  const challenger = cfg.roshambo[challengerId] || { ...defaultHistory, userId: challengerId }
  const opponent = cfg.roshambo[opponentId] || { ...defaultHistory, userId: opponentId }

  if (challenger.inGame || opponent.inGame) {
    return false
  }

  challenger.inGame = true
  opponent.inGame = true
  const existing = cfg.roshambo
  existing[challengerId] = challenger
  existing[opponentId] = opponent

  await setConfig('roshambo', existing)
  return true
}

const defaultHistory: Roshambo = {
  userId: '',
  rating: 1500,
  inGame: false,
  wins: 0,
  losses: 0,
  draws: 0
}
