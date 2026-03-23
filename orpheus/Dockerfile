FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git gcc python3-dev libportaudio2 && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/Lex-au/Orpheus-FastAPI .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5005

CMD ["python", "app.py"]