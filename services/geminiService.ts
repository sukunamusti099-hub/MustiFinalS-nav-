
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizSettings } from "../types";

export async function generateQuizQuestions(settings: QuizSettings): Promise<QuizQuestion[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Admin panelinden ayarlanan özel kişiliği çek, yoksa varsayılanı kullan
  const customInstruction = localStorage.getItem('ai_personality_instruction') || 
    "Sen uzman bir ortaokul-lise öğretmenisin ve eğitim için içerik üreten yapay zekâsın. Nazik ve öğretici bir dil kullan.";

  const prompt = `
${customInstruction}

Ders: ${settings.subject}
Konu: ${settings.topic}
Seviye: ${settings.level}
Rastgelelik kodu: ${settings.randomSeed}

Görevin:
Verilen ders ve konuya uygun, özgün çoktan seçmeli 5 soru üretmektir.

Kesin Kurallar:
- 4 şıklı çoktan seçmeli olsun (A, B, C, D).
- Sadece JSON formatında cevap ver.
- Çıktı tek bir JSON array olsun.

JSON formatı:
[
  {
    "question": "Soru metni",
    "options": {"A": "Şık A", "B": "Şık B", "C": "Şık C", "D": "Şık D"},
    "correct_answer": "Harf",
    "solution": "Çözüm açıklaması"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                },
              },
              correct_answer: { type: Type.STRING },
              solution: { type: Type.STRING },
            },
          },
        },
      },
    });

    return JSON.parse(response.text || "[]") as QuizQuestion[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
