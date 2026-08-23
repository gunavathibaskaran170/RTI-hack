"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTranslation } from "../lib/i18n";
import { api } from "../lib/api";
import { 
  Scale, ShieldCheck, FileText, ArrowRight, CheckCircle2, 
  Search, FileSpreadsheet, Clock, AlertTriangle, Building2, ChevronRight, Lock, Sparkles, BookOpen
} from "lucide-react";

export default function LandingPage() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    api.getMe()
      .then((res) => setIsLoggedIn(res.logged_in))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-border-subtle bg-gradient-to-b from-parchment via-parchment-subtle to-parchment">
        <div className="absolute inset-0 bg-court-watermark pointer-events-none" />

        {/* Animated CSS Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-particle w-32 h-32" style={{ left: "10%", top: "80%", animationDuration: "12s" }} />
          <div className="floating-particle w-48 h-48" style={{ left: "70%", top: "70%", animationDelay: "2s", animationDuration: "15s" }} />
          <div className="floating-particle w-24 h-24" style={{ left: "40%", top: "90%", animationDelay: "5s", animationDuration: "9s" }} />
          <div className="floating-particle w-40 h-40" style={{ left: "85%", top: "45%", animationDelay: "1s", animationDuration: "14s" }} />
          <div className="floating-particle w-36 h-36" style={{ left: "20%", top: "30%", animationDelay: "4s", animationDuration: "11s" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-light border border-saffron/20 text-saffron text-xs font-semibold tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4 text-saffron" />
                {t("hero_trust_tag")}
              </div>

              {/* Headline */}
              <h1 className="serif-heading text-3xl sm:text-5xl font-bold text-ink leading-tight tracking-tight">
                {t("hero_headline")}
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-normal">
                {t("hero_sub")}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link
                  href={isLoggedIn ? "/rti/new-case" : "/login"}
                  className="w-full sm:w-auto px-8 py-4 rounded bg-saffron text-parchment font-semibold text-base shadow-md hover:bg-saffron-hover transition-all flex items-center justify-center gap-2 group"
                >
                  <span>{t("hero_start_cta")}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/know-your-rights"
                  className="w-full sm:w-auto px-6 py-4 rounded bg-parchment-card border border-border-card text-ink font-semibold text-base hover:border-saffron transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5 text-saffron" />
                  <span>{t("nav_know_rights")}</span>
                </Link>
              </div>

            </div>

            {/* Right Illustration: Bureaucratic Complexity Resolving to Clarity */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-parchment-card border-2 border-border-card p-6 rounded-xl shadow-lg space-y-4 relative">
                
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-crimson" />
                    <span className="w-3 h-3 rounded-full bg-saffron" />
                    <span className="w-3 h-3 rounded-full bg-forest" />
                  </div>
                  <span className="text-[10px] font-mono text-ink-muted uppercase">Statutory Engine</span>
                </div>

                {/* Input vs Output Animation Card */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded bg-parchment border border-border-subtle text-xs space-y-1">
                    <span className="text-[10px] font-mono font-bold text-ink-muted uppercase">User Plain Input</span>
                    <p className="italic text-ink">&quot;Sector 4 main road has potholes for 9 months and ward office won&apos;t reply...&quot;</p>
                  </div>

                  <div className="flex justify-center my-1">
                    <div className="w-8 h-8 rounded-full bg-saffron text-parchment flex items-center justify-center animate-bounce shadow">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded bg-forest-light border border-forest/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-forest uppercase">Grounded Legal Application</span>
                      <span className="verified-tag text-[10px] py-0 px-1.5">✓ Section 6(1)</span>
                    </div>
                    <p className="font-mono text-[11px] text-ink font-semibold">To: Public Information Officer, PWD Division</p>
                    <p className="text-[11px] text-ink-muted">Requesting road expenditure logs under RTI Act 2005 Section 7(1)...</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* VISIBLE TRUST BAR: Central Information Commission & Sourced Law */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-4 gap-4 text-left border-t border-border-subtle/80 mt-12">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-parchment-card/80 border border-border-card">
              <CheckCircle2 className="w-6 h-6 text-forest shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-ink">100% Sourced Law</h4>
                <p className="text-[11px] text-ink-muted">Verified from cic.gov.in statutory records.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-parchment-card/80 border border-border-card">
              <CheckCircle2 className="w-6 h-6 text-forest shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-ink">Confirm-First Flow</h4>
                <p className="text-[11px] text-ink-muted">Review restated facts before drafting.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-parchment-card/80 border border-border-card">
              <CheckCircle2 className="w-6 h-6 text-forest shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-ink">30-Day Statutory Timer</h4>
                <p className="text-[11px] text-ink-muted">Section 7(1) countdown & Section 19(1) appeal.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-parchment-card/80 border border-border-card">
              <CheckCircle2 className="w-6 h-6 text-forest shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-ink">Hard Refusal Guard</h4>
                <p className="text-[11px] text-ink-muted">Complex litigation routed to DLSA clinics.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* "Your Right to Justice" Section */}
      <section className="py-16 bg-gradient-to-b from-parchment to-parchment-subtle border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Animated 3D Scales of Justice Icon */}
            <div className="lg:col-span-5 flex justify-center order-last lg:order-first">
              <div className="relative w-64 h-64 bg-parchment-card border-2 border-border-card rounded-2xl shadow-xl flex items-center justify-center p-6 group hover:border-saffron/40 transition-all duration-300">
                <div className="absolute inset-0 bg-saffron/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                
                <svg
                  className="w-40 h-40 text-saffron transition-transform duration-500 group-hover:scale-105 animate-justice-sway"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17M12 20h4M12 20H8" />
                  <g className="animate-beam-sway origin-[12px_6px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12" />
                    <g className="animate-pan-left origin-[6px_6px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l-2 6h4l-2-6M4 12c0 2 2 3 2 3s2-1 2-3" />
                    </g>
                    <g className="animate-pan-right origin-[18px_6px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6l-2 6h4l-2-6M16 12c0 2 2 3 2 3s2-1 2-3" />
                    </g>
                  </g>
                </svg>

                <div className="absolute bottom-4 text-center">
                  <span className="text-xs font-mono uppercase tracking-wider text-saffron font-bold">Scales of Justice</span>
                </div>
              </div>
            </div>

            {/* Content & Stats */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">Your Right to Justice</span>
                <h2 className="serif-heading text-3xl sm:text-4xl font-bold text-ink">
                  Empowering Citizens through Sourced Law
                </h2>
                <p className="text-sm text-ink-muted leading-relaxed">
                  The Right to Information (RTI) Act, 2005 is one of the world's most powerful transparency laws, enabling ordinary citizens to hold public authorities accountable.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 bg-parchment-card border border-border-card p-6 rounded-xl">
                <div className="space-y-1">
                  <span className="text-3xl font-extrabold text-saffron block">6 Million+</span>
                  <span className="text-xs font-bold text-ink uppercase tracking-wide">RTIs Filed Annually</span>
                  <p className="text-[11px] text-ink-muted leading-tight">India has the highest rate of civic accountability requests globally.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-extrabold text-forest block">30 Days</span>
                  <span className="text-xs font-bold text-ink uppercase tracking-wide">Statutory Deadline</span>
                  <p className="text-[11px] text-ink-muted leading-tight">Under Section 7(1), public departments must respond or face legal penalties.</p>
                </div>
              </div>

              {/* Justice Timeline Visual */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">The Statutory Timeline</h4>
                <div className="relative pl-6 border-l-2 border-border-card space-y-6 text-xs text-ink-muted">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-saffron border-4 border-parchment shadow" />
                    <p className="font-bold text-ink">Day 1: File Application</p>
                    <p className="leading-tight">Drafted via RightPath and submitted to the Public Information Officer (PIO) with Rs. 10 fee.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-saffron border-4 border-parchment shadow" />
                    <p className="font-bold text-ink">Day 30: Reply Deadline</p>
                    <p className="leading-tight">The PIO must respond. Failure to respond constitutes a statutory "deemed refusal".</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-forest border-4 border-parchment shadow" />
                    <p className="font-bold text-ink">Day 60: First Appeal Resolution</p>
                    <p className="leading-tight">If unsatisfied or ignored, file First Appeal under Section 19(1). Decided within 30-45 days.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* REAL EXAMPLE WALKTHROUGH ("See It In Action") */}
      <section className="py-16 bg-parchment border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">Real Example Walkthrough</span>
            <h2 className="serif-heading text-2xl sm:text-4xl font-bold text-ink">
              See RightPath in Action
            </h2>
            <p className="text-sm text-ink-muted">
              Watch how a citizen grievance transforms into a legally binding document.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-parchment-card border-2 border-border-card p-8 rounded-xl shadow-sm">
            
            {/* Left: Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-saffron text-parchment text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="serif-heading text-lg font-bold text-ink">Citizen Plain Language Grievance</h3>
              </div>
              <div className="p-5 rounded bg-parchment border border-border-card text-xs text-ink leading-relaxed font-mono paper-texture">
                &quot;I submitted my pension application 6 months ago at the municipal corporation office in Sector 4, Bangalore. The officers refuse to update me and won&apos;t answer my questions.&quot;
              </div>
            </div>

            {/* Right: Output */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest text-parchment text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="serif-heading text-lg font-bold text-ink">Grounded Official RTI Draft</h3>
              </div>
              <div className="p-5 rounded bg-forest-light border border-forest/30 text-xs text-ink leading-relaxed font-mono">
                <p className="font-bold text-forest text-sm">To: Public Information Officer, Municipal Corporation</p>
                <p className="mt-2">Subject: Application under Section 6(1) of the RTI Act, 2005 regarding pension file status.</p>
                <p className="mt-2 text-ink-muted">1. Please provide daily progress records of Pension File #560037.</p>
                <p className="text-ink-muted">2. Names & designations of officers held accountable under Section 7(1)...</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Landmark Precedents Strip */}
      <section className="py-12 bg-parchment border-b border-border-subtle overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold block text-center">Landmark Jurisprudence</span>
          <h3 className="serif-heading text-2xl font-bold text-ink text-center mt-1">
            Landmark RTI Court Precedents
          </h3>
        </div>
        
        {/* Horizontal Marquee / Scroll Strip */}
        <div className="relative w-full overflow-hidden py-4 bg-parchment-card border-y border-border-subtle">
          <div className="flex gap-8 animate-marquee whitespace-nowrap min-w-max hover:[animation-play-state:paused]">
            
            <div className="inline-block bg-parchment p-5 rounded-lg border border-border-subtle shadow-sm max-w-sm whitespace-normal text-left shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-saffron font-bold block mb-1">Supreme Court of India</span>
              <h4 className="font-bold text-ink text-xs mb-1.5">CBSE v. Aditya Bandopadhyay (2011)</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Ruled that students have the right under RTI to inspect and obtain copies of their evaluated answer sheets, holding exam bodies accountable.
              </p>
            </div>

            <div className="inline-block bg-parchment p-5 rounded-lg border border-border-subtle shadow-sm max-w-sm whitespace-normal text-left shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-saffron font-bold block mb-1">Supreme Court of India</span>
              <h4 className="font-bold text-ink text-xs mb-1.5">Girish R. Deshpande v. CIC (2012)</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Clarified that personal details (like service records and asset declarations) are exempt under Section 8(1)(j) unless a larger public interest is proven.
              </p>
            </div>

            <div className="inline-block bg-parchment p-5 rounded-lg border border-border-subtle shadow-sm max-w-sm whitespace-normal text-left shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-saffron font-bold block mb-1">CIC Landmark Decision</span>
              <h4 className="font-bold text-ink text-xs mb-1.5">Subhash Chandra Agrawal v. Supreme Court (2019)</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Ruled that the Office of the Chief Justice of India (CJI) is a public authority and falls within the purview of the Right to Information Act.
              </p>
            </div>

            <div className="inline-block bg-parchment p-5 rounded-lg border border-border-subtle shadow-sm max-w-sm whitespace-normal text-left shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-saffron font-bold block mb-1">Delhi High Court</span>
              <h4 className="font-bold text-ink text-xs mb-1.5">Union of India v. RR Wadehra (2010)</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Affirmed that file notings are integral parts of government files and must be disclosed under Section 2(f) unless explicitly exempted.
              </p>
            </div>

            {/* Duplicate for seamless scrolling marquee */}
            <div className="inline-block bg-parchment p-5 rounded-lg border border-border-subtle shadow-sm max-w-sm whitespace-normal text-left shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-saffron font-bold block mb-1">Supreme Court of India</span>
              <h4 className="font-bold text-ink text-xs mb-1.5">CBSE v. Aditya Bandopadhyay (2011)</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Ruled that students have the right under RTI to inspect and obtain copies of their evaluated answer sheets, holding exam bodies accountable.
              </p>
            </div>

            <div className="inline-block bg-parchment p-5 rounded-lg border border-border-subtle shadow-sm max-w-sm whitespace-normal text-left shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-saffron font-bold block mb-1">Supreme Court of India</span>
              <h4 className="font-bold text-ink text-xs mb-1.5">Girish R. Deshpande v. CIC (2012)</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Clarified that personal details (like service records and asset declarations) are exempt under Section 8(1)(j) unless a larger public interest is proven.
              </p>
            </div>

            <div className="inline-block bg-parchment p-5 rounded-lg border border-border-subtle shadow-sm max-w-sm whitespace-normal text-left shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-saffron font-bold block mb-1">CIC Landmark Decision</span>
              <h4 className="font-bold text-ink text-xs mb-1.5">Subhash Chandra Agrawal v. Supreme Court (2019)</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Ruled that the Office of the Chief Justice of India (CJI) is a public authority and falls within the purview of the Right to Information Act.
              </p>
            </div>

            <div className="inline-block bg-parchment p-5 rounded-lg border border-border-subtle shadow-sm max-w-sm whitespace-normal text-left shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-saffron font-bold block mb-1">Delhi High Court</span>
              <h4 className="font-bold text-ink text-xs mb-1.5">Union of India v. RR Wadehra (2010)</h4>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Affirmed that file notings are integral parts of government files and must be disclosed under Section 2(f) unless explicitly exempted.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Emphasized Core Differentiator: 30-Day SLA Statutory Timer */}
      <section className="py-16 bg-parchment-subtle border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-4xl mx-auto bg-parchment-card border-2 border-saffron rounded-xl p-8 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded bg-saffron text-parchment text-xs font-mono font-bold uppercase tracking-wider">
                  Core Differentiator
                </span>
                <h3 className="serif-heading text-2xl font-bold text-ink mt-2">
                  Automatic Statutory 30-Day SLA Countdown Timer
                </h3>
              </div>

              <div className="flex items-center gap-2 text-saffron font-mono text-lg font-bold bg-saffron-light px-4 py-2 rounded border border-saffron/30">
                <Clock className="w-5 h-5" />
                <span>30d : 00h : 00m</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              When you mark your case as filed, RightPath starts an official statutory countdown timer based on Section 7(1) of the RTI Act. If 30 days elapse without a response, the system flags a deemed refusal and automatically drafts a Section 19(1) First Appeal document.
            </p>

            <div className="pt-2 flex justify-end">
              <Link
                href={isLoggedIn ? "/rti/new-case" : "/login"}
                className="px-6 py-3 rounded bg-saffron text-parchment font-semibold text-xs shadow hover:bg-saffron-hover transition-colors flex items-center gap-1.5"
              >
                <span>Start a Case & Track Timer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-parchment text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="serif-heading text-2xl sm:text-4xl font-bold text-ink">
            Ready to file your official RTI application?
          </h2>
          <p className="text-sm text-ink-muted">
            Free to draft and track. Grounded in the official Right to Information Act, 2005.
          </p>
          <div className="pt-2">
            <Link
              href={isLoggedIn ? "/rti/new-case" : "/login"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded bg-saffron text-parchment font-semibold text-base shadow-md hover:bg-saffron-hover transition-all"
            >
              <span>Start Your Case Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
