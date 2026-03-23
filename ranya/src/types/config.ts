type Config = {
  token: string
  guilds: string[]
  ai_docker_port: number
  bot_name: string
  system_prompt: string
  whisper_host: string
  orpheus_host: string
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const config: Config = require('../../config.json')