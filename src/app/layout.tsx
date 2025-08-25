// src/app/layout.tsx — import ui-white.css globally
import type { Metadata } from "next";
import "./globals.css";
import "./ui-white.css";
import DesignStyles from "@/components/DesignStyles";
import Header from "@/components/Header";
import "./cards-modern.css";
import "@/app/revert-liked-ui.css";


export const metadata: Metadata = {
  title: "EPR / PPWR Directory",
  description: "Tools & directory for EPR/PPWR",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en">
      <body>
        <DesignStyles />
        <Header />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
