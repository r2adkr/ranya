import { Extension, applicationCommand } from '@pikokr/command.ts'
import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'

class JoinExtension extends Extension {
  @applicationCommand({
    name: '핑',
    type: ApplicationCommandType.ChatInput,
    description: '현재 핑을 확인해요!',
  })
  async ping(i: ChatInputCommandInteraction) {
    await i.reply(`현재 핑: ${i.client.ws.ping}ms`)
  }
}

export const setup = async () => {
  return new JoinExtension()
}
