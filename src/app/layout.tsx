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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0A58CA" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
