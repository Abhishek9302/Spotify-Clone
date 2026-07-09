"use client";

import { useEffect, useState } from "react";
import { api, Playlist } from "@/src/api";
import PlaylistCard from "@/components/PlaylistCard";

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api
      .listPlaylists()
      .then((r) => setPlaylists(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await api.createPlaylist({ name: name.trim(), description });
      setName("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    try {
      await api.deletePlaylist(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="pt-4">
      <h1 className="text-2xl font-bold text-white mb-6">Your Library</h1>

      <form
        onSubmit={create}
        className="bg-spotify-elevated rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-3 items-start sm:items-end"
      >
        <div className="flex-1 w-full">
          <label className="block text-xs text-spotify-subdued mb-1">
            Playlist name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome mix"
            className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-spotify-green"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs text-spotify-subdued mb-1">
            Description
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
            className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white outline-none focus:border-spotify-green"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-spotify-green hover:bg-spotify-greenHover text-black font-bold rounded-full px-6 py-2 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create"}
        </button>
      </form>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {playlists.map((pl) => (
          <div key={pl.id} className="relative group">
            <PlaylistCard playlist={pl} />
            <button
              onClick={() => remove(pl.id)}
              className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white text-xs rounded-full w-7 h-7 opacity-0 group-hover:opacity-100 transition"
              aria-label="Delete playlist"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
