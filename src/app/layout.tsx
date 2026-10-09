import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cabin } from "next/font/google";
import type { ReactNode } from "react";

import { Nav } from "@/components/chrome/Nav";
import { Preloader } from "@/components/chrome/Preloader";
import { Footer } from "@/components/chrome/Footer";
import { Providers } from "@/components/providers/Providers";
import { HEAD_SCRIPT } from "@/lib/headScript";

import "./globals.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  // No weight list: Bodoni Moda loads as its variable font (wght 400–900).
  style: ["normal", "italic"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

const body = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cabin",
  display: "swap",
});

const siteUrl = "https://kushagrafabrics.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kushagra — Premium fabric gift boxes for men",
    template: "%s — Kushagra",
  },
  description:
    "Kushagra sends premium unstitched shirting and suiting as a gift box. You pick the cloth, he gets it stitched by his own tailor, and he stands out. Select, stitch, stand out.",
  applicationName: "Kushagra",
  keywords: [
    "fabric gift box",
    "unstitched shirting",
    "unstitched suiting",
    "Raksha Bandhan gift for brother",
    "corporate gifting India",
  ],
  openGraph: {
    type: "website",
    siteName: "Kushagra",
    title: "Kushagra — Premium fabric gift boxes for men",
    description:
      "You pick the cloth, he gets it stitched by his own tailor. Select, stitch, stand out.",
    url: siteUrl,
    locale: "en_IN",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "A Kushagra shirt box with two folded shirt lengths and a red ribbon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kushagra — Premium fabric gift boxes for men",
    description:
      "You pick the cloth, he gets it stitched by his own tailor. Select, stitch, stand out.",
  },
  icons: {
    icon: [{ url: "/brand/kushagra-mark.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#EEF1F4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${body.variable}`}
      // The head script sets data-js and data-preloaded before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
        <noscript>
          <style>{".preloader{display:none}"}</style>
        </noscript>
      </head>
      <body>
        {/* React hoists these into <head>. Fonts load through next/font with
            font-display: swap; the hints warm the connection up front. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>
          <Preloader />
          <Nav />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
