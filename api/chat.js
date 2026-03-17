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

  // ── [DEBUG] Vercel → Functions → Logs 에서 확인 (해결 후 삭제)
  console.log('=== [DEBUG] /api/chat called ===');
  console.log('[DEBUG] botIndex         :', botIndex);
  console.log('[DEBUG] model selected   :', model);
  console.log('[DEBUG] BOT1_MODEL env   :', process.env.BOT1_MODEL ? '✅ SET' : '❌ NOT SET');
  console.log('[DEBUG] BOT2_MODEL env   :', process.env.BOT2_MODEL ? '✅ SET' : '❌ NOT SET');
  console.log('[DEBUG] BOT3_MODEL env   :', process.env.BOT3_MODEL ? '✅ SET' : '❌ NOT SET');
  console.log('[DEBUG] messages count   :', messages.length);
  console.log('[DEBUG] messages payload :', JSON.stringify(messages));

  if (!model) {
    return res.status(500).json({ error: `BOT${botIndex + 1}_MODEL 환경변수가 설정되지 않았습니다.` });
  }

  const MAX_MESSAGES = 4;
  const trimmedMessages = messages.length > MAX_MESSAGES
    ? messages.slice(-MAX_MESSAGES)
    : messages;

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
        messages: trimmedMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.log('[DEBUG] OpenAI error:', response.status, err?.error?.message);
      return res.status(response.status).json({
        error: err?.error?.message || `OpenAI error ${response.status}`,
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    console.log('[DEBUG] reply preview  :', reply.slice(0, 150));

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({ error: `Network error: ${err.message}` });
  }
}