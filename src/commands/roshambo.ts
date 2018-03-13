import { register, getConfig, Roshambo, setConfig } from '../config'
import { SlackClient, readMessage } from 'slacklibbot'

register(
  'roshambo',
  `Highly advanced and diplomatic decision maker and arugment resolver. *Usage*: \`roshambo @user\` | \`roshambo stats\` | \`roshambo leaders\``,
  async (bot, msg, cfg, args) => {
    if (args[0] === 'stats') {
      return stats(bot, msg.user, msg.channel)
    }

    if (args[0] === 'leaderboard' || args[0] === 'leaders') {
      return leaderboard(bot, msg.channel, msg.user)
    }

    const isChannel = msg.channel.startsWith('C') || msg.channel.startsWith('G')
    if (!isChannel) {
      return bot.postMessage({
        channel: msg.channel,
        text: 'This feature must be used in a channel',
        ...cfg.defaultParams
      })
    }

    const opponentId = (args[0] || '').slice(2, -1)
    const toChannel = (text: string) =>
      bot.postMessage({ channel: msg.channel, text, ...cfg.defaultParams })

    if (opponentId === msg.user) {
      return toChannel('You cannot challenge yourself')
    }

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

    const getSelection = async (userId: string, preText: string = ''): Promise<string> => {
      await bot.directMessage(userId, {
        text: preText + 'Enter your selection: rock, scissors, paper',
        ...cfg.defaultParams
      })
      const response = await readMessage(bot, userId, { directOnly: true, timeout: 120 })
      if (!isValid(response)) {
        return getSelection(userId, 'Invalid selection. ')
      }

      await bot.directMessage(userId, { text: 'Response accepted', ...cfg.defaultParams })
      return response.toLowerCase().trim()
    }

    try {
      const [left, right] = await Promise.all([
        getSelection(msg.user),
        getSelection(opponent.id, `${challenger.real_name} has challenged you to Roshambo.\n`)
      ])

      const winner = getWinner(left, right)

      const pre = [
        `*Challenger*: ${challenger.real_name} picked ${left}`,
        `*Opponent*: ${opponent.real_name} picked ${right}`
      ]

      const sendResult = (text: string) => {
        const leftStats = getUserStats(msg.user)
        const rightStats = getUserStats(opponentId)

        bot.postMessage({
          channel: msg.channel,
          text: [
            ...pre,
            `*Result*: ${text}`,
            `*${challenger.real_name}*: W/L/D: ${leftStats.wins}/${leftStats.losses}/${
              leftStats.draws
            }`,
            `*${opponent.real_name}*: W/L/D: ${rightStats.wins}/${rightStats.losses}/${
              rightStats.draws
            }`,
            ''
          ].join('\n'),
          ...cfg.defaultParams
        })
      }

      await updateResults(msg.user, opponentId, winner)
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

async function stats(bot: SlackClient, userId: string, channel: string) {
  const stats = getUserStats(userId)
  const cfg = getConfig()
  const total = stats.wins + stats.losses + stats.draws
  return bot.postMessage({
    channel,
    text: `*Your statistics*: Played: ${total}, W/L/D: ${stats.wins}/${stats.losses}/${
      stats.draws
    }`,
    ...cfg.defaultParams
  })
}

async function leaderboard(bot: SlackClient, channel: string, userId: string) {
  const cfg = getConfig()
  const allUsers = Object.keys(cfg.roshambo)

  allUsers.sort((l, r) => {
    const left = cfg.roshambo[l]
    const right = cfg.roshambo[r]

    if (left.wins > right.wins) {
      return -1
    }

    if (left.wins < right.wins) {
      return 1
    }

    if (left.losses < right.losses) {
      return -1
    }

    if (left.losses > right.losses) {
      return 1
    }

    if (left.draws > right.draws) {
      return -1
    }

    if (left.draws < right.draws) {
      return 1
    }

    return 0
  })

  const posTexts = allUsers.map((userId, pos) => {
    const userInfo = bot.users.find(u => u.id === userId)
    const user = cfg.roshambo[userId]
    return `*#${pos + 1}.* ${userInfo!.real_name} -- ${user.wins}/${user.losses}/${user.draws}`
  })

  const messages = ['*Roshambo Leaderboard*', 'Pos |  Name | W/L/D', ...posTexts.slice(0, 10)]

  const userPosition = allUsers.reduce((pos, id, i) => {
    if (pos !== -1) {
      return pos
    }

    if (id === userId) {
      return i
    }

    return -1
  }, -1)

  if (userPosition > 10) {
    messages.push('...', posTexts[userPosition] + ' _(you)_')
  }

  return bot.postMessage({
    channel,
    text: messages.join('\n'),
    ...cfg.defaultParams
  })
}

function getUserStats(userId: string) {
  const cfg = getConfig()
  const user = cfg.roshambo[userId]

  if (!user) {
    return {
      wins: 0,
      losses: 0,
      draws: 0
    }
  }

  return {
    wins: user.wins,
    losses: user.losses,
    draws: user.draws
  }
}

async function updateResults(leftId: string, rightId: string, result: Result) {
  const cfg = getConfig()
  const challenger = cfg.roshambo[leftId]
  const opponent = cfg.roshambo[rightId]

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
  Left,
  Right,
  Draw
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
  inGame: false,
  wins: 0,
  losses: 0,
  draws: 0
}
