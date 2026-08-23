"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { Footer } from "../../../components/Footer";
import { api } from "../../../lib/api";
import { useTranslation } from "../../../lib/i18n";
import { 
  Scale, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Edit3, 
  FileText, Landmark, Download, Lock, RefreshCw, Check, Info, HelpCircle, 
  Mic, Clock, AlertOctagon, Building2, FileSpreadsheet, Sparkles, ChevronDown, ShieldAlert
} from "lucide-react";

export default function NewRtiCasePage() {
  const { language, t } = useTranslation();
  const router = useRouter();

  // 5-Step Wizard State
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Category Selection
  const [selectedCategory, setSelectedCategory] = useState<string>("works");

  // Step 2: Guided Form Inputs
  const [grievanceDetails, setGrievanceDetails] = useState("");
  const [dateOccurred, setDateOccurred] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("Public Works Department");
  const [locationPin, setLocationPin] = useState("560037, Bangalore");
  const [isListening, setIsListening] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");

  // Step 3: Extracted Understanding Result
  const [analysisResult, setAnalysisResult] = useState<{
    case_id: string;
    is_rti_eligible: boolean;
    info_sought: string;
    likely_department: string;
    location: string;
    confidence_tier: string;
    explanation: string;
    pio_name?: string;
    pio_address?: string;
    pio_email?: string;
  } | null>(null);

  // Editable fields in Step 3
  const [confirmedInfoSought, setConfirmedInfoSought] = useState("");
  const [confirmedDepartment, setConfirmedDepartment] = useState("");
  const [confirmedLocation, setConfirmedLocation] = useState("");
  const [isEditingFields, setIsEditingFields] = useState(false);

  // Step 4: Draft Result
  const [draftResult, setDraftResult] = useState<{
    case_id: string;
    draft_text: string;
    explanation: string;
  } | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [displayedDraftText, setDisplayedDraftText] = useState("");

  React.useEffect(() => {
    if (draftResult?.draft_text) {
      let currentText = "";
      let index = 0;
      const fullText = draftResult.draft_text;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText.slice(index, index + 15);
          index += 15;
          setDisplayedDraftText(currentText);
        } else {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayedDraftText("");
    }
  }, [draftResult?.draft_text]);

  // Web Speech API for Voice Input
  const handleVoiceInput = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : language === "ta" ? "ta-IN" : language === "te" ? "te-IN" : language === "ml" ? "ml-IN" : "en-IN";
      
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setGrievanceDetails((prev) => (prev ? prev + " " + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      alert("Voice speech recognition is not supported on this browser.");
    }
  };

  // Submit Step 2 Guided Form -> Call Backend Analysis
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceDetails.trim()) {
      setError("Please describe what happened before proceeding.");
      return;
    }

    // Build plain language prompt from guided inputs
    const combinedPrompt = `Category: ${selectedCategory}. Details: ${grievanceDetails.trim()}. Date/Timeframe: ${dateOccurred || "Recent months"}. Preferred Department: ${targetDepartment}. Location/PIN: ${locationPin}.`;

    setAnalyzing(true);
    setError("");

    try {
      const res = await api.analyzeComplaint(combinedPrompt, language);
      setAnalysisResult(res);
      setConfirmedInfoSought(res.info_sought);
      setConfirmedDepartment(res.likely_department || targetDepartment);
      setConfirmedLocation(res.location || locationPin);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to analyze complaint.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 3 Confirmation -> Step 4 Draft Generation
  const handleConfirmAndDraft = async () => {
    if (!analysisResult) return;
    setDrafting(true);
    setError("");

    try {
      const res = await api.generateDraft(analysisResult.case_id, {
        confirmed_info_sought: confirmedInfoSought,
        confirmed_department: confirmedDepartment,
        confirmed_location: confirmedLocation,
        target_language: language,
      });
      setDraftResult(res);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to generate application draft.");
    } finally {
      setDrafting(false);
    }
  };

  // Downloader
  const downloadSummary = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 5-Step Persistent Progress Bar */}
        <div className="bg-parchment-card border border-border-card p-6 rounded-xl flex items-center justify-between shadow-sm overflow-x-auto gap-4">
          
          <div className="flex items-center gap-2 min-w-fit">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 1 ? "bg-saffron text-parchment shadow-md scale-105" : "bg-border-subtle text-ink-muted"}`}>
              1
            </div>
            <span className={`text-xs font-semibold ${step === 1 ? "text-ink font-bold" : "text-ink-muted"}`}>
              1. Category
            </span>
          </div>

          <div className="h-1 flex-1 min-w-[20px] bg-border-subtle rounded-full overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-saffron to-saffron transition-all duration-700 ease-in-out"
              style={{ width: step >= 2 ? "100%" : "0%" }}
            />
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 2 ? "bg-saffron text-parchment shadow-md scale-105" : "bg-border-subtle text-ink-muted"}`}>
              2
            </div>
            <span className={`text-xs font-semibold ${step === 2 ? "text-ink font-bold" : "text-ink-muted"}`}>
              2. Details
            </span>
          </div>

          <div className="h-1 flex-1 min-w-[20px] bg-border-subtle rounded-full overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-saffron to-saffron transition-all duration-700 ease-in-out"
              style={{ width: step >= 3 ? "100%" : "0%" }}
            />
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 3 ? "bg-saffron text-parchment shadow-md scale-105" : "bg-border-subtle text-ink-muted"}`}>
              3
            </div>
            <span className={`text-xs font-semibold ${step === 3 ? "text-ink font-bold" : "text-ink-muted"}`}>
              3. Confirm
            </span>
          </div>

          <div className="h-1 flex-1 min-w-[20px] bg-border-subtle rounded-full overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-saffron to-forest transition-all duration-700 ease-in-out"
              style={{ width: step >= 4 ? "100%" : "0%" }}
            />
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 4 ? "bg-forest text-parchment shadow-md scale-105" : "bg-border-subtle text-ink-muted"}`}>
              4
            </div>
            <span className={`text-xs font-semibold ${step === 4 ? "text-ink font-bold" : "text-ink-muted"}`}>
              4. Draft
            </span>
          </div>

          <div className="h-1 flex-1 min-w-[20px] bg-border-subtle rounded-full overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-forest to-forest transition-all duration-700 ease-in-out"
              style={{ width: step >= 5 ? "100%" : "0%" }}
            />
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 5 ? "bg-forest text-parchment shadow-md scale-105" : "bg-border-subtle text-ink-muted"}`}>
              5
            </div>
            <span className={`text-xs font-semibold ${step === 5 ? "text-ink font-bold" : "text-ink-muted"}`}>
              5. File
            </span>
          </div>

        </div>

        {/* STEP 1: CATEGORY SELECTION CARDS */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-border-subtle pb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">Step 1 of 5</span>
              <h1 className="serif-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
                {t("wiz_step1_title")}
              </h1>
              <p className="text-xs text-ink-muted mt-1">
                Select the card that best matches your civic grievance. No legal jargon required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Category 1: Public Works */}
              <div
                onClick={() => setSelectedCategory("works")}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all space-y-3 ${
                  selectedCategory === "works"
                    ? "bg-saffron-light border-saffron shadow-sm"
                    : "bg-parchment-card border-border-card hover:border-saffron/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="icon-3d-container w-10 h-10 rounded bg-saffron text-parchment flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "works"}
                    onChange={() => setSelectedCategory("works")}
                    className="accent-saffron w-4 h-4"
                  />
                </div>
                <h3 className="serif-heading font-bold text-lg text-ink">{t("wiz_cat_works_title")}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{t("wiz_cat_works_desc")}</p>
              </div>

              {/* Category 2: Delayed Services */}
              <div
                onClick={() => setSelectedCategory("delay")}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all space-y-3 ${
                  selectedCategory === "delay"
                    ? "bg-saffron-light border-saffron shadow-sm"
                    : "bg-parchment-card border-border-card hover:border-saffron/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="icon-3d-container w-10 h-10 rounded bg-saffron text-parchment flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "delay"}
                    onChange={() => setSelectedCategory("delay")}
                    className="accent-saffron w-4 h-4"
                  />
                </div>
                <h3 className="serif-heading font-bold text-lg text-ink">{t("wiz_cat_delay_title")}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{t("wiz_cat_delay_desc")}</p>
              </div>

              {/* Category 3: Public Money Expenditure */}
              <div
                onClick={() => setSelectedCategory("money")}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all space-y-3 ${
                  selectedCategory === "money"
                    ? "bg-saffron-light border-saffron shadow-sm"
                    : "bg-parchment-card border-border-card hover:border-saffron/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="icon-3d-container w-10 h-10 rounded bg-saffron text-parchment flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "money"}
                    onChange={() => setSelectedCategory("money")}
                    className="accent-saffron w-4 h-4"
                  />
                </div>
                <h3 className="serif-heading font-bold text-lg text-ink">{t("wiz_cat_money_title")}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{t("wiz_cat_money_desc")}</p>
              </div>

              {/* Category 4: Unanswered Letters */}
              <div
                onClick={() => setSelectedCategory("unanswered")}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all space-y-3 ${
                  selectedCategory === "unanswered"
                    ? "bg-saffron-light border-saffron shadow-sm"
                    : "bg-parchment-card border-border-card hover:border-saffron/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="icon-3d-container w-10 h-10 rounded bg-saffron text-parchment flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "unanswered"}
                    onChange={() => setSelectedCategory("unanswered")}
                    className="accent-saffron w-4 h-4"
                  />
                </div>
                <h3 className="serif-heading font-bold text-lg text-ink">{t("wiz_cat_unanswered_title")}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{t("wiz_cat_unanswered_desc")}</p>
              </div>

            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 rounded bg-saffron text-parchment font-semibold text-sm shadow hover:bg-saffron-hover transition-colors flex items-center gap-2"
              >
                <span>Continue to Guided Questions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: GUIDED QUESTIONNAIRE WITH VOICE INPUT */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="border-b border-border-subtle pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">Step 2 of 5</span>
                  <h1 className="serif-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
                    {t("wiz_step2_title")}
                  </h1>
                </div>

                {/* Expandable Help Tooltip */}
                <button
                  type="button"
                  onClick={() => setShowHelpTooltip(!showHelpTooltip)}
                  className="text-xs font-semibold text-saffron hover:underline flex items-center gap-1.5 bg-saffron-light px-3 py-1.5 rounded border border-saffron/20"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{t("wiz_need_help")}</span>
                </button>
              </div>

              {/* Help Tooltip Box */}
              {showHelpTooltip && (
                <div className="p-4 rounded bg-parchment-card border border-border-card text-xs text-ink-muted leading-relaxed space-y-2">
                  <p className="font-bold text-ink">Why we ask these guided questions:</p>
                  <p>Under Section 6(1) of the RTI Act, Public Information Officers require clear details (dates, specific works, department, and location) to locate official files. Providing accurate details ensures your application cannot be rejected for ambiguity.</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded bg-crimson-light border border-crimson/30 text-crimson text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleAnalyze} className="space-y-6">
                <div className="space-y-5 bg-parchment-card border border-border-card p-6 rounded-lg">
                  
                  {/* Question 1: What happened? + Voice Button */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                        1. Describe what happened in simple words
                      </label>
                      <button
                        type="button"
                        onClick={handleVoiceInput}
                        className={`text-xs font-bold px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
                          isListening ? "bg-crimson text-parchment animate-pulse" : "bg-saffron-light text-saffron border border-saffron/20 hover:bg-saffron hover:text-parchment"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{isListening ? "Listening..." : t("wiz_voice_btn")}</span>
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={grievanceDetails}
                      onChange={(e) => setGrievanceDetails(e.target.value)}
                      placeholder="e.g. The main road in Sector 4 has had 12 deep potholes since January. We wrote 3 letters to the ward officer but got no response..."
                      className="w-full p-4 bg-parchment border border-border-card rounded text-sm text-ink leading-relaxed focus:outline-none focus:border-saffron paper-texture"
                    />
                  </div>

                  {/* Question 2: When did it happen? */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                        2. Approximate Date or Timeframe
                      </label>
                      <input
                        type="text"
                        value={dateOccurred}
                        onChange={(e) => setDateOccurred(e.target.value)}
                        placeholder="e.g. January 2026 to present"
                        className="w-full p-2.5 bg-parchment border border-border-card rounded text-sm text-ink focus:outline-none focus:border-saffron"
                      />
                    </div>

                    {/* Question 3: Mapped Department */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                        3. Target Department (if known)
                      </label>
                      <select
                        value={targetDepartment}
                        onChange={(e) => setTargetDepartment(e.target.value)}
                        className="w-full p-2.5 bg-parchment border border-border-card rounded text-sm text-ink focus:outline-none focus:border-saffron font-medium"
                      >
                        <option value="Public Works Department">Public Works Department (Roads, Infrastructure)</option>
                        <option value="Water Supply and Sanitation Department">Water Supply & Sanitation</option>
                        <option value="Municipal Corporation">Municipal Corporation / Civil Office</option>
                        <option value="Electricity Board">Electricity Board</option>
                        <option value="Revenue and Land Records">Revenue & Land Records</option>
                        <option value="Other">Other / Not Sure</option>
                      </select>
                    </div>
                  </div>

                  {/* Question 4: Location / PIN */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                      4. Location / PIN Code / City
                    </label>
                    <input
                      type="text"
                      required
                      value={locationPin}
                      onChange={(e) => setLocationPin(e.target.value)}
                      placeholder="e.g. 560037, Bangalore"
                      className="w-full p-2.5 bg-parchment border border-border-card rounded text-sm text-ink focus:outline-none focus:border-saffron"
                    />
                  </div>

                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-ink-muted hover:text-ink"
                  >
                    ← Back to Category
                  </button>

                  <button
                    type="submit"
                    disabled={analyzing}
                    className="px-8 py-3.5 rounded bg-saffron text-parchment font-semibold text-sm shadow hover:bg-saffron-hover transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Grievance...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Confirmation Screen</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-parchment-card border border-border-card rounded-xl shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-full p-4 flex items-center justify-between bg-saffron-light border-b border-border-subtle font-semibold text-sm text-ink text-left transition-colors hover:bg-saffron-light/80"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-saffron" />
                    <span>Know Your Rights: {selectedCategory.toUpperCase()}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`} />
                </button>

                {sidebarOpen && (
                  <div className="p-4 space-y-4 text-xs leading-relaxed text-ink-muted">
                    <p className="font-medium text-ink">Relevant provisions under the RTI Act, 2005:</p>
                    {selectedCategory === "works" && (
                      <ul className="space-y-3 list-disc pl-4 text-left">
                        <li><strong className="text-saffron font-mono">Section 2(j)(i)</strong>: Gives citizens the explicit right to inspect public works (e.g., examine pothole repairs, roads, or buildings).</li>
                        <li><strong className="text-saffron font-mono">Section 4(1)(b)</strong>: Mandates proactive disclosure of public tenders, budgets, and contractor details.</li>
                        <li><strong className="text-saffron font-mono">Section 6(1)</strong>: Allows you to request certified copies of measurement books, work quality test reports, and bills.</li>
                      </ul>
                    )}
                    {selectedCategory === "delay" && (
                      <ul className="space-y-3 list-disc pl-4 text-left">
                        <li><strong className="text-saffron font-mono">Section 7(1)</strong>: Establishes a statutory time limit of 30 days for the PIO to provide the requested details.</li>
                        <li><strong className="text-saffron font-mono">Section 20(1)</strong>: The Commission can fine the PIO Rs. 250 per day (up to Rs. 25,000) for delay without reasonable cause.</li>
                        <li><strong className="text-saffron font-mono">Section 19(1)</strong>: Grants you the right to appeal to a senior officer if the PIO fails to respond within 30 days.</li>
                      </ul>
                    )}
                    {selectedCategory === "money" && (
                      <ul className="space-y-3 list-disc pl-4 text-left">
                        <li><strong className="text-saffron font-mono">Section 4(1)(b)(xi)</strong>: Requires every public authority to publish budget allocations and expenditure logs.</li>
                        <li><strong className="text-saffron font-mono">Section 2(f)</strong>: Defines &quot;information&quot; to include bills, cash receipts, bank vouchers, and ledger records.</li>
                        <li><strong className="text-saffron font-mono">Section 6(1)</strong>: Allows any citizen to seek line-item expenditures of civic bodies.</li>
                      </ul>
                    )}
                    {selectedCategory === "unanswered" && (
                      <ul className="space-y-3 list-disc pl-4 text-left">
                        <li><strong className="text-saffron font-mono">Section 7(2)</strong>: Failure to reply within 30 days is legally treated as a &quot;deemed refusal,&quot; opening the door to appeals.</li>
                        <li><strong className="text-saffron font-mono">Section 5(3)</strong>: Mandates that the PIO must deal with requests and provide reasonable assistance.</li>
                        <li><strong className="text-saffron font-mono">Section 19(1)</strong>: Allows you to bypass the silent PIO and escalate directly to the First Appellate Authority.</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: UNDERSTANDING CONFIRMATION */}
        {step === 3 && analysisResult && (
          <div className="space-y-6">
            <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">Step 3 of 5</span>
                  <h2 className="serif-heading text-2xl font-bold text-ink mt-1">
                    Here&apos;s what RightPath understood:
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-forest-light text-forest text-xs font-bold border border-forest/30 uppercase">
                  {analysisResult.confidence_tier}
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Review the restated RTI parameters below before drafting your application.
              </p>
            </div>

            {/* HARD REFUSAL STATE */}
            {analysisResult.confidence_tier === "needs_lawyer" ? (
              <div className="bg-parchment border-2 border-crimson rounded-lg p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-crimson-light text-crimson flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="serif-heading text-xl font-bold text-crimson">{t("refusal_header")}</h3>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">{analysisResult.explanation}</p>
                  </div>
                </div>

                <div className="p-4 rounded bg-crimson-light border border-crimson/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-crimson flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Application drafting locked for legal safety.
                  </span>
                  <button
                    onClick={() => downloadSummary(`RightPath_Case_Summary_${analysisResult.case_id}.txt`, `RIGHTPATH CASE SUMMARY FOR LEGAL COUNSEL\nCase ID: ${analysisResult.case_id}\n\nGRIEVANCE:\n${grievanceDetails}\n\nEXEMPTION RATIONALE:\n${analysisResult.explanation}`)}
                    className="px-4 py-2 rounded bg-crimson text-parchment text-xs font-semibold"
                  >
                    Download Case Summary
                  </button>
                </div>
              </div>
            ) : drafting ? (
              /* AI IS THINKING SKELETON LOADER */
              <div className="space-y-6 animate-pulse">
                <div className="bg-saffron-light border border-saffron/20 p-6 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-saffron animate-spin" />
                    <span className="font-bold text-saffron text-sm">RightPath AI is drafting your official application...</span>
                  </div>
                  <div className="h-2 bg-saffron/10 rounded w-1/3 animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-parchment-card border border-border-card rounded-lg p-6 space-y-4">
                    <div className="h-4 bg-border-card rounded w-2/3"></div>
                    <div className="space-y-2.5">
                      <div className="h-3 bg-border-card rounded w-full"></div>
                      <div className="h-3 bg-border-card rounded w-5/6"></div>
                      <div className="h-3 bg-border-card rounded w-4/5"></div>
                      <div className="h-3 bg-border-card rounded w-full"></div>
                      <div className="h-3 bg-border-card rounded w-11/12"></div>
                    </div>
                  </div>
                  <div className="bg-parchment-card border border-border-card rounded-lg p-6 space-y-4">
                    <div className="h-4 bg-border-card rounded w-1/2"></div>
                    <div className="space-y-3">
                      <div className="h-10 bg-border-card rounded w-full"></div>
                      <div className="h-10 bg-border-card rounded w-full"></div>
                      <div className="h-10 bg-border-card rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* REGULAR CONFIRMATION STATE */
              <div className="space-y-6">
                <div className="bg-parchment-card border border-border-card rounded-lg p-6 space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                    <h3 className="serif-heading font-bold text-lg text-ink">Extracted Parameters</h3>
                    <button
                      onClick={() => setIsEditingFields(!isEditingFields)}
                      className="text-xs font-semibold text-saffron hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isEditingFields ? "Done Editing" : "Refine Fields"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                        Information Sought (RTI Query)
                      </label>
                      {isEditingFields ? (
                        <input
                          type="text"
                          value={confirmedInfoSought}
                          onChange={(e) => setConfirmedInfoSought(e.target.value)}
                          className="w-full p-2.5 bg-parchment border border-border-card rounded text-sm text-ink font-medium"
                        />
                      ) : (
                        <div className="p-3 bg-parchment rounded border border-border-subtle text-sm font-semibold text-ink">
                          {confirmedInfoSought}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                        Department
                      </label>
                      {isEditingFields ? (
                        <input
                          type="text"
                          value={confirmedDepartment}
                          onChange={(e) => setConfirmedDepartment(e.target.value)}
                          className="w-full p-2.5 bg-parchment border border-border-card rounded text-sm text-ink font-medium"
                        />
                      ) : (
                        <div className="p-3 bg-parchment rounded border border-border-subtle text-sm font-semibold text-ink">
                          {confirmedDepartment}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                        Location / Jurisdiction
                      </label>
                      {isEditingFields ? (
                        <input
                          type="text"
                          value={confirmedLocation}
                          onChange={(e) => setConfirmedLocation(e.target.value)}
                          className="w-full p-2.5 bg-parchment border border-border-card rounded text-sm text-ink font-medium"
                        />
                      ) : (
                        <div className="p-3 bg-parchment rounded border border-border-subtle text-sm font-semibold text-ink">
                          {confirmedLocation}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                <div className="flex justify-between items-center border-t border-border-subtle pt-6">
                  <button onClick={() => setStep(2)} className="text-xs font-semibold text-ink-muted">
                    ← Edit Answers
                  </button>
                  <button
                    onClick={handleConfirmAndDraft}
                    disabled={drafting}
                    className="px-8 py-3.5 rounded bg-forest text-parchment font-semibold text-sm shadow hover:bg-forest-hover transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {drafting ? "Drafting..." : "Confirm & Generate Application Draft"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: DRAFT REVIEW */}
        {step === 4 && draftResult && (
          <div className="space-y-6">
            <div className="bg-forest-light border border-forest/30 p-6 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Step 4: RTI Application Drafted & Grounded</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-parchment-card border border-border-card rounded-lg p-6 space-y-4">
                <h3 className="serif-heading font-bold text-base text-ink">Official RTI Application Document (English)</h3>
                <div className="bg-parchment p-6 rounded border border-border-subtle font-mono text-xs text-ink leading-relaxed whitespace-pre-wrap paper-texture max-h-[500px] overflow-y-auto">
                  {displayedDraftText || "Drafting..."}
                </div>
              </div>

              <div className="bg-parchment-card border border-border-card rounded-lg p-6 space-y-4">
                <h3 className="serif-heading font-bold text-base text-ink flex items-center gap-2">
                  <Info className="w-4 h-4 text-forest" />
                  AI Guidance & Explanation
                </h3>
                <div className="p-4 bg-parchment rounded border border-border-subtle text-xs text-ink leading-relaxed whitespace-pre-wrap">
                  {draftResult.explanation}
                </div>

                <h3 className="serif-heading font-bold text-base text-ink flex items-center gap-2 pt-2">
                  <ShieldCheck className="w-4 h-4 text-forest" />
                  Statutory Grounding
                </h3>
                <span className="verified-tag">✓ Verified from RTI Act 2005</span>
                <div className="space-y-3 text-xs text-ink-muted">
                  <div className="p-3 bg-parchment rounded border border-border-subtle">
                    <span className="font-bold text-saffron font-mono">Section 6(1):</span> Information request filing mechanism.
                  </div>
                  <div className="p-3 bg-parchment rounded border border-border-subtle">
                    <span className="font-bold text-saffron font-mono">Section 7(1):</span> Statutory 30-day response window.
                  </div>
                  <div className="p-3 bg-parchment rounded border border-border-subtle">
                    <span className="font-bold text-saffron font-mono">Section 19(1):</span> First Appeal right for deemed refusal.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(5)}
                className="px-8 py-3.5 rounded bg-saffron text-parchment font-semibold text-sm shadow hover:bg-saffron-hover transition-colors flex items-center gap-2"
              >
                <span>Proceed to Step 5: File Case & Track</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FILE & SLA TRACKER CONFIRMATION */}
        {step === 5 && draftResult && (
          <div className="bg-parchment-card border border-border-card p-8 rounded-lg space-y-6 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-forest text-parchment flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="serif-heading text-2xl font-bold text-ink">
                Step 5: Case Initialized & SLA Tracker Active
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                Your case ID <span className="font-mono text-saffron font-bold">{draftResult.case_id}</span> has been logged on your dashboard. Print or email your drafted RTI application to the Public Information Officer to start your 30-day statutory countdown.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => downloadSummary(`RTI_Application_${draftResult.case_id}.txt`, draftResult.draft_text)}
                className="w-full sm:w-auto px-6 py-3 rounded bg-saffron text-parchment text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Application (TXT)</span>
              </button>
              <Link
                href={`/rti/cases/${draftResult.case_id}`}
                className="w-full sm:w-auto px-6 py-3 rounded bg-forest text-parchment text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Go to Case Detail & Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
