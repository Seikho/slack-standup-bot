import './config'
import { start } from 'slacklib'

import './commands'

async function main() {
  try {
    await start()
  } catch (ex) {
    console.error(ex.message)
    process.exit(1)
  }
}

main().catch(err => console.error(err))

process.on('unhandledRejection', err => console.error(err))
