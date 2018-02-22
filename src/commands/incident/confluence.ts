import fetch from 'node-fetch'
import { getConfig } from '../../config'

export async function createConfluenceDoc(title: string) {
  const config = getConfig()
  const authHash: string = new Buffer(
    config.confluenceUsername + ':' + config.confluencePassword
  ).toString('base64')

  // read existing template
  const templateRes = await fetch(
    'https://confluence.swmdigital.io/rest/api/content/7444590?expand=body.storage',
    {
      headers: {
        Authorization: 'Basic ' + authHash
      }
    }
  )
  if (templateRes.status !== 200) {
    console.error(`Failed to fetch confluence template: ${templateRes.statusText}`)
    return 'No URL available'
  }

  const template = await templateRes.json()

  // create new document
  const req = {
    type: 'page',
    title: title,
    space: { key: 'CYEX' },
    body: {
      storage: { value: template.body.storage.value, representation: 'storage' }
    },
    ancestors: [{ id: 4751554 }]
  }

  const res = await fetch('https://confluence.swmdigital.io/rest/api/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + authHash
    },
    body: JSON.stringify(req)
  })

  if (res.status !== 200) {
    console.error(`Failed to create confluence doc: ${res.statusText}`)
    return 'No URL available'
  }

  const doc: any = await res.json()
  return 'https://confluence.swmdigital.io' + doc._links.webui
}
