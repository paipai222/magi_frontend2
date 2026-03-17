/**
 * /api/chat.js  — Vercel Serverless Function (Node.js)
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server: OPENAI_API_KEY가 설정되지 않았습니다.' });
  }

  const { messages, botIndex } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages 배열이 필요합니다.' });
  }

  const botModels = [
    process.env.BOT1_MODEL || 'gpt-4.1-nano',
    process.env.BOT2_MODEL || 'gpt-4.1-nano',
    process.env.BOT3_MODEL || 'gpt-4.1-nano',
  ];
  const model = botModels[botIndex] ?? botModels[0];

  if (!model) {
    return res.status(500).json({ error: `BOT${botIndex + 1}_MODEL 환경변수가 설정되지 않았습니다.` });
  }

  // ── 공통 System Prompt ──
  // 학습 데이터엔 system이 없었지만, 언어/통화 규칙은 런타임에 주입
  const SYSTEM_PROMPT = `Always reply in the same language the user writes in.
If the user writes in Korean, reply in Korean.
If the user writes in English, reply in English.
Always express monetary amounts in USD.`;

  const MAX_MESSAGES = 4;
  const trimmedMessages = messages.length > MAX_MESSAGES
    ? messages.slice(-MAX_MESSAGES)
    : messages;

  // system prompt를 messages 맨 앞에 주입
  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...trimmedMessages,
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: fullMessages,
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

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: `Network error: ${err.message}` });
  }
}