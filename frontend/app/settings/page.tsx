"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { api } from "../../lib/api";
import { useTranslation, Language } from "../../lib/i18n";
import { Settings, Globe, Bell, Shield, LogOut, Trash2, Check, Zap, Lock } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage } = useTranslation();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedDemo = localStorage.getItem("rightpath_demo_mode");
    if (savedDemo !== null) {
      setDemoMode(savedDemo === "true");
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("rightpath_demo_mode", String(demoMode));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-border-card pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">System Settings</span>
          <h1 className="serif-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
            Application Settings & Preferences
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Configure system language, deadline breach notification channels, and demo mode SLA compression.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded bg-forest-light border border-forest/30 text-forest text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Section 1: Language */}
          <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-4">
            <h3 className="serif-heading font-bold text-base text-ink flex items-center gap-2 border-b border-border-subtle pb-3">
              <Globe className="w-4 h-4 text-saffron" />
              Multilingual Preference
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Interface & Explanation Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full p-2.5 bg-parchment border border-border-card rounded text-sm text-ink font-medium focus:outline-none focus:border-saffron"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                </select>
              </div>

              <div className="text-xs text-ink-muted leading-relaxed flex items-center">
                <p>
                  RightPath translates input grievances and system explanations into your preferred language while ensuring official RTI drafts remain in English per legal filing standards.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Notifications */}
          <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-4">
            <h3 className="serif-heading font-bold text-base text-ink flex items-center gap-2 border-b border-border-subtle pb-3">
              <Bell className="w-4 h-4 text-saffron" />
              Statutory Deadline Alerts
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-ink">Section 7(1) Statutory Email Breach Notifications</h4>
                <p className="text-xs text-ink-muted">Receive alerts on Day 31 post-filing when deemed refusal occurs.</p>
              </div>

              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-saffron accent-saffron rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Demo Mode Toggle */}
          <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-4">
            <h3 className="serif-heading font-bold text-base text-ink flex items-center gap-2 border-b border-border-subtle pb-3">
              <Zap className="w-4 h-4 text-saffron" />
              Demo Mode SLA Timer Compression
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-ink">Compress 30-Day Statutory Timer to 2 Minutes</h4>
                <p className="text-xs text-ink-muted">Allows immediate testing of statutory breach alerts and Section 19(1) First Appeal generation.</p>
              </div>

              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="w-4 h-4 text-saffron accent-saffron rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded bg-saffron text-parchment font-semibold text-xs shadow hover:bg-saffron-hover transition-colors"
            >
              Save System Settings
            </button>
          </div>
        </form>

        {/* Section 4: Session Control & Danger Zone */}
        <div className="bg-parchment-card border border-crimson/30 p-6 rounded-lg space-y-4">
          <h3 className="serif-heading font-bold text-base text-crimson flex items-center gap-2 border-b border-crimson/20 pb-3">
            <Shield className="w-4 h-4 text-crimson" />
            Session Control & Data Privacy
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-ink">Active Authentication Cookie Session</h4>
              <p className="text-xs text-ink-muted">256-bit encrypted HTTP-only session cookie active.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-parchment border border-border-card text-ink text-xs font-semibold hover:border-crimson hover:text-crimson transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>

              <button
                onClick={() => alert("To delete your account data, submit a privacy request to privacy@rightpath.in.")}
                className="px-4 py-2 rounded bg-crimson-light text-crimson text-xs font-semibold border border-crimson/30 hover:bg-crimson hover:text-parchment transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Case History</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
