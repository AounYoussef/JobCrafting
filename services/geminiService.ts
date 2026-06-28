export interface SuggestJobsParams {
  query: string;
  location?: string;
  isFreelance?: boolean;
  remoteOnly?: boolean;
}

const callApi = async (action: string, params: any) => {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  return res.json();
};

const SYSTEM_INSTRUCTION = `You are an AI career advisor for the JobCrafting platform.
Rules:
1. Ask short questions only. Provide short, concise answers.
2. Learn user skills, interests, and values without repeating questions.
3. Suggest a job directly once clear, or provide exactly two alternatives if unsatisfied.`;

// Stateless chat: keep history in your component's state (array of {role, parts}),
// pass it in each time, append the new message + response yourself after.
export const sendChatMessage = async (history: any[], message: string) => {
  const { text } = await callApi("chatMessage", { history, message, systemInstruction: SYSTEM_INSTRUCTION });
  return text;
};

export const enhanceCV = async (currentCV: string, targetJob: string) => {
  const { text } = await callApi("enhanceCV", { currentCV, targetJob });
  return text;
};

export const enhanceCVFromImage = async (base64Image: string, mimeType: string, targetJob: string) => {
  const { text } = await callApi("enhanceCVFromImage", { base64Image, mimeType, targetJob });
  return text;
};

export const generateImageCV = async (content: string, targetJob: string, style: string = "Modern Professional") => {
  const { image } = await callApi("generateImageCV", { content, targetJob, style });
  return image;
};

export const suggestJobs = async (params: SuggestJobsParams) => {
  try {
    return await callApi("suggestJobs", params);
  } catch (e) {
    console.error("Failed to generate jobs", e);
    return [];
  }
};