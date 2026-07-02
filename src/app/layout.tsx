import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ecosystemFooterLinkStyle = {
  color: "#888",
  fontSize: "0.8rem",
  textDecoration: "none",
  opacity: 0.8,
  letterSpacing: "0.02em",
};

export const metadata: Metadata = {
  title: "LinkedIn Shitpost Generator",
  description: "Generate satirical LinkedIn posts from any topic or image",
  icons: [
    {
      url: "/favicon.svg",
      type: "image/svg+xml",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <div style={{ textAlign: "center", padding: "2rem 1rem 1.5rem" }}>
          <a
            href="https://anselmlong.com?from=shitpost"
            style={ecosystemFooterLinkStyle}
          >
            &larr; part of anselmlong.com
          </a>
        </div>
      </body>
    </html>
  );
}
