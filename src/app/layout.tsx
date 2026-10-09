import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cabin } from "next/font/google";
import type { ReactNode } from "react";

import { Nav } from "@/components/chrome/Nav";
import { Preloader } from "@/components/chrome/Preloader";
import { Providers } from "@/components/providers/Providers";

import "./globals.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  // No weight list: Bodoni Moda is a variable font (wght 400–900), and the
  // footer wordmark animates the weight axis per letter. Static instances
  // would snap between weights instead of moving smoothly.
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
  title: "Kushagra — Premium fabric gift boxes for men",
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
        url: "/brand/kushagra-logo.png",
        width: 816,
        height: 564,
        alt: "Kushagra",
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
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
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
        </Providers>
      </body>
    </html>
  );
}
