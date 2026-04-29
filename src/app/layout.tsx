import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ThemeColorProvider } from "@/lib/theme/color-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Ceremoney — Wedding & Event Planning Platform",
    template: "%s | Ceremoney",
  },
  description:
    "Plan your perfect wedding, baptism, or event with Ceremoney. Guest management, seating charts, vendor directory, event websites, and more — all in one place.",
  keywords: [
    "wedding planning",
    "event planning",
    "guest management",
    "seating chart",
    "wedding website",
    "RSVP",
    "vendor directory",
    "baptism planning",
    "bröllopstips",
    "bröllopsplanering",
  ],
  authors: [{ name: "Ceremoney" }],
  creator: "Ceremoney",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ceremoney",
    title: "Ceremoney — Wedding & Event Planning Platform",
    description:
      "Plan your perfect wedding or event with Ceremoney. Guest management, seating charts, vendor directory, and beautiful event websites.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ceremoney — Wedding & Event Planning Platform",
    description:
      "Plan your perfect wedding or event with Ceremoney. Guest management, seating charts, vendor directory, and beautiful event websites.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeColorProvider />
        <LanguageProvider>
          <AuthProvider>
            {children}
            <ScrollToTop />
            <ToasterProvider />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
