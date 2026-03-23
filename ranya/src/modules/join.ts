import { Extension, applicationCommand } from '@pikokr/command.ts'
import { ApplicationCommandType, ChatInputCommandInteraction, GuildMember } from 'discord.js'
import { lang } from '../types/lang'
import { config } from '../types/config'
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  VoiceConnection,
  entersState,
  EndBehaviorType,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from '@discordjs/voice'
import { logger } from '../utils/logger'
import { transcribe } from '../service/whisper'
import { synthesize } from '../service/tts'
import { OpusEncoder } from '@discordjs/opus'
import { Ollama } from 'ollama'
import { Readable } from 'stream'

const BOT_NAME = config.bot_name ?? '라냐'
const encoder = new OpusEncoder(48000, 2)
const ollamaClient = new Ollama({ host: `http://ollama:${config.ai_docker_port}` })

/** 사용자별 대화 히스토리 (guildId -> userId -> messages) */
const conversationHistory = new Map<string, Map<string, Array<{ role: string; content: string }>>>()

function getHistory(guildId: string, userId: string) {
  if (!conversationHistory.has(guildId)) conversationHistory.set(guildId, new Map())
  const guild = conversationHistory.get(guildId)!
  if (!guild.has(userId)) guild.set(userId, [])
  return guild.get(userId)!
}

/** 봇을 부르는 말인지 판별 */
function isCallingBot(text: string): boolean {
  const t = text.toLowerCase()
  const triggers = [BOT_NAME, '라냐', '란야']
  return triggers.some(k => t.includes(k))
}

/** Ollama로 응답 생성 */
async function generateResponse(guildId: string, userId: string, userName: string, text: string): Promise<string> {
  const history = getHistory(guildId, userId)
  history.push({ role: 'user', content: `${userName}: ${text}` })

  // 최근 20개 메시지만 유지
  if (history.length > 20) history.splice(0, history.length - 20)

  const res = await ollamaClient.chat({
    model: 'exaone3.5:7.8b',
    messages: [
      { role: 'system', content: config.system_prompt },
      ...history,
    ],
  })

  const reply = res.message.content
  history.push({ role: 'assistant', content: reply })
  return reply
}

/** TTS 음성을 채널에 재생 */
async function playResponse(connection: VoiceConnection, text: string) {
  try {
    const wavBuffer = await synthesize(text)
    const player = createAudioPlayer()
    const stream = Readable.from(wavBuffer)
    const resource = createAudioResource(stream)

    connection.subscribe(player)
    player.play(resource)

    await new Promise<void>((resolve) => {
      player.on(AudioPlayerStatus.Idle, () => resolve())
      player.on('error', (err) => {
        logger.error('[TTS] 재생 오류:', err)
        resolve()
      })
    })
  } catch (e) {
    logger.error('[TTS] 합성/재생 실패:', e)
  }
}

/** 보이스 채널 음성 수신 시작 */
function startListening(botUserId: string, client: { users: { fetch(id: string): Promise<{ displayName: string }> } }, connection: VoiceConnection, guildId: string) {
  const activeStreams = new Set<string>()

  connection.receiver.speaking.on('start', (userId) => {
    if (userId === botUserId) return
    if (activeStreams.has(userId)) return

    activeStreams.add(userId)
    const chunks: Buffer[] = []

    const stream = connection.receiver.subscribe(userId, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 1500 },
    })

    stream.on('data', (chunk: Buffer) => {
      chunks.push(encoder.decode(chunk))
    })

    stream.on('end', async () => {
      activeStreams.delete(userId)
      if (chunks.length === 0) return

      const pcmBuffer = Buffer.concat(chunks)
      // 너무 짧은 오디오 무시 (0.5초 미만 = 48000 * 2ch * 2bytes * 0.5)
      if (pcmBuffer.length < 96000) return

      try {
        const text = await transcribe(pcmBuffer)
        if (!text || text.trim().length === 0) return

        const user = await client.users.fetch(userId)
        logger.info(`[STT] ${user.displayName}: ${text}`)

        if (!isCallingBot(text)) return

        logger.info(`[호출 감지] ${user.displayName}이(가) ${BOT_NAME}를 불렀습니다`)
        const reply = await generateResponse(guildId, userId, user.displayName, text)
        logger.info(`[AI] → ${reply}`)

        await playResponse(connection, reply)
      } catch (e) {
        logger.error('[음성 처리 실패]', e)
      }
    })
  })
}

class JoinExtension extends Extension {
  @applicationCommand({
    name: lang.join,
    type: ApplicationCommandType.ChatInput,
    description: lang.join_description,
  })
  async join(i: ChatInputCommandInteraction) {
    await i.deferReply()
    const member = i.member as GuildMember
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
      return
    }

    startListening(this.client.user!.id, this.client, connection, voiceChannel.guild.id)
  }

  @applicationCommand({
    name: lang.leave,
    type: ApplicationCommandType.ChatInput,
    description: lang.leave_description,
  })
  async leave(i: ChatInputCommandInteraction) {
    await i.deferReply()
    const member = i.member as GuildMember
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
    conversationHistory.delete(voiceChannel.guild.id)
    await i.editReply(lang.leave_msg)
  }
}

export const setup = async () => {
  return new JoinExtension()
}
