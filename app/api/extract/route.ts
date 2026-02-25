import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL - support Instagram and TikTok
    const isInstagram = url.includes("instagram.com");
    const isTikTok = url.includes("tiktok.com");

    if (!isInstagram && !isTikTok) {
      return NextResponse.json(
        { error: "Please provide a valid Instagram or TikTok URL" },
        { status: 400 }
      );
    }

    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      return NextResponse.json(
        { error: "Apify API token not configured" },
        { status: 500 }
      );
    }

    // Use appropriate Apify actor based on platform
    const actorId = isTikTok 
      ? "clockworks~tiktok-scraper" 
      : "apilabs~instagram-downloader";

    const runInput = isTikTok 
      ? { postURLs: [url], maxRequestsPerCrawl: 1 }
      : { urls: [url] };

    // Start the actor run
    const startResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(runInput),
      }
    );

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error("Apify start error:", errorText);
      return NextResponse.json(
        { error: "Failed to start video extraction" },
        { status: 500 }
      );
    }

    const runData = await startResponse.json();
    const runId = runData.data?.id;

    if (!runId) {
      console.error("No run ID in response:", JSON.stringify(runData));
      return NextResponse.json(
        { error: "Failed to get extraction job ID" },
        { status: 500 }
      );
    }

    // Poll for completion (max 60 seconds)
    const maxAttempts = 30;
    let attempts = 0;
    let runStatus = "RUNNING";

    while (runStatus === "RUNNING" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${apifyToken}`
      );
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        runStatus = statusData.data?.status || "RUNNING";
      }
      attempts++;
    }

    if (runStatus !== "SUCCEEDED") {
      return NextResponse.json(
        { error: `Video extraction ${runStatus === "RUNNING" ? "timed out" : "failed"}` },
        { status: 500 }
      );
    }

    // Get the results from the dataset
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items?token=${apifyToken}`
    );

    if (!datasetResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get extraction results" },
        { status: 500 }
      );
    }

    const results = await datasetResponse.json();
    
    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "No video found in the Instagram post" },
        { status: 404 }
      );
    }

    // Find video URL in the results (handle different response formats)
    const item = results[0];
    let videoUrl: string | undefined;

    if (isTikTok) {
      // TikTok scraper response format
      videoUrl = item.videoUrl || 
                 item.videoPlayAddr ||
                 item.videoMeta?.downloadAddr ||
                 item.video?.playAddr;
    } else {
      // Instagram downloader response format
      videoUrl = item.videoUrl || item.video_url || 
                 (item.media && item.media[0]?.videoUrl) ||
                 (item.videos && item.videos[0]?.url);
    }

    if (!videoUrl) {
      console.error("No video URL in results:", JSON.stringify(item));
      return NextResponse.json(
        { error: "Could not find video URL. Make sure the post contains a video." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      videoUrl,
      sourceUrl: url,
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract video" },
      { status: 500 }
    );
  }
}
