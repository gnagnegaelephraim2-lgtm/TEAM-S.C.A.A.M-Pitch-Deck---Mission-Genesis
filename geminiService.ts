import { GoogleGenAI } from "@google/genai";

const PITCH_CONTEXT = `
You are the AI Pitch Assistant for Team S.C.A.A.M's project: Mission Genesis.
Mission Genesis is an immersive, game-based learning platform aimed at Cameroon's secondary school students (ages 13-18).
Problem: 30% of young Cameroonians are unprepared for higher ed due to rote memorization.
Mission: Equip 1 million students with higher-order thinking by 2035.
Solution: Mission Genesis offers immersive learning (missions), a skill passport (AI-powered tracking), and connections to opportunities.
Business Model: Freemium ($0), Standard ($7/mo), Premium ($15/mo).
Market Opportunity: TAM is $16.8M (200k students).
The team is: Sandrine Ojong (Lead), Chrys Gnagne (Technical), Ayman Bahadur (Innovation), Abdulkadir Abduljabar (Impact), Marylene Sugira (Designer).
Cost to start: $7,510 USD.
Current Status: Seeking funding and implementation partners.

Answer questions concisely and professionally based on this data.
`;

export const askPitchAssistant = async (question: string) => {
  try {
    // Fix: Create new GoogleGenAI instance and use process.env.API_KEY directly as per guidelines.
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
    return "I'm having trouble connecting to my neural network right now. Please try again!";
  }
};