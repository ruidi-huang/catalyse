import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioRender Enterprise Demo Agent",
  description:
    "Hackathon demo shell for a BioRender enterprise sales automation flow.",
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
