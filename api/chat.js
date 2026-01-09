export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing DEEPSEEK_API_KEY" });
  }

  const { answers } = req.body || {};

  const systemPrompt = `
你不是招生顾问，也不是执行者。
你代表的是“判断位师徒制”。

基本原则：
- 只做判断与风险压缩
- 不进入执行位
- 不承诺结果
- 不为情绪修改结论
- 不适合的人应当被劝退
`;

  const userPrompt = `
请严格按以下结构回答（不要扩展）：

【一句话定义】
【这套师徒制解决什么问题】（2-3条）
【这套师徒制不解决什么问题】（2-3条）
【什么样的家长适合】
【什么样的家长不适合】
【如果你现在犹豫，最安全的建议】

家长填写如下：
${JSON.stringify(answers, null, 2)}
`;

  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt.trim() }
      ],
      temperature: 0.2
    })
  });

  const data = await r.json();
  return res.status(200).json(data);
}
