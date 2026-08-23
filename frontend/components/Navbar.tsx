"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation, Language } from "../lib/i18n";
import { api } from "../lib/api";
import { Scale, CheckCircle2, Globe, User, LogOut, FileText, Settings, ShieldCheck, Home, BookOpen, MapPin, Sun, Moon, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  useEffect(() => {
    api.getMe()
      .then((res) => {
        if (res.logged_in) {
          setIsLoggedIn(true);
          setUserEmail(res.email || "");
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.logout();
      setIsLoggedIn(false);
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="border-b border-border-subtle bg-parchment/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
      {/* Persistent Trust Top Bar */}
      <div className="bg-ink text-parchment py-1 px-4 text-xs font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
            <span>Official RTI Act, 2005 Statutory Framework Grounding</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-ink-light text-[11px]">
            <span>Verified Law • Zero AI Speculation</span>
            <span className="text-saffron">• Security Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-md bg-saffron text-parchment flex items-center justify-center shadow-sm group-hover:bg-saffron-hover transition-colors">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="serif-heading font-bold text-xl text-ink tracking-tight leading-tight">
              RightPath
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-saffron-light text-saffron border border-saffron/20 leading-none">
                RTI Module
              </span>
              <span className="text-[10px] text-ink-muted hidden sm:block leading-none">Legal Rights Copilot</span>
            </div>
          </div>
        </Link>

        {/* Navigation Links with Full i18n */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
          <Link 
            href="/rti/new-case" 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              pathname.includes('/new-case') ? 'bg-saffron text-parchment' : 'text-ink hover:text-saffron'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t("nav_new")}
          </Link>
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-1.5 transition-colors ${
              pathname === '/dashboard' ? 'text-saffron font-semibold' : 'text-ink hover:text-saffron'
            }`}
          >
            <Home className="w-4 h-4" />
            {t("nav_cases")}
          </Link>
          <Link 
            href="/know-your-rights" 
            className={`flex items-center gap-1.5 transition-colors ${
              pathname === '/know-your-rights' ? 'text-saffron font-semibold' : 'text-ink hover:text-saffron'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t("nav_know_rights")}
          </Link>
          <Link 
            href="/nearby-resources" 
            className={`flex items-center gap-1.5 transition-colors ${
              pathname === '/nearby-resources' ? 'text-saffron font-semibold' : 'text-ink hover:text-saffron'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {t("nav_nearby")}
          </Link>
          <Link 
            href="/about" 
            className={`flex items-center gap-1.5 transition-colors ${
              pathname === '/about' ? 'text-saffron font-semibold' : 'text-ink hover:text-saffron'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {t("nav_about")}
          </Link>
        </nav>

        {/* Right Actions: Lang + Auth + DarkMode */}
        <div className="flex items-center gap-3">
          {/* Explain My Problem persistent CTA */}
          <Link
            href="/copilot"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-saffron text-parchment font-bold text-xs shadow hover:bg-saffron-hover transition-all border border-saffron/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explain My Problem</span>
          </Link>

          {/* Language Switcher */}
          <div className="relative flex items-center gap-1 bg-parchment-card border border-border-subtle rounded-md px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-saffron" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-ink font-medium focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md bg-parchment-card border border-border-subtle text-ink hover:text-saffron transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-saffron" />
            ) : (
              <Moon className="w-4 h-4 text-ink-light" />
            )}
          </button>

          {/* User Auth Buttons */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-parchment-card border border-border-subtle flex items-center justify-center text-ink hover:border-saffron transition-colors"
                title={userEmail}
              >
                <User className="w-4 h-4 text-saffron" />
              </Link>
              <Link
                href="/settings"
                className="w-8 h-8 rounded-full bg-parchment-card border border-border-subtle flex items-center justify-center text-ink hover:border-saffron transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-ink-muted" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-ink-muted hover:text-crimson transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold px-3 py-1.5 text-ink hover:text-saffron transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-saffron text-parchment hover:bg-saffron-hover transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
