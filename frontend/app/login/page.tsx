"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { api } from "../../lib/api";
import { Scale, Lock, ArrowRight, Mail, Key, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await api.login(email.trim());
      // Save local state indicator
      localStorage.setItem("rightpath_user_email", email.trim());
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your details.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-ink">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-court-watermark">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl border border-border-card shadow-lg">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-lg bg-saffron text-white items-center justify-center shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <h2 className="serif-heading text-2xl font-bold text-ink">
              Log in to RightPath
            </h2>
            <p className="text-xs text-ink-muted">
              Access your active RTI cases, statutory SLA timers, and drafted documents.
            </p>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3.5 rounded-lg bg-crimson-light border border-crimson/30 text-crimson text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="citizen@example.com"
                    className="block w-full pl-9 pr-3 py-2.5 bg-parchment-subtle border border-border-card rounded-lg text-ink text-sm placeholder-ink-light focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 bg-parchment-subtle border border-border-card rounded-lg text-ink text-sm placeholder-ink-light focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-saffron text-white font-bold text-sm shadow-md hover:bg-saffron-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Log In & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Helper */}
          <div className="p-3 rounded-lg bg-forest-light border border-forest/20 text-[11px] text-forest flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Instant Login / Demo Mode:</span> Enter any valid email (e.g. <code>citizen@rightpath.in</code>) with any password to sign in immediately.
            </div>
          </div>

          {/* Trust Microcopy */}
          <div className="pt-4 border-t border-border-subtle text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-forest font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Your case data is private and 256-bit encrypted</span>
            </div>

            <p className="text-xs text-ink-muted">
              New here?{" "}
              <Link href="/signup" className="text-saffron font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
