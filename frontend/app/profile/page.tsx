"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { api } from "../../lib/api";
import { useTranslation, Language } from "../../lib/i18n";
import { User, Mail, MapPin, Globe, Scale, ShieldCheck, Check, Save } from "lucide-react";

export default function ProfilePage() {
  const { language, setLanguage } = useTranslation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("Civic Applicant");
  const [pinCode, setPinCode] = useState("560037");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Load local stored preferences
    const savedPin = localStorage.getItem("rightpath_pin") || "560037";
    const savedName = localStorage.getItem("rightpath_name") || "Civic Applicant";
    setPinCode(savedPin);
    setName(savedName);

    api.getMe().then((res) => {
      if (res.logged_in) {
        setEmail(res.email);
      }
    });
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("rightpath_pin", pinCode);
    localStorage.setItem("rightpath_name", name);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-border-card pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">Account Profile</span>
          <h1 className="serif-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
            Citizen Profile & Default Jurisdiction
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Manage your default location, PIN code, and language preferences for faster RTI jurisdiction resolution.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded bg-forest-light border border-forest/30 text-forest text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-parchment-card border border-border-card p-6 rounded-lg shadow-sm space-y-6">
          
          <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
            <div className="w-16 h-16 rounded-full bg-saffron text-parchment flex items-center justify-center text-2xl font-bold">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="serif-heading text-xl font-bold text-ink">{name}</h2>
              <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {email || "Registered Citizen"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Full Name / Applicant Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-parchment border border-border-card rounded text-sm text-ink font-medium focus:outline-none focus:border-saffron"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Email Address (Encrypted Session)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full p-2.5 bg-parchment-card/80 border border-border-subtle rounded text-sm text-ink-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Default PIN Code / City Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-saffron">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="e.g. 560037, Bangalore"
                    className="w-full pl-9 pr-3 py-2.5 bg-parchment border border-border-card rounded text-sm text-ink font-medium focus:outline-none focus:border-saffron"
                  />
                </div>
                <p className="text-[11px] text-ink-muted mt-1">
                  Used by JurisdictionResolver to auto-map Public Information Officers (PIOs) on new complaints.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1">
                  Primary Interface Language
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
                <p className="text-[11px] text-ink-muted mt-1">
                  Explanations and UI guidance translate automatically. Draft applications remain in English for official filing.
                </p>
              </div>

            </div>

            <div className="pt-4 border-t border-border-subtle flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded bg-saffron text-parchment font-semibold text-xs shadow hover:bg-saffron-hover transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Preferences</span>
              </button>
            </div>
          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
}
