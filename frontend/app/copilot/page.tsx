"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useTranslation, Language } from "../../lib/i18n";
import { api } from "../../lib/api";
import { 
  MessageSquare, BookOpen, FileText, CheckSquare, Compass, 
  Presentation, Send, Mic, Volume2, Upload, AlertCircle, 
  ArrowRight, ShieldCheck, HelpCircle, RefreshCw, Layout, 
  TrendingUp, Download, Eye, Play, Sparkles, Sun, Moon
} from "lucide-react";

type Tab = "chatbot" | "navigator" | "translator" | "schemes" | "roadmap" | "pitch";

export default function CopilotPage() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("chatbot");
  const [targetLang, setTargetLang] = useState<string>("en");

  // --- TAB 1: CHATBOT STATE ---
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hello! I am RightPath's Civic AI Copilot. Ask me any doubts about your legal rights, municipal duties, or the RTI Act, 2005. I will answer based on official statutory records." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle input change to trigger instant hint suggestions (like pension or pothole)
  const handleChatInputChange = (val: string) => {
    setChatInput(val);
    const lower = val.toLowerCase();
    const suggestions: string[] = [];
    if (lower.includes("pension")) {
      suggestions.push("Check Pension Scheme Eligibility");
    }
    if (lower.includes("pothole") || lower.includes("road")) {
      suggestions.push("Draft an RTI for Road Repair Works");
    }
    if (lower.includes("delay")) {
      suggestions.push("Check 30-Day SLA status of my application");
    }
    if (lower.includes("water") || lower.includes("garbage")) {
      suggestions.push("Request Municipal Inspection log details");
    }
    setChatSuggestions(suggestions);
  };

  // Chat query submission
  const handleSendChat = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: query }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatSuggestions([]);
    setChatLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chatbot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          target_language: targetLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        if (data.suggestions && data.suggestions.length > 0) {
          setChatSuggestions(data.suggestions);
        }
      } else {
        throw new Error("Query failed");
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I am experiencing network difficulties. Grounding details offline: Check Section 6(1) of the RTI Act for filing parameters, and Section 7(1) for the 30-day response window." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // TTS Read Aloud function
  const handleReadAloud = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel previous utterances
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang === "ta" ? "ta-IN" : targetLang === "hi" ? "hi-IN" : targetLang === "kn" ? "kn-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Web Speech STT Voice input function
  const startSpeechRecognition = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = targetLang === "ta" ? "ta-IN" : targetLang === "hi" ? "hi-IN" : targetLang === "kn" ? "kn-IN" : "en-US";
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setChatInput(prev => prev + " " + resultText);
      };
      recognition.start();
    } else {
      alert("Speech recognition is not supported on this browser.");
    }
  };


  // --- TAB 2: RIGHTS NAVIGATOR (RAG EXPLORER) STATE ---
  const [navQuery, setNavQuery] = useState("");
  const [navLoading, setNavLoading] = useState(false);
  const [navResults, setNavResults] = useState<Array<{ id: string; document: string; metadata: any }>>([]);

  const handleNavSearch = async () => {
    if (!navQuery.trim()) return;
    setNavLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/chatbot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Find relevant legal sections or rules regarding: ${navQuery}` }],
          target_language: targetLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setNavResults([
          {
            id: "retrieved_doc_1",
            document: data.response,
            metadata: {
              source_type: "rules",
              section_or_topic: navQuery,
              source_url: "https://cic.gov.in"
            }
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNavLoading(false);
    }
  };


  // --- TAB 3: BUREAUCRACY TRANSLATOR STATE ---
  const [translateText, setTranslateText] = useState("");
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translationResult, setTranslationResult] = useState<{
    simple_meaning: string;
    deadlines: string[];
    required_actions: string[];
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setTranslateText(
      "DEMAND NOTICE FOR MUNICIPAL TAX OUTSTANDINGS: Public Authority demands payment of outstanding sewer cess of Rs. 14,200 for Municipal Ward 4. Payments must be processed through official treasury channel on or before 31st August 2026. Failure to pay will attract a penalty surcharge of 2% per month and immediate service disconnection."
    );
  };

  const handleTranslateSubmit = async () => {
    if (!translateText.trim()) return;
    setTranslateLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/translator/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translateText,
          target_language: targetLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTranslationResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTranslateLoading(false);
    }
  };


  // --- TAB 4: SCHEME ELIGIBILITY STATE ---
  const [schemeStep, setSchemeStep] = useState(0);
  const [schemeAnswers, setSchemeAnswers] = useState<Record<string, string>>({
    land_owner: "",
    land_size: "",
    income_tax: "",
    annual_income: "",
    owns_pucca_house: "",
    deprived_household: ""
  });
  const [schemeResults, setSchemeResults] = useState<Array<{ name: string; status: string; reason: string; benefit: string }>>([]);
  const [evaluatingSchemes, setEvaluatingSchemes] = useState(false);

  const handleSchemeAnswer = (key: string, value: string) => {
    setSchemeAnswers(prev => ({ ...prev, [key]: value }));
    setSchemeStep(prev => prev + 1);
  };

  const evaluateSchemeEligibility = async () => {
    setEvaluatingSchemes(true);
    try {
      const res = await fetch("http://localhost:8000/api/schemes/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: schemeAnswers,
          target_language: targetLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSchemeResults(data.eligible_schemes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluatingSchemes(false);
    }
  };


  // --- TAB 6: PITCH / PPT GENERATOR STATE ---
  const [pitchInput, setPitchInput] = useState("");
  const [pitchLoading, setPitchLoading] = useState(false);
  const [slides, setSlides] = useState<Array<{ number: number; title: string; bullets: string[] }>>([]);

  const handlePitchSubmit = async () => {
    if (!pitchInput.trim()) return;
    setPitchLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/pitch/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grievance: pitchInput,
          target_language: targetLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSlides(data.slides || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPitchLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-parchment transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left collapsable modules side menu */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-parchment-card border border-border-card p-4 rounded-xl shadow-sm space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-saffron font-bold">Workspace Modules</h2>
            
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab("chatbot")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "chatbot" ? "bg-saffron text-parchment shadow-md" : "text-ink hover:bg-parchment-subtle"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Civic AI Copilot</span>
              </button>

              <button
                onClick={() => setActiveTab("navigator")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "navigator" ? "bg-saffron text-parchment shadow-md" : "text-ink hover:bg-parchment-subtle"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Rights Navigator</span>
              </button>

              <button
                onClick={() => setActiveTab("translator")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "translator" ? "bg-saffron text-parchment shadow-md" : "text-ink hover:bg-parchment-subtle"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Bureaucracy Translator</span>
              </button>

              <button
                onClick={() => setActiveTab("schemes")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "schemes" ? "bg-saffron text-parchment shadow-md" : "text-ink hover:bg-parchment-subtle"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Scheme Eligibility</span>
              </button>

              <button
                onClick={() => setActiveTab("roadmap")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "roadmap" ? "bg-saffron text-parchment shadow-md" : "text-ink hover:bg-parchment-subtle"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Action Path Visualizer</span>
              </button>

              <button
                onClick={() => setActiveTab("pitch")}
                className={`w-full px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors ${
                  activeTab === "pitch" ? "bg-saffron text-parchment shadow-md" : "text-ink hover:bg-parchment-subtle"
                }`}
              >
                <Presentation className="w-4 h-4" />
                <span>Pitch / PPT Generator</span>
              </button>
            </nav>
          </div>

          {/* Quick Translation Settings */}
          <div className="bg-parchment-card border border-border-card p-4 rounded-xl shadow-sm space-y-3">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-ink-muted font-bold">Workspace Language</h3>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2 bg-parchment border border-border-subtle rounded text-xs text-ink focus:outline-none focus:border-saffron"
            >
              <option value="en">English (default)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
        </aside>

        {/* Right Active Module Work Area */}
        <section className="flex-1 min-w-0 bg-parchment-card border border-border-card rounded-2xl shadow-sm flex flex-col p-6 min-h-[550px] relative overflow-hidden">
          
          {/* TAB 1: CIVIC AI COPILOT CHATBOT */}
          {activeTab === "chatbot" && (
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              <div className="border-b border-border-subtle pb-3">
                <h1 className="serif-heading text-2xl font-bold text-ink">Civic AI Copilot</h1>
                <p className="text-xs text-ink-muted mt-0.5">Clear doubt queries grounded in local RTI RAG context.</p>
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-parchment border border-border-subtle rounded-xl max-h-[350px]">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex items-start gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-parchment font-bold text-xs shrink-0 ${m.role === "user" ? "bg-saffron" : "bg-forest"}`}>
                      {m.role === "user" ? "U" : "AI"}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${m.role === "user" ? "bg-saffron-light text-ink border border-saffron/15" : "bg-parchment-card border border-border-card text-ink"}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {m.role === "assistant" && (
                        <button
                          onClick={() => handleReadAloud(m.content)}
                          className="mt-2 text-[10px] font-bold text-forest flex items-center gap-1 hover:underline"
                          title="Read Aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Speak Answer</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-3 mr-auto max-w-[85%] animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-border-card flex items-center justify-center text-xs shrink-0 font-bold">AI</div>
                    <div className="p-3 bg-border-card rounded-2xl w-32 h-8"></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions chips */}
              {chatSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {chatSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendChat(s)}
                      className="px-3 py-1.5 rounded-full bg-saffron-light border border-saffron/20 text-[11px] text-saffron font-semibold hover:bg-saffron hover:text-parchment transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                <button
                  onClick={startSpeechRecognition}
                  className={`p-3 rounded-xl border transition-colors ${
                    isListening ? "bg-crimson text-parchment animate-pulse" : "bg-parchment border-border-subtle text-saffron hover:bg-saffron-light"
                  }`}
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => handleChatInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Ask about RTI fees, delayed pension appeals, pothole inspection rules..."
                  className="flex-1 p-3 bg-parchment border border-border-subtle rounded-xl text-xs text-ink focus:outline-none focus:border-saffron"
                />
                <button
                  onClick={() => handleSendChat()}
                  className="p-3 bg-saffron text-parchment rounded-xl hover:bg-saffron-hover shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RIGHTS NAVIGATOR */}
          {activeTab === "navigator" && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="border-b border-border-subtle pb-3">
                <h1 className="serif-heading text-2xl font-bold text-ink">Rights Navigator</h1>
                <p className="text-xs text-ink-muted mt-0.5">Cross-examine problems against Tier 1 official sources and legal acts.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={navQuery}
                  onChange={(e) => setNavQuery(e.target.value)}
                  placeholder="e.g. Karnataka Municipal Rules, Section 6(2) reasons, CBSE exam copies..."
                  className="flex-1 p-3 bg-parchment border border-border-subtle rounded-xl text-xs text-ink focus:outline-none focus:border-saffron"
                />
                <button
                  onClick={handleNavSearch}
                  disabled={navLoading}
                  className="px-6 py-3 bg-forest text-parchment font-semibold text-xs rounded-xl shadow hover:bg-forest-hover flex items-center gap-1.5"
                >
                  {navLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                  <span>Search Laws</span>
                </button>
              </div>

              {/* RAG Results */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-parchment border border-border-subtle rounded-xl max-h-[350px]">
                {navResults.length > 0 ? (
                  navResults.map((res, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border-subtle bg-parchment-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-saffron-light border border-saffron/20 text-[10px] uppercase font-mono font-bold text-saffron">
                          {res.metadata.source_type}
                        </span>
                        <a href={res.metadata.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-ink-light hover:underline">
                          View Official Source →
                        </a>
                      </div>
                      <h4 className="font-bold text-xs text-ink">Query Match: {res.metadata.section_or_topic}</h4>
                      <p className="text-[11px] text-ink-muted leading-relaxed whitespace-pre-wrap">{res.document}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-ink-light space-y-2">
                    <BookOpen className="w-8 h-8 mx-auto" />
                    <p className="text-xs">No active queries. Type a search topic above to pull statutory sources from ChromaDB.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BUREAUCRACY TRANSLATOR */}
          {activeTab === "translator" && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="border-b border-border-subtle pb-3">
                <h1 className="serif-heading text-2xl font-bold text-ink">Bureaucracy Translator</h1>
                <p className="text-xs text-ink-muted mt-0.5">Transform raw legalese notices into plain meanings, deadlines, and required actions.</p>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  dragOver ? "border-saffron bg-saffron-light/20" : "border-border-card bg-parchment hover:border-saffron/40"
                }`}
              >
                <Upload className="w-8 h-8 mx-auto text-ink-light mb-2" />
                <p className="text-xs font-semibold text-ink">Drag & Drop official government notice PDF/scan here</p>
                <p className="text-[10px] text-ink-light mt-1">Or paste the legalese notice text below manually</p>
              </div>

              {/* Text Input Area */}
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  placeholder="Paste complex legalese notice here..."
                  className="w-full p-4 bg-parchment border border-border-subtle rounded-xl text-xs text-ink leading-relaxed focus:outline-none focus:border-saffron"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleTranslateSubmit}
                    disabled={translateLoading}
                    className="px-6 py-3 bg-saffron text-parchment font-semibold text-xs rounded-xl shadow hover:bg-saffron-hover flex items-center gap-1.5"
                  >
                    {translateLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>Translate Legalese</span>
                  </button>
                </div>
              </div>

              {/* Side by Side visual Translation Result */}
              {translationResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
                  <div className="p-4 rounded-xl bg-parchment border border-border-subtle space-y-2">
                    <h3 className="font-bold text-xs text-ink-muted uppercase tracking-wider">Original Notice Text</h3>
                    <p className="text-[11px] text-ink-light leading-relaxed font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">{translateText}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-forest-light border border-forest/30 space-y-3">
                    <h3 className="font-bold text-xs text-forest uppercase tracking-wider">Simple Translation Map</h3>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-ink font-semibold">Plain Meaning:</strong>
                        <p className="text-[11px] text-ink-muted leading-relaxed">{translationResult.simple_meaning}</p>
                      </div>

                      {translationResult.deadlines && translationResult.deadlines.length > 0 && (
                        <div>
                          <strong className="text-crimson font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Crucial Deadlines:
                          </strong>
                          <ul className="list-disc pl-4 text-[11px] text-ink-muted mt-1 space-y-1">
                            {translationResult.deadlines.map((dl, idx) => <li key={idx}>{dl}</li>)}
                          </ul>
                        </div>
                      )}

                      {translationResult.required_actions && translationResult.required_actions.length > 0 && (
                        <div>
                          <strong className="text-forest font-semibold">Required Actions:</strong>
                          <ol className="list-decimal pl-4 text-[11px] text-ink-muted mt-1 space-y-1">
                            {translationResult.required_actions.map((act, idx) => <li key={idx}>{act}</li>)}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCHEME ELIGIBILITY ENGINE */}
          {activeTab === "schemes" && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="border-b border-border-subtle pb-3">
                <h1 className="serif-heading text-2xl font-bold text-ink">Scheme Eligibility Engine</h1>
                <p className="text-xs text-ink-muted mt-0.5">Determine eligibility status for PM-Kisan, PMAY, and national health benefits.</p>
              </div>

              {/* Multi-step Eligibility Interview */}
              {schemeResults.length === 0 ? (
                <div className="bg-parchment p-6 rounded-xl border border-border-subtle space-y-6">
                  {schemeStep === 0 && (
                    <div className="space-y-4 text-center py-6">
                      <HelpCircle className="w-8 h-8 text-saffron mx-auto" />
                      <h3 className="font-bold text-sm text-ink">Start Welfare Schemes Evaluation Interview</h3>
                      <p className="text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">Answer 5 simple questions about your land, housing status, and income levels to check eligibility.</p>
                      <button
                        onClick={() => setSchemeStep(1)}
                        className="px-6 py-2.5 bg-saffron text-parchment text-xs font-semibold rounded-lg hover:bg-saffron-hover shadow"
                      >
                        Start Interview
                      </button>
                    </div>
                  )}

                  {schemeStep === 1 && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink">1. Do you or your family own cultivable land?</label>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <button onClick={() => handleSchemeAnswer("land_owner", "Yes")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">Yes, I own land</button>
                        <button onClick={() => handleSchemeAnswer("land_owner", "No")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">No, I do not own land</button>
                      </div>
                    </div>
                  )}

                  {schemeStep === 2 && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink">2. What is your total cultivable land holding size?</label>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <button onClick={() => handleSchemeAnswer("land_size", "Less than 2 Hectares")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">&lt; 2 Hectares (Small/Marginal)</button>
                        <button onClick={() => handleSchemeAnswer("land_size", "More than 2 Hectares")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">&gt; 2 Hectares (Medium/Large)</button>
                        <button onClick={() => handleSchemeAnswer("land_size", "Not Applicable")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">No Land (Landless)</button>
                      </div>
                    </div>
                  )}

                  {schemeStep === 3 && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink">3. Do you pay income tax or are you a retired government officer?</label>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <button onClick={() => handleSchemeAnswer("income_tax", "Yes")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">Yes, I pay tax / Govt Officer</button>
                        <button onClick={() => handleSchemeAnswer("income_tax", "No")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">No tax / Layperson</button>
                      </div>
                    </div>
                  )}

                  {schemeStep === 4 && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink">4. What is your approximate annual household income?</label>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <button onClick={() => handleSchemeAnswer("annual_income", "Below 3 Lakhs")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">Below Rs. 3 Lakhs</button>
                        <button onClick={() => handleSchemeAnswer("annual_income", "3 to 6 Lakhs")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">Rs. 3 to 6 Lakhs</button>
                        <button onClick={() => handleSchemeAnswer("annual_income", "Above 6 Lakhs")} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">Above Rs. 6 Lakhs</button>
                      </div>
                    </div>
                  )}

                  {schemeStep === 5 && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink">5. Do you or your family own a pucca/brick house anywhere in India?</label>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <button onClick={() => { setSchemeAnswers(prev => ({ ...prev, owns_pucca_house: "Yes" })); setSchemeStep(6); }} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">Yes, I own a pucca house</button>
                          <button onClick={() => { setSchemeAnswers(prev => ({ ...prev, owns_pucca_house: "No" })); setSchemeStep(6); }} className="p-3 rounded-lg border border-border-card hover:border-saffron text-left font-medium">No, live in kucha / rent</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {schemeStep === 6 && (
                    <div className="space-y-4 text-center py-6">
                      <ShieldCheck className="w-8 h-8 text-forest mx-auto" />
                      <h3 className="font-bold text-sm text-ink">All Answers Collected</h3>
                      <p className="text-xs text-ink-muted max-w-sm mx-auto">Ready to evaluate your eligibility across PM-Kisan, PMAY, and national health coverage schemes.</p>
                      <button
                        onClick={evaluateSchemeEligibility}
                        disabled={evaluatingSchemes}
                        className="px-6 py-2.5 bg-forest text-parchment text-xs font-semibold rounded-lg hover:bg-forest-hover shadow flex items-center gap-1.5 mx-auto"
                      >
                        {evaluatingSchemes ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                        <span>Evaluate Eligibility</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schemeResults.map((sch, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border-subtle bg-parchment-card space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-xs text-ink">{sch.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sch.status.includes("Eligible") ? "bg-forest-light text-forest border border-forest/20" : "bg-crimson-light text-crimson border border-crimson/20"
                          }`}>
                            {sch.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted leading-relaxed"><strong className="text-ink">Status Reason:</strong> {sch.reason}</p>
                        <p className="text-[11px] text-ink-muted leading-relaxed"><strong className="text-saffron">Benefits:</strong> {sch.benefit}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => { setSchemeStep(0); setSchemeResults([]); }}
                      className="px-5 py-2 bg-saffron text-parchment font-semibold text-xs rounded-lg hover:bg-saffron-hover shadow"
                    >
                      Check Another Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTION PATH VISUALIZER (ROADMAP) */}
          {activeTab === "roadmap" && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="border-b border-border-subtle pb-3">
                <h1 className="serif-heading text-2xl font-bold text-ink">Action Path Visualizer</h1>
                <p className="text-xs text-ink-muted mt-0.5">Interactive step-by-step roadmap indicating next milestones for resolution.</p>
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-8 border-l-2 border-saffron space-y-8 py-4">
                <div className="relative">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-saffron text-parchment text-xs font-bold flex items-center justify-center border-4 border-parchment shadow-md">
                    1
                  </div>
                  <h4 className="font-bold text-xs text-ink">Establish Case Understanding</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">Complete the 5-Step Guided Questionnaire to identify department, PIO jurisdiction, and key details.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-saffron text-parchment text-xs font-bold flex items-center justify-center border-4 border-parchment shadow-md">
                    2
                  </div>
                  <h4 className="font-bold text-xs text-ink">Draft & Ground RTI Application</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">Verify that the draft application body cites only formal Act/Rules, and utilizes FAQ/precedent guidance inside the explanation.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-saffron text-parchment text-xs font-bold flex items-center justify-center border-4 border-parchment shadow-md">
                    3
                  </div>
                  <h4 className="font-bold text-xs text-ink">File Application with PIO</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">Submit the drafted document to the resolved PIO along with the Rs. 10 statutory fee. Mark as "filed" in your tracker.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-forest text-parchment text-xs font-bold flex items-center justify-center border-4 border-parchment shadow-md">
                    4
                  </div>
                  <h4 className="font-bold text-xs text-ink">Monitor 30-Day SLA Countdown</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">RightPath activates the statutory deadline tracking. You will be alerted upon expiry or deemed refusal.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-forest text-parchment text-xs font-bold flex items-center justify-center border-4 border-parchment shadow-md">
                    5
                  </div>
                  <h4 className="font-bold text-xs text-ink">Escalate (First Appeal)</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">If ignored or rejected unfairly, RightPath automatically drafts and prepares a Section 19(1) First Appeal document.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PITCH / PPT GENERATOR */}
          {activeTab === "pitch" && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="border-b border-border-subtle pb-3">
                <h1 className="serif-heading text-2xl font-bold text-ink">Pitch / PPT Generator</h1>
                <p className="text-xs text-ink-muted mt-0.5">Create a 4-slide structure summarizing the grievance case for civic or administrative presentations.</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={pitchInput}
                  onChange={(e) => setPitchInput(e.target.value)}
                  placeholder="Describe your grievance briefly (e.g. Delayed water connection bills in Sector 4)..."
                  className="flex-1 p-3 bg-parchment border border-border-subtle rounded-xl text-xs text-ink focus:outline-none focus:border-saffron"
                />
                <button
                  onClick={handlePitchSubmit}
                  disabled={pitchLoading}
                  className="px-6 py-3 bg-saffron text-parchment font-semibold text-xs rounded-xl shadow hover:bg-saffron-hover flex items-center gap-1.5"
                >
                  {pitchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Presentation className="w-3.5 h-3.5" />}
                  <span>Generate Slides</span>
                </button>
              </div>

              {/* Slide Output Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-parchment border border-border-subtle rounded-xl max-h-[350px]">
                {slides.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slides.map((slide, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-border-subtle bg-parchment-card shadow-sm space-y-3 relative overflow-hidden">
                        <div className="absolute top-2 right-3 text-xs font-mono font-bold text-saffron">Slide {slide.number}</div>
                        <h4 className="font-bold text-xs text-ink border-b border-border-subtle pb-1.5">{slide.title}</h4>
                        <ul className="list-disc pl-4 text-[11px] text-ink-muted space-y-1">
                          {slide.bullets.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-ink-light space-y-2">
                    <Presentation className="w-8 h-8 mx-auto" />
                    <p className="text-xs">No active slides. Describe your grievance above to generate your case presentation.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}
