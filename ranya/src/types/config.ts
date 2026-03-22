type Config = {
  token: string
  guilds: string[]
  ai_docker_port: number
  system_prompt: string
} 

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const config: Config = require('../config.json')
