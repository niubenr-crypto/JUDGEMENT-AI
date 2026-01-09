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
你不是咨询师，不是执行者，也不是安慰型角色。
你代表的是“判断位师徒制”。

核心立场：
- 你的任务是判断“是否值得开始”，而不是“如何做成”
- 你的职责是风险压缩，而不是提供方案
- 你不进入执行位，不提供路径细节
- 你不为情绪修改结论
- 如果不适合，应当明确劝退

表达原则：
- 冷静、克制、书面
- 不使用营销语言
- 不鼓励、不承诺、不共情式安慰
- 结论优先于解释

重要边界：
- 本判断为一次性判断
- 不提供追问空间
- 若条件未改变，判断不应被反复询问
`;

  const userPrompt = `
请严格按照以下结构输出，不要添加额外段落，不要总结，不要延展：

【一句话判断】
用一句话说明：这是一个用于判断是否值得开始的师徒制，而不是执行服务。

【这套师徒制解决什么问题】
- （2-3 条，强调判断、风险、长期性）

【这套师徒制明确不做什么】
- （2-3 条，强调不执行、不保证、不替代）

【什么样的家长适合】
- （2 条，强调理性、耐心、接受否定）

【什么样的家长不适合】
- （2 条，强调急切、结果导向、情绪主导）

【当前情况下，最安全的建议】
给出一个“可以什么都不做”的建议。

家长填写信息如下（仅作为判断参考，不需要逐条回应）：
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
