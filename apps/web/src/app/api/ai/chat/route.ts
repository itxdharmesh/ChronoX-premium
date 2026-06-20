import { NextResponse } from 'next/server';
import { geminiClient, CHRONOX_AI_MODELS } from '../../../../../infrastructure/config/gemini';
import { ChatValidator } from '../../../../../core/entities/Chat';

export async function POST(request: Request) {
  try {
    const { prompt, context } = await request.json();

    const validation = ChatValidator.validateMessage(prompt);
    if (!validation.isValid) {
      return NextResponse.json({ error: "Invalid context payload or empty prompt string input." }, { status: 400 });
    }

    // Engineering structured prompts for the Chronox gaming universe
    const systemInstruction = `You are Chronox AI, an expert host of a high-stakes competitive speed-trivia game. 
    Keep responses sharp, intellectual, engaging, and directly answering the user's game context: ${context || 'General Arena'}.`;

    // Calling the official @google/genai SDK engine
    const responseStream = await geminiClient.models.generateContent({
      model: CHRONOX_AI_MODELS.fastChat,
      contents: validation.cleanedText,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    const aiTextOutput = responseStream.text || "Chronox engine failed to compute automated conversational response logic.";

    return NextResponse.json({ 
      success: true, 
      message: aiTextOutput,
      timestamp: new Date()
    });

  } catch (error: any) {
    console.error("Gemini context engine communication fault:", error);
    return NextResponse.json({ error: "Failed to establish synchronization loop with Gemini inference framework." }, { status: 500 });
  }
}
