import type { Metadata } from "next";
import "./globals.css";

const ecosystemFooterLinkStyle = {
  color: "#666",
  fontSize: "0.8rem",
  textDecoration: "none",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <footer style={{ textAlign: "center", padding: "2rem 1rem 1.5rem" }}>
          <a
            href="https://anselmlong.com?from=shitpost"
            style={ecosystemFooterLinkStyle}
          >
            &larr; part of anselmlong.com
          </a>
        </footer>
      </body>
    </html>
  );
}
