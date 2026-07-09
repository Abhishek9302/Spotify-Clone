"use client";

import { usePlayer } from "./PlayerContext";
import { formatDuration } from "@/src/api";

export default function PlayerBar() {
  const {
    current,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
  } = usePlayer();

  return (
    <footer className="h-20 bg-spotify-black border-t border-white/10 px-4 flex items-center gap-4">
      {/* Now playing */}
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        {current ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.cover_url}
              alt={current.title}
              className="w-14 h-14 rounded object-cover"
            />
            <div className="min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {current.title}
              </div>
              <div className="text-spotify-subdued text-xs truncate">
                {current.artist}
              </div>
            </div>
          </>
        ) : (
          <div className="text-spotify-subdued text-sm">Nothing playing</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-6">
          <button
            onClick={prev}
            className="text-spotify-subdued hover:text-white text-lg"
            aria-label="Previous"
          >
            ⏮
          </button>
          <button
            onClick={togglePlay}
            disabled={!current}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            onClick={next}
            className="text-spotify-subdued hover:text-white text-lg"
            aria-label="Next"
          >
            ⏭
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-xl">
          <span className="text-[11px] text-spotify-subdued w-10 text-right">
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            onChange={(e) => seek(Number(e.target.value) / 1000)}
            className="flex-1 accent-spotify-green h-1 cursor-pointer"
            aria-label="Seek"
          />
          <span className="text-[11px] text-spotify-subdued w-10">
            {formatDuration(duration || 0)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="w-1/4 flex items-center justify-end gap-2">
        <span className="text-spotify-subdued">🔊</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className="w-24 accent-spotify-green h-1 cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </footer>
  );
}
