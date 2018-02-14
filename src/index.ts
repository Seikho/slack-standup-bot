import { initaliseConfig } from './config'
import { getBot } from './bot'

import './bot/commands'

async function main() {
  try {
    await initaliseConfig()
    await getBot()
  } catch (ex) {
    console.error(ex.message)
    process.exit(1)
  }
}

main().catch(err => console.error(err))

process.on('unhandledRejection', err => console.error(err))
