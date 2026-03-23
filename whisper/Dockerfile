FROM nvidia/cuda:12.6.3-runtime-ubuntu24.04

WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg && rm -rf /var/lib/apt/lists/*

RUN pip install --break-system-packages fastapi uvicorn faster-whisper python-multipart

COPY server.py .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]