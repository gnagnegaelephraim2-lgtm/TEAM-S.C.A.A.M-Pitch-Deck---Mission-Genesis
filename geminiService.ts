import { GoogleGenAI } from "@google/genai";

const PITCH_CONTEXT = `
You are "Dawn", the AI Pitch Assistant for Team S.C.A.A.M's project: Mission Genesis.
CRITICAL PRONUNCIATION: S.C.A.A.M is pronounced exactly like the word "Scam". 

MISSION RULES:
1. Provide extremely concise intel. Maximum 1-2 short sentences.
2. NEVER introduce yourself or say your name ("I am Dawn", "I'm Dawn") after the initial greeting has already happened. The user already knows who you are.
3. Be professional, strategic, and direct.

Mission Genesis details:
- Audience: Cameroon's secondary students (13-18).
- Goal: 1M students with higher-order thinking by 2035.
- Core: Immersive gaming missions + AI Skill Passport.
- Revenue: Freemium ($0), Standard ($7), Premium ($15).
- Market: $16.8M TAM.
- Leadership: Sandrine (Lead), Chrys (Tech), Ayman (Innovation), Abdulkadir (Impact), Marylene (Design).
`;

export const askPitchAssistant = async (question: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: question,
      config: {
        systemInstruction: PITCH_CONTEXT,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "Neural link unstable. Please retry.";
  }
};