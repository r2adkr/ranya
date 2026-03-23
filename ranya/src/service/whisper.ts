import { config } from '../types/config'
import { pcmToWav } from '../utils/wav'

export async function transcribe(pcmBuffer: Buffer): Promise<string> {
  const wavBuffer = pcmToWav(pcmBuffer)
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(wavBuffer)]), 'audio.wav')

  const res = await fetch(`${config.whisper_host}/transcribe`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) throw new Error(`STT 실패: ${res.status}`)
  const data = await res.json() as { text: string }
  return data.text
}