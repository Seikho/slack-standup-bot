import { backfillConfig } from './config'
import { start } from 'slacklibbot'
import { initStandup } from './standup'
import './commands'

async function main() {
  try {
    await start()
    await backfillConfig()
    await initStandup()
  } catch (ex) {
    console.error(ex.message)
    process.exit(1)
  }
}

main().catch(err => console.error(err))

process.on('unhandledRejection', err => console.error(err))
