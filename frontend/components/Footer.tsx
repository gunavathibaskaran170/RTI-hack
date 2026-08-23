"use client";

import React from "react";
import Link from "next/link";
import { Scale, ShieldCheck, Lock, BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ink text-parchment pt-12 pb-8 border-t-4 border-saffron mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-ink-muted/30">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-saffron text-parchment flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <span className="serif-heading font-bold text-lg tracking-tight">RightPath</span>
            </div>
            <p className="text-xs text-ink-light leading-relaxed">
              Empowering citizens with institutional statutory authority. Draft, file, and track official legal grievances grounded on the RTI Act 2005.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-forest font-semibold pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded in Official Law</span>
            </div>
          </div>

          {/* Col 2: Modules & Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-saffron mb-3">Rights Modules</h4>
            <ul className="space-y-2 text-xs text-ink-light">
              <li className="flex items-center gap-1.5 font-medium text-parchment">
                <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
                Right to Information (RTI Act 2005)
              </li>
              <li className="flex items-center gap-1.5 text-ink-light/60">
                <span className="w-1.5 h-1.5 rounded-full bg-saffron/40"></span>
                Consumer Protection (Coming Soon)
              </li>
              <li className="flex items-center gap-1.5 text-ink-light/60">
                <span className="w-1.5 h-1.5 rounded-full bg-saffron/40"></span>
                Tenant & Land Rights (Coming Soon)
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust Framework */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-saffron mb-3">Institutional Trust</h4>
            <ul className="space-y-2 text-xs text-ink-light">
              <li>
                <Link href="/about" className="hover:text-saffron transition-colors flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  RAG Grounding Verification
                </Link>
              </li>
              <li>
                <Link href="/about#confidence-tiers" className="hover:text-saffron transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Confidence Tiers & Legal Limits
                </Link>
              </li>
              <li className="flex items-center gap-1 text-ink-light">
                <Lock className="w-3 h-3 text-saffron" />
                256-Bit Encrypted Data Storage
              </li>
            </ul>
          </div>

          {/* Col 4: Statutory Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-saffron mb-3">Legal Disclaimer</h4>
            <p className="text-[11px] text-ink-light leading-relaxed bg-parchment/5 p-3 rounded border border-parchment/10">
              RightPath is an AI legal copilot grounding document drafts on official statutory acts. It does not provide formal court advocacy. Complex disputes flagged as <span className="text-crimson font-medium">Needs Lawyer</span> are directed to official legal aid clinics.
            </p>
          </div>

        </div>

        {/* Hackathon Legal Notice & Trust/Sources Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 my-6 border-y border-ink-muted/20 text-xs text-ink-light leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-saffron flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Hackathon Legal Notice & Disclaimer
            </h4>
            <p className="text-[11px] text-ink-light/80">
              Information provided by this copilot is for guidance and educational purposes. Verify details with the relevant public authority or a qualified professional before submitting formal petitions.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-forest flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Verified Tier 1 Official Sources
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
              <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-saffron hover:underline">RTI Act Portal (Gov of India)</a>
              <a href="https://cic.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-saffron hover:underline">Central Information Commission</a>
              <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-saffron hover:underline">Consumer Affairs Helpline</a>
              <a href="https://dopt.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-saffron hover:underline">Department of Personnel and Training</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink-light gap-4">
          <p>© 2026 RightPath Legal Rights System. Built for Civic Empowerment.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-saffron">About</Link>
            <Link href="/settings" className="hover:text-saffron">Settings</Link>
            <Link href="/profile" className="hover:text-saffron">Profile</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
