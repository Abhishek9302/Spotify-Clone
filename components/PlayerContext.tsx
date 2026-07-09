"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { Song } from "@/src/api";

interface PlayerState {
  queue: Song[];
  currentIndex: number;
  current: Song | null;
  isPlaying: boolean;
  progress: number; // 0..1
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song, queue?: Song[]) => void;
  playQueue: (queue: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (fraction: number) => void;
  setVolume: (v: number) => void;
}

const PlayerCtx = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const current = currentIndex >= 0 ? queue[currentIndex] ?? null : null;

  // Ensure the audio element exists (client only).
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    const audio = audioRef.current;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onEnded = () => nextRef.current();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAndPlay = useCallback((song: Song | null) => {
    const audio = audioRef.current;
    if (!audio || !song) return;
    audio.src = song.audio_url;
    audio.play().catch(() => {
      /* autoplay may be blocked; user can hit play */
    });
  }, []);

  const playQueue = useCallback(
    (newQueue: Song[], startIndex = 0) => {
      setQueue(newQueue);
      setCurrentIndex(startIndex);
      loadAndPlay(newQueue[startIndex] ?? null);
    },
    [loadAndPlay]
  );

  const playSong = useCallback(
    (song: Song, songQueue?: Song[]) => {
      const q = songQueue && songQueue.length ? songQueue : [song];
      const idx = Math.max(
        0,
        q.findIndex((s) => s.id === song.id)
      );
      playQueue(q, idx);
    },
    [playQueue]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [current]);

  const next = useCallback(() => {
    setCurrentIndex((idx) => {
      if (queue.length === 0) return idx;
      const nextIdx = (idx + 1) % queue.length;
      loadAndPlay(queue[nextIdx]);
      return nextIdx;
    });
  }, [queue, loadAndPlay]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setCurrentIndex((idx) => {
      if (queue.length === 0) return idx;
      const prevIdx = (idx - 1 + queue.length) % queue.length;
      loadAndPlay(queue[prevIdx]);
      return prevIdx;
    });
  }, [queue, loadAndPlay]);

  // Keep a live ref to next() for the audio "ended" listener.
  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const seek = useCallback((fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = fraction * audio.duration;
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const value: PlayerState = {
    queue,
    currentIndex,
    current,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    playSong,
    playQueue,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
  };

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
