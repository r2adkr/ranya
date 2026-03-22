import { Extension, applicationCommand } from '@pikokr/command.ts'
import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'

class JoinExtension extends Extension {
  @applicationCommand({
    name: 'ping',
    type: ApplicationCommandType.ChatInput,
    description: 'wow this is ping',
  })
  async ping(i: ChatInputCommandInteraction) {
    await i.reply(`current ping: ${i.client.ws.ping}ms`)
  }
}

export const setup = async () => {
  return new JoinExtension()
}
