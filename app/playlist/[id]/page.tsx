"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, Playlist } from "@/src/api";
import SongList from "@/components/SongList";
import { usePlayer } from "@/components/PlayerContext";

export default function PlaylistPage() {
  const params = useParams();
  const id = Number(params?.id);
  const { playQueue } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getPlaylist(id)
      .then((r) => setPlaylist(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-16 text-spotify-subdued">Loading…</div>;
  if (error || !playlist)
    return <div className="py-16 text-red-400">{error || "Not found"}</div>;

  const tracks = playlist.tracks || [];

  return (
    <div className="pt-4">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playlist.cover_url}
          alt={playlist.name}
          className="w-48 h-48 object-cover rounded-md shadow-2xl"
        />
        <div>
          <div className="text-xs uppercase text-spotify-subdued font-bold">
            Playlist
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white my-3">
            {playlist.name}
          </h1>
          <p className="text-spotify-subdued">{playlist.description}</p>
          <p className="text-spotify-subdued text-sm mt-2">
            {tracks.length} songs
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => tracks.length && playQueue(tracks, 0)}
          disabled={!tracks.length}
          className="w-14 h-14 rounded-full bg-spotify-green text-black text-xl flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
          aria-label="Play playlist"
        >
          ▶
        </button>
      </div>

      <SongList songs={tracks} />
    </div>
  );
}
