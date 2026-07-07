import React, { useState } from "react";
import { Copy, Check, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import RiskBadge from "./RiskBadge";

export default function CommandResult({ result, onRun, sshConnected }) {
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Command box */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-400">command</span>
            <RiskBadge level={result.risk_level} />
          </div>
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="px-4 py-4 font-mono text-base text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all">{result.command || "(no command — see explanation)"}</pre>
      </div>

      {/* Explanation */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-700 p-4">
        <p className="text-sm text-zinc-300 leading-relaxed">{result.explanation}</p>
      </div>

      {/* Breakdown */}
      {result.breakdown && result.breakdown.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <span>Command Breakdown</span>
            {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showBreakdown && (
            <div className="border-t border-zinc-700 divide-y divide-zinc-800">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                  <code className="font-mono text-xs text-cyan-400 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">{item.part}</code>
                  <span className="text-xs text-zinc-400">{item.meaning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={handleCopy} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Command"}
        </Button>
        {sshConnected && result.command && (
          <Button onClick={() => onRun(result)} variant="outline" className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800 font-mono gap-2">
            <Play className="w-4 h-4" />
            Run via SSH
          </Button>
        )}
      </div>

      {/* Step-by-step instructions */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-700 p-4">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">How to use this command</p>
        <ol className="space-y-2">
          {[
            "Open Terminal on your Mac (press Cmd+Space, type \"Terminal\", press Return)",
            "Paste the command (Cmd+V)",
            "Press Return to run it",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
              <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center justify-center">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}