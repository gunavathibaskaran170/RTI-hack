"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useTranslation } from "../../lib/i18n";
import { 
  BookOpen, Scale, ShieldCheck, ChevronDown, ChevronUp, HelpCircle, 
  CheckCircle2, AlertTriangle, ArrowRight, FileText, Clock, Sparkles
} from "lucide-react";

export default function KnowYourRightsPage() {
  const { t } = useTranslation();

  // Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Quiz State
  const [quizAnswer1, setQuizAnswer1] = useState<string | null>(null);
  const [quizAnswer2, setQuizAnswer2] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"RTI_ELIGIBLE" | "NEEDS_LAWYER" | "CONSUMER_DISPUTE" | null>(null);

  const handleQuizSubmit = (a1: string, a2: string) => {
    if (a1 === "court" || a1 === "private") {
      setQuizResult("NEEDS_LAWYER");
    } else if (a1 === "product") {
      setQuizResult("CONSUMER_DISPUTE");
    } else {
      setQuizResult("RTI_ELIGIBLE");
    }
  };

  const faqs = [
    {
      q: "What is the Right to Information (RTI) Act, 2005?",
      a: "The RTI Act is an official law passed by the Parliament of India that empowers every citizen to ask questions, request copies of official government documents, inspect public works, and obtain expenditure records held by public authorities."
    },
    {
      q: "What information CAN I request under RTI?",
      a: "You can request public project budgets, road repair expenditure logs, municipal ward records, reasons for delayed government services (like passports, pensions, or ration cards), tender documents, and attendance logs of government staff."
    },
    {
      q: "What information CANNOT be requested (Section 8 Exemptions)?",
      a: "Under Section 8 of the RTI Act, public authorities are exempt from disclosing information affecting national security, cabinet papers before a decision is finalized, trade secrets, personal private data with no public interest, or matters actively undergoing private civil/criminal litigation in court."
    },
    {
      q: "How long does the government have to respond?",
      a: "Under Section 7(1), the Public Information Officer (PIO) has a statutory limit of exactly 30 days from receipt of your application to provide the requested information. If life or liberty is involved, the response limit is 48 hours."
    },
    {
      q: "What happens if 30 days pass with no response?",
      a: "If the PIO fails to respond within 30 days, it constitutes a 'deemed refusal' under Section 7(2). RightPath automatically alerts you and drafts a Section 19(1) First Appeal to the Appellate Authority at no cost."
    },
    {
      q: "What is a First Appeal and Second Appeal?",
      a: "A First Appeal is filed under Section 19(1) with a senior officer in the same department if the PIO fails to respond or provides incomplete data. If the First Appeal fails, a Second Appeal can be preferred before the Central or State Information Commission under Section 19(3)."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-light border border-saffron/20 text-saffron text-xs font-bold uppercase tracking-wide">
            <BookOpen className="w-4 h-4" />
            Citizen Legal Education Hub
          </div>

          <h1 className="serif-heading text-3xl sm:text-5xl font-bold text-ink leading-tight">
            {t("kyr_title")}
          </h1>

          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            {t("kyr_subtitle")} Understand what you can ask for, statutory timeframes, and how to hold public authorities accountable.
          </p>
        </div>

        {/* INTERACTIVE QUIZ TOOL: Is RTI Right for My Problem? */}
        <div className="bg-parchment-card border-2 border-saffron/30 p-8 rounded-lg space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
            <div className="w-10 h-10 rounded bg-saffron text-parchment flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="serif-heading text-xl font-bold text-ink">{t("kyr_quiz_title")}</h2>
              <p className="text-xs text-ink-muted">Answer 2 simple questions to check if RTI applies to your issue.</p>
            </div>
          </div>

          {/* Question 1 */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink">
              1. Who is your grievance or dispute against?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => { setQuizAnswer1("gov"); handleQuizSubmit("gov", quizAnswer2 || ""); }}
                className={`p-3 rounded border text-left font-medium transition-all ${
                  quizAnswer1 === "gov" ? "bg-saffron text-parchment border-saffron" : "bg-parchment border-border-card text-ink hover:border-saffron"
                }`}
              >
                Government Office / Municipal Board / Electricity Board
              </button>
              <button
                type="button"
                onClick={() => { setQuizAnswer1("private"); handleQuizSubmit("private", quizAnswer2 || ""); }}
                className={`p-3 rounded border text-left font-medium transition-all ${
                  quizAnswer1 === "private" ? "bg-saffron text-parchment border-saffron" : "bg-parchment border-border-card text-ink hover:border-saffron"
                }`}
              >
                Private Neighbor / Property Boundary Dispute
              </button>
              <button
                type="button"
                onClick={() => { setQuizAnswer1("product"); handleQuizSubmit("product", quizAnswer2 || ""); }}
                className={`p-3 rounded border text-left font-medium transition-all ${
                  quizAnswer1 === "product" ? "bg-saffron text-parchment border-saffron" : "bg-parchment border-border-card text-ink hover:border-saffron"
                }`}
              >
                Defective Private Product / E-commerce Service
              </button>
            </div>
          </div>

          {/* Quiz Result Output */}
          {quizResult && (
            <div className="pt-4 border-t border-border-subtle">
              {quizResult === "RTI_ELIGIBLE" && (
                <div className="p-4 rounded bg-forest-light border border-forest/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-forest shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-forest text-sm">Yes! Your issue is eligible under RTI Act 2005.</p>
                      <p className="text-ink-muted">You can request official records, expenditure details, or status reports.</p>
                    </div>
                  </div>
                  <Link
                    href="/rti/new-case"
                    className="px-5 py-2.5 rounded bg-forest text-parchment font-semibold text-xs shrink-0 flex items-center gap-1.5 hover:bg-forest-hover"
                  >
                    <span>Start Your RTI Case Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {quizResult === "NEEDS_LAWYER" && (
                <div className="p-4 rounded bg-crimson-light border border-crimson/30 space-y-2 text-xs text-crimson">
                  <p className="font-bold text-sm">RTI Does Not Apply — Legal Advocate Required</p>
                  <p className="text-ink-muted">Private neighbor disputes and active court litigations cannot be resolved via RTI. Please consult a legal practitioner or District Legal Services Authority (DLSA).</p>
                </div>
              )}

              {quizResult === "CONSUMER_DISPUTE" && (
                <div className="p-4 rounded bg-saffron-light border border-saffron/30 space-y-2 text-xs text-saffron">
                  <p className="font-bold text-sm">Consumer Protection Dispute (CPA 2019)</p>
                  <p className="text-ink-muted">RTI applies to government authorities. Defective private products or service deficiencies fall under the Consumer Protection Act, 2019.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* EXPANDABLE FAQ ACCORDIONS */}
        <div className="space-y-4">
          <h2 className="serif-heading text-2xl font-bold text-ink">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-parchment-card border border-border-card rounded-lg overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-ink hover:text-saffron transition-colors"
                >
                  <span className="serif-heading text-base">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-saffron shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-ink-muted leading-relaxed border-t border-border-subtle pt-4 bg-parchment/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-parchment-card border border-border-card p-8 rounded-lg text-center space-y-4 shadow-sm">
          <h2 className="serif-heading text-2xl font-bold text-ink">Ready to exercise your Right to Information?</h2>
          <p className="text-xs text-ink-muted">Our guided 5-step wizard will draft your official application in minutes.</p>
          <Link
            href="/rti/new-case"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded bg-saffron text-parchment font-semibold text-sm shadow hover:bg-saffron-hover transition-colors"
          >
            <span>Start Your RTI Case</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
