
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly for initialization as per guidelines
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createCareerCounselorChat = () => {
  const ai = getAi();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an AI career advisor for the JobCrafting platform.
      
Rules of Engagement:
1. Ask short questions only.
2. Provide short, concise answers.
3. Ask questions to better understand the user's skills, interests, and values.
4. Never repeat a question that has already been asked.
5. When you have enough information, suggest a job directly.
6. If it's still unclear, keep asking questions.
7. Respond in the user's input language.
8. When you have an idea of a job to suggest, don't hesitate to do so, then ask the user if it suits them, even if you're not entirely sure.
9. For the first message, introduce yourself.
10. If the user isn't satisfied with the job you suggested, provide exactly two other job suggestions.
11. If they still aren't satisfied, ask what specifically doesn't satisfy them about the suggestions.`
    }
  });
};

export const enhanceCV = async (currentCV: string, targetJob: string) => {
  const ai = getAi();
  const prompt = `
    I am targeting the role of: ${targetJob}.
    Here is my current resume/CV content:
    "${currentCV}"

    Please rewrite and optimize this CV to better align with the ${targetJob} role. 
    - Highlight transferable skills.
    - Use strong action verbs.
    - Improve clarity and impact.
    - Return the result in Markdown format with clear sections.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
};

export const enhanceCVFromImage = async (base64Image: string, mimeType: string, targetJob: string) => {
  const ai = getAi();
  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64Image,
    },
  };
  const textPart = {
    text: `This is an image of my CV. I am targeting the role of: ${targetJob}. 
    Please extract the information from this CV and rewrite/optimize it to better align with the ${targetJob} role. 
    - Highlight transferable skills relevant to ${targetJob}.
    - Use strong action verbs.
    - Maintain a professional tone.
    - Return the result in clear Markdown format.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, textPart] },
  });

  return response.text;
};

export const generateImageCV = async (content: string, targetJob: string, style: string = "Modern Professional") => {
  // Uses gemini-3-pro-image-preview for high quality as requested
  const ai = getAi();
  const prompt = `Create a high-quality, ${style} visual CV / Resume design for a ${targetJob} role.
  The CV should include the following information clearly and legibly:
  ${content}
  
  Design requirements:
  - Clean, high-end typography.
  - Professional color palette (blues, greys, white).
  - Clear sections: Summary, Experience, Skills, Education.
  - Modern layout with good use of white space.
  - Portrait orientation.
  - Ensure text is readable.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export interface SuggestJobsParams {
  query: string;
  location?: string;
  isFreelance?: boolean;
  remoteOnly?: boolean;
}

export const suggestJobs = async (params: SuggestJobsParams) => {
    const ai = getAi();
    const { query, location, isFreelance, remoteOnly } = params;
    
    const prompt = `Generate 8 realistic mock job listings for a candidate searching for "${query}" ${location ? `in ${location}` : ''}.
    Requirements:
    - ${isFreelance ? 'Must be Freelance or Contract roles' : 'Focus on Full-time roles'}
    - ${remoteOnly ? 'Must be Remote' : 'Include a mix of on-site and remote'}
    
    Return the response as a JSON array of objects with the following schema:
    - id: unique string
    - title: job title
    - company: realistic company name
    - location: city, state or 'Remote'
    - salary: range (e.g. "$80k - $120k")
    - type: one of 'Full-time', 'Contract', 'Freelance', 'Internship'
    - description: 2-3 sentence overview
    - requirements: array of 3-4 key skills
    - tags: array of 3 strings
    - postedDate: e.g. "2 days ago", "Just posted"
    - companyRating: number between 3.0 and 5.0
    - companyReviewsCount: integer
    - isRemote: boolean
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
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
                      requirements: { 
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      tags: { 
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
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
}
