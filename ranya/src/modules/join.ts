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
    } else if (!voiceChannel.joinable) {
      await i.editReply(lang.join_failed)
      return
    } else if (voiceChannel.full) {
      await i.editReply(lang.full)
      return
    } else if (voiceChannel.guild.members.me?.voice.channelId) {
      await i.editReply(lang.already_joined)
      return
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    })

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000)
      await i.editReply(lang.join_msg)
    } catch (error) {
      logger.error(error)
      connection.destroy()
      await i.editReply(lang.join_failed)
    }
    connection.receiver.speaking.on('start', async (userId) => {
      if (userId === this.client.user?.id) return // 봇 자신이 말하는 경우 무시
      const user = await this.client.users.fetch(userId)
    })
  }
  @applicationCommand({
    name: lang.leave,
    type: ApplicationCommandType.ChatInput,
    description: lang.leave_description,
  })
  async leave(i: ChatInputCommandInteraction) {
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
        selfDeaf: false,
      })
      connection.destroy()
      await i.editReply(lang.leave_msg)
  }
}

export const setup = async () => {
  return new JoinExtension()
}
