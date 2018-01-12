import { initaliseConfig } from './config'
import { getBot } from './bot'
import { start } from './bot/standup'
import './bot/commands'

async function main() {
  try {
    await initaliseConfig()
    await getBot()
    start()
  } catch (ex) {
    console.error(ex.message)
    process.exit(1)
  }
}

main().catch(err => console.error(err))

process.on('unhandledRejection', err => console.error(err))
