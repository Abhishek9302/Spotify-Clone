"use client";

import Link from "next/link";
import { Playlist } from "@/src/api";

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group bg-spotify-card hover:bg-spotify-cardHover rounded-lg p-4 transition-colors block"
    >
      <div className="relative mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playlist.cover_url}
          alt={playlist.name}
          className="w-full aspect-square object-cover rounded-md shadow-lg"
        />
        <span className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-spotify-green text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
          ▶
        </span>
      </div>
      <div className="text-white font-bold truncate">{playlist.name}</div>
      <div className="text-spotify-subdued text-sm line-clamp-2">
        {playlist.description || `${playlist.song_count ?? 0} songs`}
      </div>
    </Link>
  );
}
