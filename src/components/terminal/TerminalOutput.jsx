import React, { useRef, useEffect } from "react";

export default function TerminalOutput({ history, username, host }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed custom-scrollbar">
      {/* Welcome banner */}
      <div className="text-emerald-400 mb-4 select-none">
        <pre className="text-emerald-500/70 text-xs leading-tight">{`
  ╔═══════════════════════════════════════╗
  ║         SSH Terminal v1.0.0           ║
  ║   Secure Shell Connection Manager     ║
  ╚═══════════════════════════════════════╝`}</pre>
        <p className="text-zinc-500 text-xs mt-2">
          Connected to {username}@{host} • Type 'help' for available commands
        </p>
      </div>

      {/* Command history */}
      {history.map((entry, i) => (
        <div key={i} className="mb-3">
          <div className="flex items-center gap-1">
            <span className="text-emerald-400">{username}@{host}</span>
            <span className="text-zinc-500">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-zinc-500">$</span>
            <span className="text-zinc-200 ml-1">{entry.command}</span>
          </div>
          {entry.output && (
            <pre className={`mt-1 whitespace-pre-wrap text-xs ${entry.is_error ? "text-red-400" : "text-zinc-400"}`}>
              {entry.output}
            </pre>
          )}
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}