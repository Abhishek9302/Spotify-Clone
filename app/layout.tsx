import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "@/components/PlayerContext";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar";
import AuthWidget from "@/components/AuthWidget";

export const metadata: Metadata = {
  title: "Spotifyish — ABH-7 Clone",
  description: "A full-stack Spotify clone (frontend + Express API + Postgres).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PlayerProvider>
          <div className="flex flex-col h-screen bg-black">
            <div className="flex flex-1 overflow-hidden gap-2 p-2">
              <Sidebar />
              <main className="flex-1 overflow-y-auto rounded-lg bg-gradient-to-b from-[#1f1f2e] to-spotify-black">
                <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur">
                  <div className="text-white font-bold text-lg">Spotifyish</div>
                  <AuthWidget />
                </header>
                <div className="px-6 pb-10">{children}</div>
              </main>
            </div>
            <PlayerBar />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
