import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Terminal, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RiskBadge from "@/components/termvoice/RiskBadge";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CommandHistory.list("-timestamp").then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    await base44.entities.CommandHistory.delete(id);
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <Link to="/" className="text-zinc-400 hover:text-zinc-100"><ArrowLeft className="w-5 h-5" /></Link>
        <span className="font-mono font-bold text-emerald-400">History</span>
        <span className="ml-auto text-xs font-mono text-zinc-600">{history.length} commands</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <Terminal className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-mono text-sm">No commands yet.</p>
            <Link to="/" className="text-xs text-emerald-500 hover:text-emerald-400 font-mono mt-2 inline-block">Generate your first command →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(h => (
              <Link key={h.id} to={`/result/${h.id}`}
                className="flex items-start justify-between bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 hover:border-zinc-500 group transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <RiskBadge level={h.risk_level} />
                    {h.executed && <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">Executed</span>}
                  </div>
                  <pre className="font-mono text-sm text-emerald-300 truncate">{h.command}</pre>
                  {h.spoken_text && <p className="text-xs text-zinc-600 truncate mt-0.5">"{h.spoken_text}"</p>}
                  <p className="text-xs text-zinc-600 mt-0.5">{new Date(h.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button onClick={(e) => handleDelete(h.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}