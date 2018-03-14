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
  wins: number
  losses: number
  draws: number
}

export function toStats({ wins, losses, draws }: Stats) {
  return `${wins}W/${losses}L/${draws}D`
}

export function getUserStats(userId: string) {
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
