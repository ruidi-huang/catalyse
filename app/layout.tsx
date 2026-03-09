import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioRender Hackathon Demo",
  description: "Single-path GTM research to BioRender timeline demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
