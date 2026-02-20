import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate Instagram URL
    if (!url.includes("instagram.com")) {
      return NextResponse.json(
        { error: "Please provide a valid Instagram URL" },
        { status: 400 }
      );
    }

    // Create temp directory for downloads
    const tempDir = path.join(process.cwd(), "tmp", "downloads");
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const fileId = crypto.randomUUID();
    const outputPath = path.join(tempDir, fileId);

    // Use yt-dlp to download the video
    // yt-dlp extracts audio separately with -x, but we need both
    try {
      await execAsync(
        `yt-dlp -o "${outputPath}.%(ext)s" --no-playlist "${url}"`,
        { timeout: 120000 }
      );
    } catch (dlError) {
      console.error("yt-dlp error:", dlError);
      return NextResponse.json(
        { error: "Failed to download video. Make sure yt-dlp is installed and the URL is accessible." },
        { status: 500 }
      );
    }

    // Find the downloaded file
    const { stdout: findOutput } = await execAsync(`ls "${tempDir}" | grep "^${fileId}"`);
    const downloadedFile = findOutput.trim().split("\n")[0];
    
    if (!downloadedFile) {
      return NextResponse.json(
        { error: "Failed to locate downloaded video" },
        { status: 500 }
      );
    }

    const videoPath = path.join(tempDir, downloadedFile);

    // Extract audio using ffmpeg
    const audioPath = path.join(tempDir, `${fileId}.mp3`);
    try {
      await execAsync(
        `ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ar 44100 -ac 2 -b:a 192k "${audioPath}" -y`,
        { timeout: 60000 }
      );
    } catch (ffmpegError) {
      console.error("ffmpeg error:", ffmpegError);
      return NextResponse.json(
        { error: "Failed to extract audio. Make sure ffmpeg is installed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      videoPath,
      audioPath,
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract video" },
      { status: 500 }
    );
  }
}
