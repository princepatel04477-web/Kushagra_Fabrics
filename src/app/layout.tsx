import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/cn";
import { Providers } from "@/components/providers/Providers";
import { Preloader } from "@/components/chrome/Preloader";
import { Nav } from "@/components/chrome/Nav";

/*
 * Bodoni Moda (display) and Cabin (body), variable TTFs vendored from the
 * official google/fonts repository because fonts.googleapis.com is not
 * reachable from this build environment. Same families, same axes and
 * weights as next/font/google would resolve; same CSS variable contract:
 * --font-display / --font-body exposed through @theme inline.
 */
const display = localFont({
  src: [
    { path: "../fonts/BodoniModa.ttf", style: "normal" },
    { path: "../fonts/BodoniModa-Italic.ttf", style: "italic" },
  ],
  weight: "400 900",
  display: "swap",
  variable: "--font-kushagra-display",
});

const body = localFont({
  src: [{ path: "../fonts/Cabin.ttf", style: "normal" }],
  weight: "400 700",
  display: "swap",
  variable: "--font-kushagra-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kushagrafabrics.in"),
  title: "Kushagra — Premium fabric gift boxes for men",
  description:
    "Kushagra gifts premium unstitched shirting and suiting fabric in beautifully folded boxes. Pick the fabric, add a note, and his own tailor stitches it. Select, stitch, stand out.",
  openGraph: {
    title: "Kushagra — Premium fabric gift boxes for men",
    description:
      "Unstitched shirting and suiting fabric, gift-boxed for the men who matter. Select, stitch, stand out.",
    type: "website",
    url: "/",
    siteName: "Kushagra",
    images: [
      {
        url: "/brand/kushagra-logo.png",
        width: 1408,
        height: 768,
        alt: "Kushagra logo: a red K with a stitched stem above the wordmark KUSHAGRA",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(display.variable, body.variable)}>
      <body>
        <a href="#main" className="skip-link">
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
