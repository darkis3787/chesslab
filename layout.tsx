import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChessLab",
  description: "Chess PGN study, repertoire and training lab"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
