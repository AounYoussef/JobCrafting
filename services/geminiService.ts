import { GoogleGenAI, Type } from "@google/genai";

const getAi = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const createCareerCounselorChat = () => {
  return getAi().chats.create({
    model: 'gemini-3.5-flash',
    config: {
      systemInstruction: `You are an AI career advisor for the JobCrafting platform.
Rules:
1. Ask short questions only. Provide short, concise answers.
2. Learn user skills, interests, and values without repeating questions.
3. Suggest a job directly once clear, or provide exactly two alternatives if unsatisfied.`
    }
  });
};

export const enhanceCV = async (currentCV: string, targetJob: string) => {
  const response = await getAi().models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Optimize this CV for a ${targetJob} role. Highlight transferable skills using strong action verbs. Return clear Markdown:\n"${currentCV}"`,
  });
  return response.text;
};

export const enhanceCVFromImage = async (base64Image: string, mimeType: string, targetJob: string) => {
  const response = await getAi().models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [
      { inlineData: { mimeType, data: base64Image } },
      { text: `Extract, rewrite, and optimize this CV image for a ${targetJob} role. Deliver clean Markdown.` }
    ], 
  });
  return response.text;
};

export const generateImageCV = async (content: string, targetJob: string, style: string = "Modern Professional") => {
  const response = await getAi().models.generateContent({
    model: 'gemini-3-pro-image',
    contents: `Create a professional 1K portrait visual CV/Resume in a ${style} style for a ${targetJob} role using this content:\n${content}`,
    config: {
      imageConfig: { aspectRatio: "3:4", imageSize: "1K" },
    },
  });

  const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : null;
};

export interface SuggestJobsParams {
  query: string;
  location?: string;
  isFreelance?: boolean;
  remoteOnly?: boolean;
}

export const suggestJobs = async (params: SuggestJobsParams) => {
  try {
    const response = await getAi().models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate 8 realistic mock job listings matching query: "${params.query}" location: "${params.location || 'Any'}". Freelance: ${!!params.isFreelance}, Remote Only: ${!!params.remoteOnly}.`,
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
              isRemote: { type: Type.BOOLEAN }
            },
            required: ["id", "title", "company", "location", "salary", "type", "description", "requirements", "tags", "postedDate", "isRemote"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to generate jobs", e);
    return [];
  }
};
