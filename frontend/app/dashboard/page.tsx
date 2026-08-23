"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { api } from "../../lib/api";
import { useTranslation } from "../../lib/i18n";
import { 
  FileText, Clock, AlertTriangle, CheckCircle2, Scale, Plus, 
  ArrowRight, ShieldAlert, Check, Calendar, ChevronRight
} from "lucide-react";

interface Case {
  id: string;
  user_id: string;
  raw_complaint: string;
  classification: string;
  confidence_tier: string;
  department: string;
  location: string;
  status: "ANALYZED" | "DRAFTED" | "FILED" | "OVERDUE" | "APPEAL_READY" | "RESOLVED";
  filed_at?: string;
  deadline_at?: string;
  created_at: string;
}

// Live Countdown Timer
const CaseCountdown: React.FC<{ deadlineAt?: string }> = ({ deadlineAt }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!deadlineAt) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(deadlineAt).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("0s (Overdue)");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineAt]);

  return (
    <div className="flex items-center gap-1 text-xs font-mono font-bold text-saffron bg-saffron-light px-2.5 py-1 rounded border border-saffron/20">
      <Clock className="w-3.5 h-3.5" />
      <span>{timeLeft}</span>
    </div>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getCases()
      .then((res) => {
        setCases(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load active cases.");
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: Case["status"], confidenceTier: string) => {
    if (confidenceTier === "needs_lawyer") {
      return (
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border border-crimson/30 text-crimson bg-crimson-light rounded">
          Needs Lawyer
        </span>
      );
    }

    switch (status) {
      case "ANALYZED":
        return (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 border border-saffron/30 text-saffron bg-saffron-light rounded">
            Understood (Pending Confirmation)
          </span>
        );
      case "DRAFTED":
        return (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 border border-border-card text-ink bg-parchment-card rounded">
            {t("status_drafted")}
          </span>
        );
      case "FILED":
        return (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 border border-forest/30 text-forest bg-forest-light rounded">
            {t("status_filed")}
          </span>
        );
      case "OVERDUE":
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border border-crimson text-crimson bg-crimson-light rounded">
            {t("status_overdue")}
          </span>
        );
      case "APPEAL_READY":
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-crimson text-parchment rounded shadow-sm">
            {t("status_appeal")}
          </span>
        );
      case "RESOLVED":
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-forest text-parchment rounded shadow-sm">
            {t("status_resolved")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-card pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">Institutional Dashboard</span>
            <h1 className="serif-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
              Active Legal Grievances
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Track statutory 30-day deadlines, review RTI drafts, and trigger Section 19(1) First Appeals.
            </p>
          </div>

          <Link
            href="/rti/new-case"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-saffron text-parchment font-semibold text-sm shadow-sm hover:bg-saffron-hover transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Describe a New Problem</span>
          </Link>
        </div>

        {/* Summary Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-parchment-card border border-border-card">
            <span className="text-xs text-ink-muted font-medium">Total Cases</span>
            <div className="serif-heading text-2xl font-bold text-ink mt-1">{cases.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-parchment-card border border-border-card">
            <span className="text-xs text-ink-muted font-medium">Active Timers</span>
            <div className="serif-heading text-2xl font-bold text-saffron mt-1">
              {cases.filter((c) => c.status === "FILED").length}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-parchment-card border border-border-card">
            <span className="text-xs text-ink-muted font-medium">Appeals Ready</span>
            <div className="serif-heading text-2xl font-bold text-crimson mt-1">
              {cases.filter((c) => c.status === "OVERDUE" || c.status === "APPEAL_READY").length}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-parchment-card border border-border-card">
            <span className="text-xs text-ink-muted font-medium">Resolved</span>
            <div className="serif-heading text-2xl font-bold text-forest mt-1">
              {cases.filter((c) => c.status === "RESOLVED").length}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-parchment-card border border-border-card rounded-lg p-6 animate-pulse space-y-4">
                <div className="h-4 bg-border-subtle rounded w-1/3" />
                <div className="h-5 bg-border-subtle rounded w-3/4" />
                <div className="h-4 bg-border-subtle rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-crimson-light border border-crimson/30 p-6 rounded-lg text-center text-crimson text-sm">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : cases.length === 0 ? (
          /* Empty Case List State */
          <div className="bg-parchment-card border border-border-card p-12 rounded-lg text-center space-y-6 max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-saffron-light text-saffron flex items-center justify-center mx-auto">
              <Scale className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="serif-heading text-xl font-bold text-ink">No legal grievances logged yet</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Describe a civic issue (e.g. potholes, delayed municipal responses, uncollected waste). RightPath will analyze it, ground it on the RTI Act 2005, and track your statutory countdown.
              </p>
            </div>
            <Link
              href="/rti/new-case"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-saffron text-parchment font-semibold text-sm shadow-sm hover:bg-saffron-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Describe a New Problem</span>
            </Link>
          </div>
        ) : (
          /* Active Case Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/rti/cases/${c.id}`)}
                className="bg-parchment-card border border-border-card p-6 rounded-lg shadow-sm hover:border-saffron transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-ink-muted">
                      {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {getStatusBadge(c.status, c.confidence_tier)}
                  </div>

                  <h3 className="serif-heading text-lg font-bold text-ink group-hover:text-saffron transition-colors line-clamp-2">
                    {c.classification || "Civic Complaint"}
                  </h3>

                  <div className="text-xs text-ink-muted space-y-1">
                    <p><span className="font-semibold text-ink">Department:</span> {c.department}</p>
                    <p><span className="font-semibold text-ink">Location:</span> {c.location}</p>
                  </div>
                </div>

                <div className="border-t border-border-subtle pt-4 flex justify-between items-center text-xs">
                  {c.status === "FILED" && c.deadline_at ? (
                    <CaseCountdown deadlineAt={c.deadline_at} />
                  ) : (
                    <span className="text-[11px] font-mono text-forest flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>RTI Grounded</span>
                    </span>
                  )}

                  <span className="font-semibold text-saffron flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Case</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
