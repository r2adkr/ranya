# 라냐 (Ranya)

AI 기반 한국어 음성 대화 디스코드 봇입니다. 음성 채널에서 사용자의 말을 인식하고, AI가 생성한 응답을 음성으로 들려줍니다.

## 주요 기능

- **음성 인식 (STT)**: Whisper를 사용하여 사용자 음성을 한국어 텍스트로 변환
- **AI 대화**: Ollama (exaone3.5 모델)를 통해 자연스러운 한국어 대화 생성
- **음성 합성 (TTS)**: Orpheus 한국어 TTS로 AI 응답을 음성으로 출력
- **대화 기록 유지**: 사용자별 대화 히스토리 관리 (최대 20개 메시지)
- **봇 이름 호출**: "라냐", "란야" 등 이름을 부르면 응답

## 아키텍처

```
사용자 음성 → Discord → Ranya 봇
                          ├─→ Whisper (음성→텍스트)
                          ├─→ Ollama (AI 응답 생성)
                          └─→ Orpheus (텍스트→음성) → Discord → 사용자
```

| 서비스 | 역할 | 포트 | GPU |
|--------|------|------|-----|
| **ranya** | 디스코드 봇 | - | ✗ |
| **ollama** | LLM 추론 | 11434 | ✓ |
| **whisper** | 음성 인식 (STT) | 8001 | ✓ |
| **llama-cpp-server** | Orpheus 모델 서빙 | 5006 | ✓ |
| **orpheus** | 음성 합성 (TTS) | 8002 | ✓ |

## 사전 요구사항

- [Docker](https://docs.docker.com/get-docker/) 및 [Docker Compose](https://docs.docker.com/compose/install/)
- **NVIDIA GPU** + [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) (AI 서비스에 GPU 필요)
- [디스코드 봇 토큰](https://discord.com/developers/applications)

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd ranya-master
```

### 2. 봇 설정 파일 생성

`ranya/config.example.json`을 복사하여 `ranya/config.json`을 만듭니다.

```bash
cp ranya/config.example.json ranya/config.json
```

`ranya/config.json`을 열어 아래 항목을 수정합니다:

```jsonc
{
  "token": "디스코드_봇_토큰을_여기에_입력",
  "guilds": ["슬래시_커맨드를_등록할_서버_ID"],
  "ai_docker_port": 11434,
  "system_prompt": "시스템 프롬프트 (AI 성격 설정)",
  "bot_name": "라냐",
  "whisper_host": "http://whisper:8001",
  "orpheus_host": "http://orpheus:8002"
}
```

| 항목 | 설명 |
|------|------|
| `token` | 디스코드 봇 토큰 |
| `guilds` | 슬래시 커맨드를 등록할 디스코드 서버 ID 배열 |
| `ai_docker_port` | Ollama 서비스 포트 (기본값: `11434`) |
| `system_prompt` | AI에게 전달할 시스템 프롬프트 (봇 성격 설정) |
| `bot_name` | 봇 호출 이름 (기본값: `라냐`) |
| `whisper_host` | Whisper STT 서비스 주소 |
| `orpheus_host` | Orpheus TTS 서비스 주소 |

### 3. Docker Compose로 실행

```bash
docker compose up -d
```

처음 실행 시 다음 작업이 자동으로 수행됩니다:
- Whisper 모델 다운로드 (`large-v3`)
- Orpheus 한국어 TTS 모델 다운로드 (`Orpheus-3b-Korean-FT-Q8_0.gguf`)
- 각 서비스 컨테이너 빌드

> ⚠️ 모델 다운로드로 인해 첫 실행 시 시간이 다소 소요될 수 있습니다.

### 4. Ollama 모델 준비

Ollama 컨테이너가 실행된 후 사용할 AI 모델을 가져옵니다:

```bash
docker compose exec ollama ollama pull exaone3.5:7.8b
```

## 사용 방법

### 슬래시 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/들어와` | 봇을 현재 음성 채널로 초대 |
| `/나가` | 봇을 음성 채널에서 퇴장 (대화 기록 초기화) |
| `/핑` | 봇 응답 지연 시간 확인 |

### 음성 대화

1. 디스코드 음성 채널에 접속합니다.
2. `/들어와` 명령어로 봇을 음성 채널에 초대합니다.
3. **"라냐"** (또는 설정한 봇 이름)를 포함하여 말하면 봇이 응답합니다.
4. 봇이 음성으로 답변해줍니다.
5. 대화가 끝나면 `/나가` 명령어로 봇을 퇴장시킵니다.

## 로컬 개발 (봇만)

Docker 없이 봇 코드만 개발할 경우:

```bash
cd ranya
corepack enable
pnpm install
pnpm dev
```

> **요구사항**: Node.js 22+, pnpm

| 스크립트 | 설명 |
|----------|------|
| `pnpm dev` | 개발 모드 실행 (ts-node + SWC) |
| `pnpm build` | TypeScript 컴파일 (`dist/` 폴더 생성) |
| `pnpm start` | 프로덕션 실행 (`dist/index.js`) |

## 프로젝트 구조

```
├── docker-compose.yml          # 전체 서비스 오케스트레이션
├── ranya/                      # 디스코드 봇 (Node.js/TypeScript)
│   ├── config.example.json     # 설정 파일 예시
│   ├── lang.json               # 다국어 문자열
│   └── src/
│       ├── index.ts            # 진입점
│       ├── config.ts           # 설정 로더
│       ├── modules/            # 기능 모듈
│       │   ├── ping.ts         # /핑 커맨드
│       │   ├── join.ts         # /들어와, /나가 + 음성 처리
│       │   └── event.ts        # 이벤트 핸들러
│       ├── service/            # 외부 서비스 클라이언트
│       │   ├── whisper.ts      # Whisper STT API
│       │   └── tts.ts          # Orpheus TTS API
│       ├── structures/         # Client 클래스
│       └── utils/              # 유틸리티 (로거, WAV 인코딩)
├── whisper/                    # 음성 인식 서비스 (Python/FastAPI)
│   ├── Dockerfile
│   └── server.py
└── orpheus/                    # 음성 합성 서비스 래퍼
    └── Dockerfile
```

## 문제 해결

- **봇이 음성을 인식하지 못하는 경우**: Whisper 서비스 로그 확인 (`docker compose logs whisper`)
- **AI 응답이 없는 경우**: Ollama 모델이 정상적으로 로드되었는지 확인 (`docker compose exec ollama ollama list`)
- **TTS가 작동하지 않는 경우**: Orpheus 및 llama-cpp-server 로그 확인 (`docker compose logs orpheus llama-cpp-server`)
- **GPU 관련 오류**: NVIDIA 드라이버와 Container Toolkit 설치 여부 확인

## 라이선스

이 프로젝트는 MIT 라이선스로 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
