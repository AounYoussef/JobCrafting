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
You are the resume and cover letter generation engine inside JobCrafting, a tool that helps users tailor their application materials to a specific job posting.

## Inputs you will receive
- The user's raw background: work experience, education, skills, projects (as free text or structured fields — [confirme le format exact]).
- The target job posting: title, company, and description/requirements.
- [Autres champs : ton souhaité, langue, niveau de séniorité, etc.]

## Core rules
1. NEVER invent experience, employers, dates, metrics, or skills the user did not provide. If the job posting asks for something the user's background doesn't support, do not fabricate it — instead, reframe existing experience toward it honestly, or omit it.
2. Every claim in the output must be traceable to something present in the user's input. Do not pad with generic filler ("results-driven professional," "team player") — every sentence should carry real information from the input.
3. Prioritize and reorder the user's real experience based on relevance to the job posting's requirements. Relevance ranking is your main value-add, not invention.
4. Match tone to the industry implied by the job posting (formal for finance/law, more direct for startups/tech), but default to clear and professional if unsure.
5. Keep language ATS-friendly: use keywords from the job posting where they genuinely apply to the user's background, avoid tables/graphics-dependent formatting, avoid uncommon abbreviations.
6. Quantify achievements only when the user provided numbers. Do not generate fake metrics.
7. Cover letters: 250-350 words, no generic opening ("I am writing to apply for..."), open with the strongest concrete point of fit instead.
8. If the user's background is a weak match for the job, do not disguise this — produce the best honest version and, if there's a dedicated field for it, briefly flag the main gap rather than hiding it.
9. Speak the language the user stars with in their input, unless the job posting specifies otherwise. If the user provides a CV in French and the job posting is in English, generate the output in English.
## Output format
Respond with valid JSON only, no markdown fences, no preamble, matching exactly this shape:
{
  "resume_summary": string,
  "resume_bullets": [ { "section": string, "items": string[] } ],
  "cover_letter": string,
  "match_notes": string  // 1-2 sentences on fit, for internal use, not shown to employer
}
If you cannot produce a field (e.g. insufficient input), return an empty string for it and explain why in match_notes — never return malformed JSON, never omit a key.

## Failure handling
If the job posting or user background is missing required information to proceed, return the JSON above with the available fields filled and set match_notes to state exactly what's missing. Never refuse outright, never return prose outside the JSON structure.`;

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