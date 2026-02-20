import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reel Recipes - Save Recipes from Instagram Reels",
  description: "Extract and save recipes from Instagram food reels. Paste a link, get a formatted recipe.",
};

// Check if Clerk is configured
const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en">
      <body className={`${inter.className} bg-orange-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );

  // Only wrap with ClerkProvider if configured
  if (clerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
