import React, { useState, useRef, useEffect } from "react";

export default function TerminalInput({ username, host, onSubmit, disabled, history }) {
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit(value.trim());
      setValue("");
      setHistoryIndex(-1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const cmds = history.map(h => h.command).reverse();
      if (historyIndex < cmds.length - 1) {
        const next = historyIndex + 1;
        setHistoryIndex(next);
        setValue(cmds[next]);
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const next = historyIndex - 1;
        setHistoryIndex(next);
        setValue(history.map(h => h.command).reverse()[next]);
      } else {
        setHistoryIndex(-1);
        setValue("");
      }
    }
  };

  return (
    <div
      className="flex items-center gap-1 px-4 py-3 border-t border-zinc-800 bg-zinc-950/50 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-emerald-400 font-mono text-sm shrink-0">{username}@{host}</span>
      <span className="text-zinc-500 font-mono text-sm">:</span>
      <span className="text-blue-400 font-mono text-sm">~</span>
      <span className="text-zinc-500 font-mono text-sm mr-1">$</span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1 bg-transparent text-zinc-100 font-mono text-sm outline-none caret-emerald-400 placeholder:text-zinc-700"
        placeholder={disabled ? "Processing..." : "Enter command..."}
        autoComplete="off"
        spellCheck={false}
      />
      {disabled && (
        <div className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      )}
    </div>
  );
}