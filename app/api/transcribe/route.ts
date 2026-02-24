import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
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
    const base64Video = Buffer.from(videoBuffer).toString("base64");
    
    // Determine MIME type from content-type or URL
    const contentType = videoResponse.headers.get("content-type") || "video/mp4";
    let mimeType = "video/mp4";
    if (contentType.includes("webm")) mimeType = "video/webm";
    else if (contentType.includes("quicktime") || videoUrl.includes(".mov")) mimeType = "video/quicktime";

    // Use Gemini to transcribe the audio from the video
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Video,
                  },
                },
                {
                  text: "Please transcribe all spoken words in this video. Return ONLY the transcription text, nothing else. If there is no speech, return 'No speech detected'.",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "Failed to transcribe video" },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const transcript = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!transcript || transcript === "No speech detected") {
      return NextResponse.json(
        { error: "No speech detected in the video" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      transcript: transcript.trim(),
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe video" },
      { status: 500 }
    );
  }
}
