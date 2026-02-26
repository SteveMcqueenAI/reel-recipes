import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./components/theme-provider";
import ServiceWorkerRegister from "./components/sw-register";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reel Recipes - Save Recipes from Instagram Reels",
  description: "Extract and save recipes from Instagram food reels. Paste a link, get a formatted recipe.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reel Recipes",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

// Check if Clerk is configured
const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#F97316" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} bg-orange-50 dark:bg-gray-900 min-h-screen transition-colors`}>
        <ThemeProvider>
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );

  // Only wrap with ClerkProvider if configured
  if (clerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
