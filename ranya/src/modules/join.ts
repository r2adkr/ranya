import { Extension, applicationCommand } from '@pikokr/command.ts'
import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js'
import ollama from 'ollama'
import { config } from '../config'
import { lang } from '../lang'

class JoinExtension extends Extension {
  @applicationCommand({
    name: lang.join,
    type: ApplicationCommandType.ChatInput,
    description: lang.join_description,
  })
  async join(i: ChatInputCommandInteraction) {
    const response = await ollama.chat({
      model: 'exaone3.5:7.8b',
      messages: [
    {
      role: 'system',
      content: config.system_prompt
    },
    {
      role: 'user',
      content: '안녕!'
    }
  ]
    })
  }
}

export const setup = async () => {
  return new JoinExtension()
}
