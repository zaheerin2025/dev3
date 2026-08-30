import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { site } from "@/lib/site";
import {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/schema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Web Development Company | Websites, Apps & Software — Developers3",
    template: "%s | Developers3",
  },
  description: site.description,
  keywords: [
    "web development agency",
    "web development company",
    "custom website development",
    "wordpress development",
    "ecommerce development",
    "seo services",
    "mobile app development",
    "Developers3",
  ],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: "Web Development Company | Websites, Apps & Software — Developers3",
    description: site.description,
    images: [
      {
        url: "/images/og-image.png",
        width: 1440,
        height: 720,
        alt: "Developers3 — Web, App & Software Development Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Development Company | Websites, Apps & Software — Developers3",
    description: site.description,
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#050914",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
// AdSense publisher id — the loader script + <AdSlot> units activate when set.
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-1264514278457797';

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteSchema()) }}
        />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        {adsenseClient ? (
          // Plain async script: React 19 hoists it into <head>, which is where
          // AdSense must live (next/script's data-nscript upsets its checker).
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </body>
    </html>
  );
}
