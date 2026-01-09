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
 - 明确希望你“帮忙判断”，而不是“替我推进”
  - 能接受“不适合现在开始”的结论
  - 对孩子的期待偏向长期能力，而非短期结果
- 输出原则：
  - 可以给出“有条件的正面判断”
  - 只能确认其适合继续留在【判断型训练】的观察范围内
  - 不得承诺结果，不得进入执行层

【B｜判断位基本匹配，但节奏偏快】
- 表现为：
  - 理性上接受判断，但隐含明显的进度焦虑
- 输出原则：
  - 给出“暂缓型判断”
  - 强调节奏与风险，而不是否定动机

【C｜判断位不匹配，风险较高】
- 表现为：
  - 无法接受否定结论
  - 强烈要求方案、路径或执行支持
- 输出原则：
  - 明确给出“不适合进入本体系”的判断
  - 不做安慰，不给替代方案

【D｜动机尚可，但对体系理解不足】
- 表现为：
  - 愿意被判断，但期待仍停留在结果层或标签层
- 输出原则：
  - 不否定人
  - 明确指出“当前不在判断位”
  - 建议停留在理解阶段，而非进入判断或执行

【统一输出要求（必须遵守）】
- 先给出明确结论（是否适合继续停留在判断层）
- 再指出 1–2 个最关键的风险或条件
- 正面判断必须附带边界与限制
- 不提供任何执行方案、步骤或路径
- 不使用安慰性语言，不承诺结果
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
