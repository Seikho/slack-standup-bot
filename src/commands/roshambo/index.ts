import { register } from '../../config'
import { stats } from './stats'
import { leaderboard } from './leaders'
import { game } from './game'

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

    const opponentId = (args[0] || '').slice(2, -1)
    return game(bot, msg, opponentId)
  }
)
