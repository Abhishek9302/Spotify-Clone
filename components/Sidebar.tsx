"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api, Playlist } from "@/src/api";

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/library", label: "Your Library", icon: "📚" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    api
      .listPlaylists()
      .then((r) => setPlaylists(r.data))
      .catch(() => setPlaylists([]));
  }, [pathname]);

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 gap-2 p-2 bg-black text-spotify-subdued">
      <div className="bg-spotify-black rounded-lg p-4">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <span className="text-spotify-green text-2xl">●</span>
          <span className="text-white text-xl font-bold">Spotifyish</span>
        </Link>
        <nav className="flex flex-col gap-4">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 text-sm font-bold transition-colors hover:text-white ${
                  active ? "text-white" : "text-spotify-subdued"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-spotify-black rounded-lg p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-spotify-subdued">
            Playlists
          </span>
          <Link
            href="/library"
            className="text-spotify-subdued hover:text-white text-xl leading-none"
            title="Create playlist"
          >
            +
          </Link>
        </div>
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/"
              className="flex items-center gap-3 rounded p-2 hover:bg-spotify-cardHover text-sm"
            >
              <span className="w-9 h-9 rounded flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                ♥
              </span>
              <span className="text-white">Liked Songs</span>
            </Link>
          </li>
          {playlists.map((pl) => (
            <li key={pl.id}>
              <Link
                href={`/playlist/${pl.id}`}
                className={`flex items-center gap-3 rounded p-2 hover:bg-spotify-cardHover text-sm ${
                  pathname === `/playlist/${pl.id}` ? "bg-spotify-cardHover" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pl.cover_url}
                  alt={pl.name}
                  className="w-9 h-9 rounded object-cover"
                />
                <span className="truncate text-white">{pl.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
