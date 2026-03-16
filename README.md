# TripleMind — Multi-Model Chat

3개의 ChatGPT fine-tuned 모델과 동시에 대화하는 챗봇 서비스입니다.

## 🚀 Vercel 배포 방법

### 1. GitHub에 Push
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/triplemind.git
git push -u origin main
```

### 2. Vercel 배포
1. [vercel.com](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 레포 선택
4. Framework: `Other` 선택
5. Deploy 클릭 — 끝!

### 또는 CLI로 배포
```bash
npm i -g vercel
vercel
```

## ⚙ 사용법

1. 배포된 사이트에 접속
2. 우측 상단 **⚙ Settings** 클릭
3. OpenAI API Key 입력
4. 3개 모델의 이름과 Model ID 입력
   - 예: `ft:gpt-4o-mini:my-org::abc123`
5. 저장 후 채팅 시작!

## 🏗 구조

```
├── index.html      # 전체 앱 (HTML + CSS + JS)
├── vercel.json     # Vercel 배포 설정
└── README.md       # 이 파일
```

## 💡 특징

- **3-Column Layout**: 한 번에 3개 모델의 응답을 비교
- **대화 기록 유지**: 각 모델별 독립적인 conversation history
- **System Prompt**: 모델별 시스템 프롬프트 설정 가능
- **반응형 디자인**: 모바일에서도 사용 가능
- **클라이언트 사이드 only**: 서버 불필요, API Key는 브라우저에만 저장

## ⚠ 보안 참고

API Key는 `localStorage`에 저장됩니다. 프로덕션 환경에서는 서버 사이드 프록시를 통해 API Key를 보호하는 것을 권장합니다.
