import { GoogleGenAI, Type } from "@google/genai";

const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, params } = req.body;

  try {
    switch (action) {
      case "chatMessage": {
        // params: { history: [{role, parts}], message: string, systemInstruction: string }
        const chat = getAi().chats.create({
          model: "gemini-3.5-flash",
          history: params.history || [],
          config: { systemInstruction: params.systemInstruction },
        });
        const response = await chat.sendMessage({ message: params.message });
        return res.status(200).json({ text: response.text });
      }

      case "enhanceCV": {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Optimize this CV for a ${params.targetJob} role. Highlight transferable skills using strong action verbs. Return clear Markdown:\n"${params.currentCV}"`,
        });
        return res.status(200).json({ text: response.text });
      }

      case "enhanceCVFromImage": {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            { inlineData: { mimeType: params.mimeType, data: params.base64Image } },
            { text: `Extract, rewrite, and optimize this CV image for a ${params.targetJob} role. Deliver clean Markdown.` },
          ],
        });
        return res.status(200).json({ text: response.text });
      }

      case "generateImageCV": {
        const response = await getAi().models.generateContent({
          model: "gemini-3-pro-image",
          contents: `Create a professional 1K portrait visual CV/Resume in a ${params.style} style for a ${params.targetJob} role using this content:\n${params.content}`,
          config: { imageConfig: { aspectRatio: "3:4", imageSize: "1K" } },
        });
        const imgPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        return res.status(200).json({ image: imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : null });
      }

      case "suggestJobs": {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Generate 8 realistic mock job listings matching query: "${params.query}" location: "${params.location || "Any"}". Freelance: ${!!params.isFreelance}, Remote Only: ${!!params.remoteOnly}.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  salary: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  postedDate: { type: Type.STRING },
                  companyRating: { type: Type.NUMBER },
                  companyReviewsCount: { type: Type.INTEGER },
                  isRemote: { type: Type.BOOLEAN },
                },
                required: ["id", "title", "company", "location", "salary", "type", "description", "requirements", "tags", "postedDate", "isRemote"],
              },
            },
          },
        });
        return res.status(200).json(JSON.parse(response.text || "[]"));
      }

      default:
        return res.status(400).json({ error: "Unknown action" });
    }
  } catch (e) {
    console.error("Gemini proxy error", e);
    return res.status(500).json({ error: "Gemini request failed" });
  }
}