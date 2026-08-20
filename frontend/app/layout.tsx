import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { BackendHealthGate } from "@/components/BackendHealthGate";

export const metadata: Metadata = {
  title: "MindTrack",
  description: "A quiet place to track how you're doing",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <BackendHealthGate>
          <AuthProvider>{children}</AuthProvider>
        </BackendHealthGate>
      </body>
    </html>
  );
}
