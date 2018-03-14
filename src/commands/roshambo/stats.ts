import { getConfig } from '../../config'
import { SlackClient } from 'slacklibbot'

export async function stats(bot: SlackClient, userId: string, channel: string) {
  const stats = getUserStats(userId)
  const cfg = getConfig()
  const total = stats.wins + stats.losses + stats.draws
  return bot.postMessage({
    channel,
    text: `*Your statistics*: Played: ${total}, ${toStats(stats)}`,
    ...cfg.defaultParams
  })
}

export interface Stats {
  rating: number
  wins: number
  losses: number
  draws: number
}

export function toStats({ rating, wins, losses, draws }: Stats) {
  return `*${rating || 1500}* ${wins}W/${losses}L/${draws}D`
}

export function getUserStats(userId: string) {
  const cfg = getConfig()
  const user = cfg.roshambo[userId]

  if (!user) {
    return {
      rating: 1500,
      wins: 0,
      losses: 0,
      draws: 0
    }
  }

  return {
    rating: user.rating || 1500,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws
  }
}
