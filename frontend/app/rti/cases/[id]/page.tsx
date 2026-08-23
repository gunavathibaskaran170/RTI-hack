"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "../../../../components/Navbar";
import { Footer } from "../../../../components/Footer";
import { api } from "../../../../lib/api";
import { useTranslation } from "../../../../lib/i18n";
import { 
  FileText, Landmark, ShieldAlert, ArrowLeft, Download, 
  Check, Calendar, Clock, AlertOctagon, HelpCircle, Save, CheckCircle2, AlertTriangle, ShieldCheck
} from "lucide-react";

interface Document {
  id: string;
  type: string;
  content: string;
  generated_at: string;
}

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
  documents: Document[];
}

export default function CaseDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [draftText, setDraftText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFiling, setIsFiling] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const loadCaseDetails = useCallback(() => {
    if (!id) return;
    api.getCase(id)
      .then((res) => {
        setCaseData(res);
        const rtiDoc = res.documents.find((d: Document) => d.type === "rti_application");
        if (rtiDoc) {
          setDraftText(rtiDoc.content);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load case details.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    loadCaseDetails();
  }, [loadCaseDetails]);

  // Document downloader
  const downloadDocument = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Action: File Case
  const handleFileCase = async () => {
    setIsFiling(true);
    try {
      await api.fileCase(id);
      loadCaseDetails();
    } catch (err: any) {
      alert(err.message || "Failed to file case");
    } finally {
      setIsFiling(false);
    }
  };

  // Action: Mark Resolved
  const handleResolveCase = async () => {
    setIsResolving(true);
    try {
      await api.resolveCase(id);
      loadCaseDetails();
    } catch (err: any) {
      alert(err.message || "Failed to resolve case");
    } finally {
      setIsResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-parchment-card rounded w-1/3" />
            <div className="h-48 bg-parchment-card rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex flex-col bg-parchment">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
          <div className="bg-crimson-light border border-crimson/30 p-8 rounded-lg text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-crimson mx-auto" />
            <h2 className="serif-heading text-xl font-bold text-crimson">Case Not Found</h2>
            <p className="text-xs text-ink-muted">{error || "The requested case could not be retrieved."}</p>
            <Link href="/dashboard" className="inline-block px-4 py-2 bg-saffron text-parchment rounded text-xs font-semibold">
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const appealDoc = caseData.documents.find((d) => d.type === "first_appeal");

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-xs font-semibold text-ink-muted hover:text-saffron flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>{t("back_to_dashboard")}</span>
          </Link>

          <span className="font-mono text-xs text-ink-muted">Case ID: {caseData.id}</span>
        </div>

        {/* Case Header Card */}
        <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">
                RTI Act 2005 Statutory Tracking
              </span>
              <h1 className="serif-heading text-2xl font-bold text-ink mt-1">
                {caseData.classification || "Civic Complaint"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-saffron-light text-saffron text-xs font-mono font-bold uppercase tracking-wider border border-saffron/20">
                {caseData.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-ink-muted">
            <div>
              <span className="font-semibold text-ink">Department:</span> {caseData.department}
            </div>
            <div>
              <span className="font-semibold text-ink">Location:</span> {caseData.location}
            </div>
            <div>
              <span className="font-semibold text-ink">Created:</span> {new Date(caseData.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* STATUTORY DEADLINE BREACH / FIRST APPEAL ALERT BANNER */}
        {(caseData.status === "OVERDUE" || caseData.status === "APPEAL_READY") && (
          <div className="bg-crimson-light border-2 border-crimson p-6 rounded-lg space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-6 h-6 text-crimson shrink-0 mt-0.5" />
              <div>
                <h3 className="serif-heading font-bold text-lg text-crimson">{t("first_appeal_title")}</h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">{t("first_appeal_alert")}</p>
              </div>
            </div>

            {appealDoc && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-crimson/20">
                <span className="text-xs font-mono font-bold text-crimson">
                  Section 19(1) Deemed Refusal Appeal Generated
                </span>
                <button
                  onClick={() => downloadDocument(`Section_19_First_Appeal_${caseData.id}.txt`, appealDoc.content)}
                  className="px-5 py-2.5 rounded bg-crimson text-parchment font-semibold text-xs shadow hover:bg-crimson/90 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{t("download_appeal_cta")}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* MAIN CONTENT GRID: Timeline (Left) + Document Viewer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Timeline & Statutory Controls */}
          <div className="space-y-6">
            
            {/* Timeline Widget */}
            <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-6">
              <h3 className="serif-heading font-bold text-base text-ink flex items-center gap-2 border-b border-border-subtle pb-3">
                <Clock className="w-4 h-4 text-saffron" />
                Statutory Milestone Timeline
              </h3>

              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border-subtle">
                
                {/* Node 1: Drafted */}
                <div className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-forest text-parchment flex items-center justify-center text-xs font-bold shrink-0 z-10">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Grievance Classified & Drafted</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">{t("timeline_drafted")}</p>
                  </div>
                </div>

                {/* Node 2: Filed */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                    caseData.filed_at ? "bg-forest text-parchment" : "bg-border-subtle text-ink-muted"
                  }`}>
                    {caseData.filed_at ? "✓" : "2"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Filed with PIO</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {caseData.filed_at ? `Filed on ${new Date(caseData.filed_at).toLocaleDateString()}` : "Pending citizen filing confirmation"}
                    </p>
                  </div>
                </div>

                {/* Node 3: 30-Day Statutory Timer */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                    caseData.status === "OVERDUE" || caseData.status === "APPEAL_READY" ? "bg-crimson text-parchment" : caseData.filed_at ? "bg-saffron text-parchment" : "bg-border-subtle text-ink-muted"
                  }`}>
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">30-Day SLA Window</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">{t("timeline_overdue")}</p>
                  </div>
                </div>

                {/* Node 4: Resolved / Appeal */}
                <div className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                    caseData.status === "RESOLVED" ? "bg-forest text-parchment" : "bg-border-subtle text-ink-muted"
                  }`}>
                    {caseData.status === "RESOLVED" ? "✓" : "4"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Case Resolution</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5">{t("timeline_resolved")}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Statutory Actions Box */}
            <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-4">
              <h3 className="serif-heading font-bold text-base text-ink">Case Actions</h3>

              {caseData.status === "DRAFTED" || caseData.status === "ANALYZED" ? (
                <button
                  onClick={handleFileCase}
                  disabled={isFiling}
                  className="w-full py-3 px-4 rounded bg-saffron text-parchment font-semibold text-xs shadow hover:bg-saffron-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isFiling ? "Updating..." : t("file_cta")}</span>
                </button>
              ) : caseData.status === "FILED" ? (
                <button
                  onClick={handleResolveCase}
                  disabled={isResolving}
                  className="w-full py-3 px-4 rounded bg-forest text-parchment font-semibold text-xs shadow hover:bg-forest-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isResolving ? "Updating..." : t("mark_resolved_cta")}</span>
                </button>
              ) : (
                <div className="p-3 bg-parchment rounded border border-border-subtle text-xs text-ink-muted text-center font-mono">
                  Status: {caseData.status}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Document Viewer Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* RTI Application Document */}
            <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="serif-heading font-bold text-base text-ink flex items-center gap-2">
                  <FileText className="w-4 h-4 text-saffron" />
                  Official RTI Application Document
                </h3>
                <button
                  onClick={() => downloadDocument(`RTI_Application_${caseData.id}.txt`, draftText)}
                  className="px-3 py-1.5 rounded bg-saffron text-parchment text-xs font-semibold hover:bg-saffron-hover transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t("download_rti_cta")}</span>
                </button>
              </div>

              <div className="bg-parchment p-6 rounded border border-border-subtle font-mono text-xs text-ink leading-relaxed whitespace-pre-wrap paper-texture max-h-[500px] overflow-y-auto">
                {draftText || "Document drafting pending..."}
              </div>
            </div>

            {/* Generated First Appeal Document if Overdue */}
            {appealDoc && (
              <div className="bg-parchment-card border border-crimson/40 p-6 rounded-lg space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-crimson/20 pb-3">
                  <h3 className="serif-heading font-bold text-base text-crimson flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Section 19(1) First Appeal Document
                  </h3>
                  <button
                    onClick={() => downloadDocument(`Section_19_First_Appeal_${caseData.id}.txt`, appealDoc.content)}
                    className="px-3 py-1.5 rounded bg-crimson text-parchment text-xs font-semibold hover:bg-crimson/90 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download First Appeal</span>
                  </button>
                </div>

                <div className="bg-parchment p-6 rounded border border-crimson/20 font-mono text-xs text-ink leading-relaxed whitespace-pre-wrap paper-texture max-h-[400px] overflow-y-auto">
                  {appealDoc.content}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
