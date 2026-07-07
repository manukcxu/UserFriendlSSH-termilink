import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, MicOff, Send, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import RiskBadge from "@/components/termvoice/RiskBadge";

export default function TermVoiceHome() {
  const [listening, setListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const data = await base44.entities.CommandHistory.list("-timestamp", 5);
    setRecentHistory(data);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Your browser doesn't support voice input. Please type instead."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = localStorage.getItem("voice_lang") || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setInputText(t);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Mac terminal expert helping a complete beginner. Translate their plain-English request into a single macOS-compatible shell command. Respond ONLY in JSON with keys: command, explanation (one friendly sentence), risk_level (safe/caution/dangerous), breakdown (array of {part, meaning}). Prefer the safest version of any command. If the request is destructive or ambiguous, choose the least destructive interpretation and set risk_level accordingly. If the request cannot be done safely, return command as empty string and explain why in explanation.\n\nUser request: "${inputText}"`,
      response_json_schema: {
        type: "object",
        properties: {
          command: { type: "string" },
          explanation: { type: "string" },
          risk_level: { type: "string" },
          breakdown: { type: "array", items: { type: "object", properties: { part: { type: "string" }, meaning: { type: "string" } } } }
        }
      }
    });
    const entry = await base44.entities.CommandHistory.create({
      spoken_text: inputText,
      command: result.command,
      explanation: result.explanation,
      risk_level: result.risk_level,
      breakdown: result.breakdown || [],
      executed: false,
      timestamp: new Date().toISOString(),
    });
    setLoading(false);
    navigate(`/result/${entry.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="font-mono font-bold text-emerald-400 text-lg">TermVoice</span>
        <div className="flex gap-1">
          {[{ label: "Categories", to: "/categories" }, { label: "History", to: "/history" }, { label: "Learn", to: "/learn" }, { label: "Settings", to: "/settings" }].map(l => (
            <Link key={l.to} to={l.to} className="text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors px-2 py-1 hidden sm:block">{l.label}</Link>
          ))}
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center px-4 py-10 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="font-mono text-3xl font-bold text-zinc-100 mb-2">Speak. Translate. Copy.</h1>
          <p className="text-zinc-500 text-sm">Tell me what you want to do — I'll give you the exact Mac terminal command.</p>
        </div>

        <button
          onClick={listening ? stopListening : startListening}
          className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 transition-all shadow-2xl ${
            listening
              ? "bg-red-500/20 border-2 border-red-500 animate-pulse"
              : "bg-emerald-500/10 border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          {listening ? <MicOff className="w-10 h-10 text-red-400" /> : <Mic className="w-10 h-10 text-emerald-400" />}
        </button>
        {listening && <p className="text-xs font-mono text-red-400 mb-4 animate-pulse">● Listening...</p>}

        <div className="w-full space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={'Or type here: e.g. "show all files in Downloads"'}
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
          />
          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono gap-2 py-3 text-base"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Translating...</>
            ) : (
              <><Send className="w-4 h-4" /> Translate to Command</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full mt-10 sm:hidden">
          {[{ label: "Categories", to: "/categories" }, { label: "History", to: "/history" }, { label: "Learn", to: "/learn" }, { label: "Settings", to: "/settings" }].map(l => (
            <Link key={l.to} to={l.to} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-center font-mono text-sm text-zinc-400 hover:text-emerald-400 hover:border-zinc-600">{l.label}</Link>
          ))}
        </div>

        {recentHistory.length > 0 && (
          <div className="w-full mt-10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Recent</span>
              <Link to="/history" className="text-xs font-mono text-emerald-500 hover:text-emerald-400 flex items-center gap-1">See all <ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-2">
              {recentHistory.map(h => (
                <Link key={h.id} to={`/result/${h.id}`} className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 hover:border-zinc-600 group">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-emerald-300 truncate">{h.command}</p>
                    <p className="text-xs text-zinc-600 truncate mt-0.5">{h.spoken_text || h.explanation}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <RiskBadge level={h.risk_level} />
                    <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}