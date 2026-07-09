"use client";

import { useEffect, useState } from "react";
import { api, Song, Playlist, Artist } from "@/src/api";
import PlaylistCard from "@/components/PlaylistCard";
import SongList from "@/components/SongList";
import { usePlayer } from "@/components/PlayerContext";

export default function HomePage() {
  const { playSong } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.listPlaylists(), api.listSongs(20, 0), api.listArtists()])
      .then(([pl, sg, ar]) => {
        setPlaylists(pl.data);
        setSongs(sg.data);
        setArtists(ar.data);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load data")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-16 text-spotify-subdued">Loading…</div>;
  }

  if (error) {
    return (
      <div className="py-16 text-red-400">
        Could not reach the backend API. {error}
      </div>
    );
  }

  const recentlyPlayed = songs.slice(0, 6);
  const newReleases = songs.slice(6, 12);

  return (
    <div className="flex flex-col gap-8 pt-4">
      <section>
        <h1 className="text-2xl font-bold text-white mb-4">Good evening</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playlists.map((pl) => (
            <a
              key={pl.id}
              href={`/playlist/${pl.id}`}
              className="flex items-center gap-4 bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pl.cover_url}
                alt={pl.name}
                className="w-16 h-16 object-cover"
              />
              <span className="text-white font-bold">{pl.name}</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">Featured playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">Popular artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {artists.map((ar) => (
            <div
              key={ar.id}
              className="bg-spotify-card hover:bg-spotify-cardHover rounded-lg p-4 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ar.image_url}
                alt={ar.name}
                className="w-full aspect-square object-cover rounded-full mb-3 shadow-lg"
              />
              <div className="text-white font-bold truncate">{ar.name}</div>
              <div className="text-spotify-subdued text-sm">
                {ar.song_count ?? 0} songs
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">Recently played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentlyPlayed.map((s) => (
            <button
              key={s.id}
              onClick={() => playSong(s, songs)}
              className="text-left bg-spotify-card hover:bg-spotify-cardHover rounded-lg p-3 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.cover_url}
                alt={s.title}
                className="w-full aspect-square object-cover rounded-md mb-2"
              />
              <div className="text-white text-sm font-medium truncate">
                {s.title}
              </div>
              <div className="text-spotify-subdued text-xs truncate">
                {s.artist}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-4">New releases</h2>
        <SongList songs={newReleases} />
      </section>
    </div>
  );
}
