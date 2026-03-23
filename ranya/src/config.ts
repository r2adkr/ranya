export const config = {
  ollama: process.env.OLLAMA_HOST ?? 'http://localhost:11434',
  whisper: process.env.WHISPER_HOST ?? 'http://localhost:8001',
  orpheus: process.env.ORPHEUS_HOST ?? 'http://localhost:8002',
}