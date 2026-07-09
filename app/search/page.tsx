"use client";

import { useEffect, useState } from "react";
import { api, Song } from "@/src/api";
import SongList from "@/components/SongList";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .searchSongs(q)
        .then((r) => {
          setResults(r.data);
          setSearched(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div className="pt-4">
      <div className="sticky top-0 z-10 pb-4">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full max-w-md bg-white text-black rounded-full px-5 py-3 outline-none font-medium"
        />
      </div>

      {loading && <div className="text-spotify-subdued">Searching…</div>}

      {!loading && searched && (
        <>
          <h2 className="text-xl font-bold text-white mb-4">
            Results for “{q}”
          </h2>
          <SongList songs={results} />
        </>
      )}

      {!loading && !searched && (
        <div className="text-spotify-subdued">
          Start typing to search songs, artists, and albums.
        </div>
      )}
    </div>
  );
}
