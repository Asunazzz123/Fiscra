import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeSpending = async (transactions: Transaction[], currentMonth: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "API Key is missing. Please configure your environment.";

  const relevantTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  // Minimize token usage by sending a simplified csv-like string
  const dataSummary = relevantTransactions.map(t => 
    `${t.date}, ${t.type}, ${t.category}, ${t.amount}, ${t.event}`
  ).join("\n");

  const prompt = `
    You are a financial advisor. Analyze the following transaction data for ${currentMonth} (Format: Date, Type, Category, Amount, Event).
    
    Data:
    ${dataSummary}

    Please provide:
    1. A brief summary of spending habits.
    2. Identify the largest expense categories.
    3. One actionable tip to save money based on this specific data.
    4. Keep the tone encouraging and professional. Limit response to 200 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("GenAI Error:", error);
    return "Sorry, I couldn't analyze the data at this moment.";
  }
};

export const chatWithAdvisor = async (history: { role: 'user' | 'model', text: string }[], contextData: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "API Key missing.";

  try {
     // Construct the chat history properly using the new SDK structure if possible, 
     // but for single-turn simplicity or if preserving context manually:
     const systemInstruction = `You are a helpful financial assistant. Here is the user's current transaction context summary: ${contextData}`;
     
     const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction }
     });

     // Replay history to state (simplified for this implementation, usually we keep the chat object alive)
     // For this stateless function approach, we might just send the last message with context. 
     // Better approach for this app: just send the last prompt with context injected.
     
     const lastMessage = history[history.length - 1].text;
     const response = await chat.sendMessage({ message: lastMessage });
     return response.text || "";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Error connecting to advisor.";
  }
}
