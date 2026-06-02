import { getAiClient } from './api/utils';
import { Type } from "@google/genai";

async function test() {
  try {
    const ai = await getAiClient();
    console.log("AI Client initialized successfully.");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Say 'Hello, AI logic verified.'",
    });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
