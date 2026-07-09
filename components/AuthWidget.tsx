"use client";

import { useEffect, useState } from "react";
import { api, getToken, setToken, AuthUser } from "@/src/api";

export default function AuthWidget() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getToken()) {
      api
        .me()
        .then((r) => setUser(r.user))
        .catch(() => setToken(null));
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res =
        mode === "login"
          ? await api.login(email, password)
          : await api.signup(email, password);
      setToken(res.token);
      setUser(res.user);
      setOpen(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-white text-sm hidden sm:inline">
          {user.display_name}
        </span>
        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full px-4 py-2"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setMode("signup");
            setOpen(true);
          }}
          className="text-spotify-subdued hover:text-white text-sm font-bold px-3"
        >
          Sign up
        </button>
        <button
          onClick={() => {
            setMode("login");
            setOpen(true);
          }}
          className="bg-white text-black text-sm font-bold rounded-full px-6 py-2 hover:scale-105 transition"
        >
          Log in
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 bg-spotify-elevated rounded-lg shadow-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold capitalize">{mode}</span>
            <button
              onClick={() => setOpen(false)}
              className="text-spotify-subdued hover:text-white"
            >
              ✕
            </button>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-2">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-spotify-green"
            />
            <input
              type="password"
              required
              minLength={4}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:border-spotify-green"
            />
            {error && <div className="text-red-400 text-xs">{error}</div>}
            <button
              type="submit"
              disabled={busy}
              className="bg-spotify-green hover:bg-spotify-greenHover text-black font-bold rounded-full py-2 mt-1 disabled:opacity-50"
            >
              {busy ? "..." : mode === "login" ? "Log in" : "Sign up"}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-spotify-subdued hover:text-white text-xs mt-1"
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Have an account? Log in"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
