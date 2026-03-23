import { config } from '../types/config'

export async function synthesize(text: string): Promise<Buffer> {
  const res = await fetch(`${config.orpheus_host}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'orpheus',
      input: text,
      voice: '유나',
      response_format: 'wav',
      speed: 1.0,
    }),
  })

  if (!res.ok) throw new Error(`TTS 실패: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}