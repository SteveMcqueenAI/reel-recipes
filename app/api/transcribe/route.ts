import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createReadStream, existsSync } from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { audioPath } = await req.json();

    if (!audioPath) {
      return NextResponse.json(
        { error: "Audio path is required" },
        { status: 400 }
      );
    }

    if (!existsSync(audioPath)) {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 }
      );
    }

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({
      transcript: transcription.text,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
