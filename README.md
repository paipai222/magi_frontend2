# TRIAD — Triple AI Console

3개의 AI와 동시에 채팅하거나, AI끼리 자동으로 대화하는 콘솔입니다.

## 파일 구조

```
triad/
├── index.html        ← 프론트엔드 (API 키 없음)
├── api/
│   └── chat.js       ← 서버 프록시 (API 키는 여기서만 사용)
├── vercel.json       ← Vercel 설정
├── .env.example      ← 환경변수 템플릿 (실제 키 없음)
├── .gitignore        ← .env를 커밋에서 제외
└── README.md
```

## 보안 구조

```
브라우저 (index.html)
    ↓  POST /api/chat  (메시지만 전달, 키 없음)
내 서버 (api/chat.js)
    ↓  OpenAI API Key는 Vercel 환경변수에서만 읽음
OpenAI API
```

## 배포 방법

### 1. GitHub에 올리기
```bash
git init
git add index.html api/ vercel.json .gitignore
# ⚠ .env는 절대 add 하지 마세요!
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/triad.git
git push -u origin main
```

### 2. Vercel 환경변수 설정
Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**

| Key              | Value                        |
|------------------|------------------------------|
| `OPENAI_API_KEY` | `sk-...` (실제 키 입력)       |
| `BOT1_SYSTEM`    | (선택) Alpha 시스템 프롬프트   |
| `BOT2_SYSTEM`    | (선택) Beta 시스템 프롬프트    |
| `BOT3_SYSTEM`    | (선택) Gamma 시스템 프롬프트   |

### 3. 배포
Vercel이 자동으로 빌드하고 배포합니다.
API Key는 Vercel 서버에만 존재하며, 클라이언트(브라우저)에 절대 노출되지 않습니다.
