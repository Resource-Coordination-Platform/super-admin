import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "RCP Platform HQ · Super Admin Portal",
  description:
    "Enterprise Super Admin Command Center for Sahasra Resource Coordination Platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
