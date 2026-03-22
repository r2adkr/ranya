import { Extension, applicationCommand } from '@pikokr/command.ts'
import { ApplicationCommandType, ChatInputCommandInteraction, GuildMember } from 'discord.js'
import ollama from 'ollama'
import { lang } from '../types/lang'
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} from '@discordjs/voice'
import { logger } from '../utils/logger'

class JoinExtension extends Extension {
  @applicationCommand({
    name: lang.join,
    type: ApplicationCommandType.ChatInput,
    description: lang.join_description,
  })
  async join(i: ChatInputCommandInteraction) {
    await i.deferReply()
    const member = i.member as GuildMember;
    const voiceChannel = member.voice.channel
    if (!voiceChannel) {
      await i.editReply(lang.no_join)
      return
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    })

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000)
      await i.editReply(lang.join_msg)
    } catch (error) {
      logger.error(error)
      connection.destroy()
      await i.editReply(lang.join_failed)
    }
  }
}

export const setup = async () => {
  return new JoinExtension()
}
