import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "RT Direct - Radiologic Technologist Job Board",
    template: "%s | RT Direct"
  },
  description: "The leading platform connecting radiologic technologists with top healthcare facilities. Find your next imaging career opportunity with competitive salaries and excellent benefits.",
  keywords: [
    "radiologic technologist jobs",
    "radiology careers",
    "medical imaging jobs",
    "CT technologist",
    "MRI technologist",
    "healthcare jobs",
    "medical jobs",
    "RT jobs"
  ],
  authors: [{ name: "RT Direct" }],
  creator: "RT Direct",
  publisher: "RT Direct",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://rt-direct.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RT Direct - Radiologic Technologist Job Board",
    description: "The leading platform connecting radiologic technologists with top healthcare facilities.",
    url: "https://rt-direct.vercel.app",
    siteName: "RT Direct",
    images: [
      {
        url: "/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "RT Direct - Radiologic Technologist Job Board",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RT Direct - Radiologic Technologist Job Board",
    description: "The leading platform connecting radiologic technologists with top healthcare facilities.",
    images: ["/og-image.png?v=3"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "32x32", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
      { rel: "mask-icon", url: "/favicon.svg", color: "#0A58CA" }
    ],
  },
  verification: {
    google: "google-verification-code", // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/favicon.svg" color="#0A58CA" />
        <meta name="theme-color" content="#0A58CA" />
        <meta name="msapplication-TileColor" content="#0A58CA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RT Direct" />
        <meta property="og:image" content="/og-image.png?v=3" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/og-image.png?v=3" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
