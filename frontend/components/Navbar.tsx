"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation, Language } from "../lib/i18n";
import { api } from "../lib/api";
import {
  Scale, CheckCircle2, Globe, User, LogOut, FileText,
  Settings, ShieldCheck, Home, BookOpen, MapPin, Sun, Moon,
  Sparkles, Menu, X
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

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
        if (res.logged_in) { setIsLoggedIn(true); setUserEmail(res.email || ""); }
        else setIsLoggedIn(false);
      })
      .catch(() => setIsLoggedIn(false));
  }, [pathname]);

  const handleLogout = async () => {
    try { await api.logout(); setIsLoggedIn(false); router.push("/login"); }
    catch (e) { console.error(e); }
  };

  const navLinks = [
    { href: "/rti/new-case", label: t("nav_new"), icon: FileText, match: (p: string) => p.includes("/new-case") },
    { href: "/dashboard", label: t("nav_cases"), icon: Home, match: (p: string) => p === "/dashboard" },
    { href: "/know-your-rights", label: t("nav_know_rights"), icon: BookOpen, match: (p: string) => p === "/know-your-rights" },
    { href: "/nearby-resources", label: t("nav_nearby"), icon: MapPin, match: (p: string) => p === "/nearby-resources" },
    { href: "/about", label: t("nav_about"), icon: ShieldCheck, match: (p: string) => p === "/about" },
  ];

  return (
    <header className="border-b border-border-subtle bg-parchment/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
      {/* Trust Top Bar */}
      <div className="bg-ink text-parchment py-1 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
            <span className="truncate">Official RTI Act, 2005 Statutory Framework Grounding</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-ink-light text-[11px] flex-shrink-0">
            <span>Verified Law • Zero AI Speculation</span>
            <span className="text-saffron">• Security Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-saffron text-parchment flex items-center justify-center shadow-sm group-hover:bg-saffron-hover transition-colors">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="serif-heading font-bold text-lg sm:text-xl text-ink tracking-tight leading-tight">RightPath</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-saffron-light text-saffron border border-saffron/20 leading-none">RTI</span>
              <span className="text-[10px] text-ink-muted hidden sm:block leading-none">Legal Rights Copilot</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navLinks.map(({ href, label, icon: Icon, match }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${match(pathname) ? "text-saffron font-semibold" : "text-ink hover:text-saffron"}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Explain My Problem CTA — hidden on very small screens */}
          <Link href="/copilot"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-saffron text-parchment font-bold text-xs shadow hover:bg-saffron-hover transition-all border border-saffron/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Explain My Problem</span>
            <span className="md:hidden">Copilot</span>
          </Link>

          {/* Language Switcher — icon only on mobile */}
          <div className="relative flex items-center gap-1 bg-parchment-card border border-border-subtle rounded-md px-1.5 sm:px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-saffron flex-shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-ink font-medium focus:outline-none cursor-pointer max-w-[60px] sm:max-w-none text-xs">
              <option value="en">EN</option>
              <option value="hi">हि</option>
              <option value="ta">த</option>
              <option value="te">తె</option>
              <option value="ml">മ</option>
            </select>
          </div>

          {/* Dark Mode Toggle */}
          <button onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-md bg-parchment-card border border-border-subtle text-ink hover:text-saffron transition-colors"
            title="Toggle Dark Mode">
            {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-saffron" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ink-light" />}
          </button>

          {/* Auth Buttons — desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/profile" className="w-8 h-8 rounded-full bg-parchment-card border border-border-subtle flex items-center justify-center hover:border-saffron transition-colors" title={userEmail}>
                  <User className="w-4 h-4 text-saffron" />
                </Link>
                <button onClick={handleLogout} className="p-1.5 text-ink-muted hover:text-crimson transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-xs font-semibold px-3 py-1.5 text-ink hover:text-saffron transition-colors">Log In</Link>
                <Link href="/signup" className="text-xs font-semibold px-3 py-1.5 rounded-md bg-saffron text-parchment hover:bg-saffron-hover transition-colors shadow-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded-md bg-parchment-card border border-border-subtle text-ink hover:text-saffron transition-colors"
            aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border-subtle bg-parchment shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {/* Copilot CTA */}
            <Link href="/copilot"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-saffron text-parchment font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" />Explain My Problem — AI Copilot
            </Link>

            {navLinks.map(({ href, label, icon: Icon, match }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${match(pathname) ? "bg-saffron-light text-saffron" : "text-ink hover:bg-parchment-subtle"}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
              </Link>
            ))}

            {/* Auth section in mobile menu */}
            <div className="border-t border-border-subtle mt-2 pt-2 flex flex-col gap-1">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-parchment-subtle">
                    <User className="w-4 h-4 text-saffron" />{userEmail || "My Profile"}
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-parchment-subtle">
                    <Settings className="w-4 h-4 text-ink-muted" />Settings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-crimson hover:bg-crimson-light w-full text-left">
                    <LogOut className="w-4 h-4" />Log Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-3 py-2">
                  <Link href="/login" className="flex-1 text-center py-2 rounded-lg border border-border-card text-sm font-semibold text-ink hover:border-saffron transition-colors">Log In</Link>
                  <Link href="/signup" className="flex-1 text-center py-2 rounded-lg bg-saffron text-parchment text-sm font-semibold hover:bg-saffron-hover transition-colors">Sign Up</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
