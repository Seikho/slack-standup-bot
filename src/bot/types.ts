export interface Bot {
  postMessage(id: string, text: string, params?: any): Promise<void>
  postMessageToUser(username: string, text: string, params?: any): Promise<void>
  postMessageToChannel(channel: string, text: string, params?: any): Promise<void>
  removeListener(event: string, func: Function): void
  on(event: string, callback: (data: any) => void): void
  getUser(username: string): Promise<User | undefined>
  getUserId(id: string): Promise<User | undefined>

  token: string
  name: string
  ims: ChatIM[]

  self: {
    id: string
    manual_presence: string
    name: string
  }

  team: {
    avatar_base_url: string
    domain: string
    email_domain: string
    icon: any
    id: string
    messages_count: number
    msg_edit_windows_mins: number
    name: string
    over_storage_limit: boolean
    plan: string
    token: string
  }

  users: User[]
}

export interface ChatIM {
  id: string
  created: number
  has_pins: boolean
  is_im: boolean
  is_open: boolean
  is_org_shared: boolean
  last_read: string
  priority: number
  user: string
}

export interface Message {
  type: 'message'
  subtype?: string
  bot_id?: string
  username?: string
  user: string
  channel: string
  text: string
  ts: number
  source_team: string
  team: string
}

export interface User {
  id: string
  team_id: string
  name: string
  deleted: boolean
  color: string
  real_name: string
  tz: string
  tz_label: string
  tz_offset: number
  profile: {
    bot_id: string
    api_app_id: string
    always_active: boolean
    real_name: string
    display_name: string
    avatar_hash: string
    real_name_normalized: string
    display_name_normalized: string
    fields: any
    team: string
    image_original: string
    image_24: string
    image_32: string
    image_48: string
    image_72: string
    image_512: string
    image_1024: string
  }
  is_admin: boolean
  is_owner: boolean
  is_primary_owner: boolean
  is_restricted: boolean
  is_ultra_restricted: boolean
  is_bot: boolean
  updated: number
  is_app_user: boolean
  presence: string
}
