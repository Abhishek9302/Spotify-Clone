"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "./PlayerContext";
import { api, Song, Playlist, formatDuration } from "@/src/api";

interface Props {
  songs: Song[];
  showAdd?: boolean;
}

export default function SongList({ songs, showAdd = true }: Props) {
  const { playSong, current, isPlaying } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [flash, setFlash] = useState<string>("");

  useEffect(() => {
    if (showAdd) {
      api
        .listPlaylists()
        .then((r) => setPlaylists(r.data))
        .catch(() => {});
    }
  }, [showAdd]);

  async function addTo(playlistId: number, songId: number) {
    try {
      await api.addSongToPlaylist(playlistId, songId);
      setFlash("Added to playlist");
    } catch (e) {
      setFlash(e instanceof Error ? e.message : "Failed");
    } finally {
      setMenuFor(null);
      setTimeout(() => setFlash(""), 2000);
    }
  }

  return (
    <div className="w-full">
      {flash && (
        <div className="mb-2 text-sm text-spotify-green">{flash}</div>
      )}
      <table className="w-full text-left text-sm text-spotify-subdued">
        <thead className="border-b border-white/10 text-xs uppercase">
          <tr>
            <th className="py-2 w-10 pl-3">#</th>
            <th className="py-2">Title</th>
            <th className="py-2 hidden md:table-cell">Album</th>
            <th className="py-2 hidden md:table-cell">Genre</th>
            <th className="py-2 text-right pr-3">⏱</th>
            {showAdd && <th className="py-2 w-10"></th>}
          </tr>
        </thead>
        <tbody>
          {songs.map((song, i) => {
            const active = current?.id === song.id;
            return (
              <tr
                key={song.id}
                className="group hover:bg-spotify-cardHover rounded cursor-pointer"
                onDoubleClick={() => playSong(song, songs)}
              >
                <td className="py-2 pl-3">
                  <button
                    onClick={() => playSong(song, songs)}
                    className="text-spotify-subdued group-hover:text-white"
                    aria-label={`Play ${song.title}`}
                  >
                    {active && isPlaying ? "🔊" : i + 1}
                  </button>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <div
                        className={`font-medium ${
                          active ? "text-spotify-green" : "text-white"
                        }`}
                      >
                        {song.title}
                      </div>
                      <div className="text-xs">{song.artist}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2 hidden md:table-cell">{song.album}</td>
                <td className="py-2 hidden md:table-cell">{song.genre}</td>
                <td className="py-2 text-right pr-3">
                  {formatDuration(song.duration_seconds)}
                </td>
                {showAdd && (
                  <td className="py-2 relative">
                    <button
                      onClick={() =>
                        setMenuFor(menuFor === song.id ? null : song.id)
                      }
                      className="text-spotify-subdued hover:text-white px-2"
                      aria-label="Add to playlist"
                    >
                      ＋
                    </button>
                    {menuFor === song.id && (
                      <div className="absolute right-0 z-20 mt-1 w-48 rounded bg-spotify-cardHover shadow-lg p-1">
                        <div className="px-2 py-1 text-xs text-spotify-subdued">
                          Add to playlist
                        </div>
                        {playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => addTo(pl.id, song.id)}
                            className="block w-full text-left px-2 py-1 text-white hover:bg-black/40 rounded"
                          >
                            {pl.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {songs.length === 0 && (
        <div className="py-8 text-center text-spotify-subdued">
          No songs to show.
        </div>
      )}
    </div>
  );
}
