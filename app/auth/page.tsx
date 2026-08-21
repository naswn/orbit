"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAuth() {
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/");
      } else {
        setMessage(
          "Account created! Check your email to confirm your account."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      router.push("/");
    }

    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070812] px-6 text-white">

      {/* Background glow */}

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

      {/* Stars */}

      <div className="absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-white/70" />
      <div className="absolute left-[80%] top-[25%] h-1 w-1 rounded-full bg-white/50" />
      <div className="absolute left-[25%] top-[75%] h-1 w-1 rounded-full bg-white/50" />
      <div className="absolute left-[85%] top-[70%] h-1 w-1 rounded-full bg-white/70" />

      {/* Auth card */}

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1020]/90 p-8 shadow-2xl backdrop-blur-xl">

        {/* Logo */}

        <div className="mb-8 text-center">

          <h1 className="text-4xl font-bold tracking-tight">
            ORBIT<span className="text-violet-400">.</span>
          </h1>

          <p className="mt-2 text-sm text-white/40">
            YOUR PERSONAL UNIVERSE
          </p>

        </div>

        {/* Heading */}

        <div className="mb-6">

          <h2 className="text-2xl font-semibold">
            {isSignup
              ? "Create your universe"
              : "Welcome back"}
          </h2>

          <p className="mt-2 text-sm text-white/40">
            {isSignup
              ? "Create an account and start building your universe."
              : "Enter your details to continue to Orbit."}
          </p>

        </div>

        {/* Email */}

        <div className="mb-4">

          <label className="mb-2 block text-sm text-white/60">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-violet-400"
          />

        </div>

        {/* Password */}

        <div className="mb-5">

          <label className="mb-2 block text-sm text-white/60">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAuth();
              }
            }}
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-violet-400"
          />

        </div>

        {/* Message */}

        {message && (
          <div className="mb-4 rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-sm text-violet-200">
            {message}
          </div>
        )}

        {/* Button */}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full rounded-xl bg-violet-500 py-3 font-semibold transition hover:bg-violet-400 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Create account"
            : "Sign in"}
        </button>

        {/* Switch */}

        <div className="mt-6 text-center">

          <p className="text-sm text-white/40">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>

          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
            }}
            className="mt-1 text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            {isSignup
              ? "Sign in instead"
              : "Create an account"}
          </button>

        </div>

      </div>

    </main>
  );
}