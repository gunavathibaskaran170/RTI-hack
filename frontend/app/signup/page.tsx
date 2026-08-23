"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { api } from "../../lib/api";
import { Scale, Lock, ShieldCheck, ArrowRight, Mail, Key, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await api.login(email.trim());
      localStorage.setItem("rightpath_user_email", email.trim());
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
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
              Create Your RightPath Account
            </h2>
            <p className="text-xs text-ink-muted">
              Start drafting official RTI applications grounded in Indian statutory law.
            </p>
          </div>

          {/* Form */}
          <form className="mt-6 space-y-5" onSubmit={handleSignup}>
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

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 bg-parchment-subtle border border-border-card rounded-lg text-ink text-sm placeholder-ink-light focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Privacy & Legal Data Disclosure */}
            <div className="p-3.5 rounded-lg bg-parchment-card border border-border-subtle text-[11px] text-ink-muted leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-ink text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                <span>Privacy & Data Protection Notice</span>
              </div>
              <p>
                RightPath collects your complaint text and case history solely to draft RTI documents and track statutory deadlines. We never sell your legal data or share it with third-party advertisers.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-saffron text-white font-bold text-sm shadow-md hover:bg-saffron-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account & Start Case</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-border-subtle text-center">
            <p className="text-xs text-ink-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-saffron font-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
