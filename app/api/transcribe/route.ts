import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Download the video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      return NextResponse.json(
        { error: "Failed to download video" },
        { status: 500 }
      );
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    
    // Determine file extension from content-type or URL
    const contentType = videoResponse.headers.get("content-type") || "";
    let extension = "mp4";
    if (contentType.includes("webm")) extension = "webm";
    else if (contentType.includes("quicktime") || videoUrl.includes(".mov")) extension = "mov";
    
    // Create a File-like object for OpenAI
    const file = await toFile(Buffer.from(videoBuffer), `video.${extension}`);

    // Transcribe using OpenAI Whisper
    // Note: Whisper can handle video files and extracts audio automatically
    const transcription = await getOpenAI().audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({
      transcript: transcription.text,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe video" },
      { status: 500 }
    );
  }
}
