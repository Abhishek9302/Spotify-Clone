// API client for the Spotify Clone backend.
// Base URL comes from NEXT_PUBLIC_API_URL (injected by the deploy pipeline).

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration_seconds: number;
  cover_url: string;
  audio_url: string;
  genre: string;
  position?: number;
}

export interface Playlist {
  id: number;
  name: string;
  description: string;
  cover_url: string;
  created_at: string;
  song_count?: number;
  tracks?: Song[];
}

export interface Artist {
  id: number;
  name: string;
  bio: string;
  image_url: string;
  song_count?: number;
  songs?: Song[];
}

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
}

const TOKEN_KEY = "abh7_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  // Songs
  listSongs: (limit = 50, offset = 0) =>
    request<{ data: Song[]; pagination: { total: number } }>(
      `/api/songs?limit=${limit}&offset=${offset}`
    ),
  searchSongs: (q: string) =>
    request<{ data: Song[] }>(`/api/songs/search?q=${encodeURIComponent(q)}`),
  getSong: (id: number) => request<{ data: Song }>(`/api/songs/${id}`),

  // Playlists
  listPlaylists: () => request<{ data: Playlist[] }>("/api/playlists"),
  getPlaylist: (id: number) => request<{ data: Playlist }>(`/api/playlists/${id}`),
  createPlaylist: (payload: { name: string; description?: string }) =>
    request<{ data: Playlist }>("/api/playlists", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addSongToPlaylist: (playlistId: number, songId: number) =>
    request<{ data: unknown }>(`/api/playlists/${playlistId}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    }),
  removeSongFromPlaylist: (playlistId: number, songId: number) =>
    request<{ ok: boolean }>(`/api/playlists/${playlistId}/songs/${songId}`, {
      method: "DELETE",
    }),
  deletePlaylist: (id: number) =>
    request<{ ok: boolean }>(`/api/playlists/${id}`, { method: "DELETE" }),

  // Artists
  listArtists: () => request<{ data: Artist[] }>("/api/artists"),
  getArtist: (id: number) => request<{ data: Artist }>(`/api/artists/${id}`),

  // Auth
  signup: (email: string, password: string, displayName?: string) =>
    request<{ token: string; user: AuthUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: AuthUser }>("/auth/me"),
};

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
