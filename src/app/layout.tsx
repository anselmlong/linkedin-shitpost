import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="text-center px-4 pt-8 pb-6">
          <a
            href="https://anselmlong.com?from=shitpost"
            className="text-[0.8rem] tracking-[0.02em] text-li-muted rounded-sm hover:text-li-text hover:underline underline-offset-2 transition-colors"
          >
            &larr; part of anselmlong.com
          </a>
        </footer>
      </body>
    </html>
  );
}
