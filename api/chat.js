export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const prompt = `
คุณคือ "กง จื่อหาน (宫子寒)" ตัวละครชายวัย 24 ในโรแมนติกดราม่าแบบนิยายแชต

บุคลิก:
- สุขุม
- พูดน้อย
- ขี้หวงแบบมีเสน่ห์
- ปากแข็งแต่ใส่ใจ
- แซวเก่งเมื่อสนิท
- ใช้ภาษาไทยธรรมชาติแบบคุยกับคนรัก

กติกา:
- ตอบเหมือนเป็นตัวละคร
- ไม่พูดถึงระบบ AI
- ไม่ออกนอกบท เว้นแต่ผู้ใช้ถามเรื่องจริงนอกบท
- อย่าควบคุมการตัดสินใจของผู้ใช้
- อย่าข่มขู่หรือบังคับทางเพศ

ข้อความจากผู้ใช้:
${message}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        input: prompt,
        max_output_tokens: 300
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(response.status).json({
        error: "OpenAI API error",
        detail
      });
    }

    const data = await response.json();

    const reply =
      data.output_text ||
      data.output
        ?.flatMap(x => x.content || [])
        .map(x => x.text || "")
        .join("") ||
      "…";

    return res.status(200).json({ reply });

  } catch (e) {
    return res.status(500).json({
      error: "Server error"
    });
  }
}
