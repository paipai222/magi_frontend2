/**
 * /api/chat.js  — Vercel Serverless Function (Node.js)
 *
 * 브라우저는 이 엔드포인트(/api/chat)만 호출합니다.
 * OpenAI API Key와 모델명은 Vercel 환경변수에만 존재하며, 클라이언트에 절대 노출되지 않습니다.
 *
 * Vercel 대시보드 설정:
 *   Project → Settings → Environment Variables
 *   OPENAI_API_KEY = sk-...
 *   BOT1_MODEL     = ft:gpt-4o-mini:your-org:model-name:id   (fine-tuned 모델명)
 *   BOT2_MODEL     = ft:gpt-4o-mini:your-org:model-name:id
 *   BOT3_MODEL     = ft:gpt-4o-mini:your-org:model-name:id
 */

export default async function handler(req, res) {
  // ── CORS: 같은 origin만 허용 ──
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  // ── 환경변수에서 API Key 읽기 (클라이언트에 절대 전달 안 함) ──
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server: OPENAI_API_KEY가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.' });
  }

  // ── 요청 파싱 ──
  const { messages, botIndex } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages 배열이 필요합니다.' });
  }

  // ── 봇별 모델명 (환경변수에서 읽기 — 클라이언트에 노출 안 됨) ──
  const botModels = [
    process.env.BOT1_MODEL || 'gpt-4.1-nano',
    process.env.BOT2_MODEL || 'gpt-4.1-nano',
    process.env.BOT3_MODEL || 'gpt-4.1-nano',
  ];
  const model = botModels[botIndex] ?? botModels[0];

  if (!model) {
    return res.status(500).json({ error: `BOT${botIndex + 1}_MODEL 환경변수가 설정되지 않았습니다.` });
  }

  // ── OpenAI API 호출 ──
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,   // ← 키는 여기서만 사용
      },
      body: JSON.stringify({
        model,           // ← fine-tuned 모델명 (환경변수에서만 읽음)
        max_tokens: 1024,
        messages,        // ← fine-tuned 모델은 보통 system 프롬프트 불필요
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.error?.message || `OpenAI error ${response.status}`,
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    // ── 클라이언트에는 답변 텍스트만 반환 ──
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: `Network error: ${err.message}` });
  }
}