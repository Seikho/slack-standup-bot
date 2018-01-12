import { Bot } from '../'
import { register } from '../command'
import { getConfig, setConfig } from '../../config'

register(
  'adduser',
  'Add user to standup. Usage: adduser [@username1] [@username2] ...',
  async (bot, msg, cfg, params) => {
    const good: string[] = []
    const bad: string[] = []

    for (const username of params) {
      const userInfo = getUser(bot, username)
      if (!userInfo) {
        bad.push(username)
        continue
      }
      await toggleUser(userInfo.name, 'add')
      good.push(userInfo.name)
    }

    const lines: string[] = []
    if (good.length) {
      lines.push(`Added "${good.join(', ')}" to standup`)
    }

    if (bad.length) {
      lines.push(`:rotating_light: Failed to add "${bad.join(', ')}" to standup :rotating_light:`)
    }

    await bot.postMessage(msg.channel, lines.join('\n'), cfg.defaultParams)
  }
)

register(
  'deluser',
  'Remove user to standup. Usage: deluser [username]',
  async (bot, msg, cfg, params) => {
    const good: string[] = []
    const bad: string[] = []

    for (const username of params) {
      const userInfo = getUser(bot, username)
      if (!userInfo) {
        bad.push(username)
        continue
      }
      await toggleUser(userInfo.name, 'add')
      good.push(userInfo.name)
    }

    const lines: string[] = []
    if (good.length) {
      lines.push(`Removed "${good.join(', ')}" from standup`)
    }

    if (bad.length) {
      lines.push(
        `:rotating_light: Failed to remove "${bad.join(', ')}" to standup :rotating_light:`
      )
    }

    await bot.postMessage(msg.channel, lines.join('\n'), cfg.defaultParams)
  }
)

function getUser(bot: Bot, username: string) {
  const id = username.startsWith('<') ? username.slice(2, -1) : username
  for (const user of bot.users) {
    if (user.id === id || user.name === username) {
      return user
    }
  }
}

async function toggleUser(user: string, op: 'add' | 'del') {
  const config = getConfig()
  const users = config.users

  const exists = users.some(u => user === u)
  if (op === 'add') {
    if (exists) {
      return
    }
    users.push(user)
    await setConfig('users', users)
    return
  }

  if (op === 'del') {
    if (!exists) {
      return
    }

    await setConfig('users', users.filter(u => user !== u))
    return
  }
}
