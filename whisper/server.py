# whisper/server.py
from fastapi import FastAPI, UploadFile, HTTPException
from faster_whisper import WhisperModel
import tempfile
import os
import traceback

app = FastAPI()

print("Loading Whisper model...")
try:
    model = WhisperModel("large-v3", device="cuda", compute_type="float16")
except Exception:
    print("CUDA 사용 불가, CPU 모드로 전환...")
    model = WhisperModel("large-v3", device="cpu", compute_type="int8")
print("Whisper model loaded!")

@app.post("/transcribe")
async def transcribe(file: UploadFile):
    if not file.filename.endswith((".wav", ".mp3", ".ogg", ".webm")):
        raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식이야.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(
            tmp_path,
            language="ko",
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=500
            ),
        )
        text = "".join(s.text for s in segments).strip()
        return {
            "text": text,
            "language": info.language,
            "duration": round(info.duration, 2),
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

@app.get("/health")
async def health():
    return {"status": "ok"}