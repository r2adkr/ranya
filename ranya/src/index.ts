import { config } from './types/config'
import { CustomizedCommandClient } from './structures'
import { Client } from 'discord.js'

const client = new Client({
  intents: ['Guilds', 'DirectMessages', 'GuildVoiceStates'],
})

const cts = new CustomizedCommandClient(client)

const start = async () => {
  await cts.setup()

  await client.login(config.token)

  await cts.getApplicationCommandsExtension()?.sync()
}

start().then()
