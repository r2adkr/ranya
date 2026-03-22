import { Extension, applicationCommand } from '@pikokr/command.ts'
import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'
import { lang } from '../lang'
class PingExtension extends Extension {
  @applicationCommand({
    name: lang.ping,
    type: ApplicationCommandType.ChatInput,
    description: lang.ping_description,
  })
  async ping(i: ChatInputCommandInteraction) {
    await i.reply(lang.ping_msg.replace('{ping}', `${this.client.ws.ping}`))
  }
}

export const setup = async () => {
  return new PingExtension()
}
