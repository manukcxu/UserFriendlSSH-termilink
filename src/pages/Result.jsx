import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CommandResult from "@/components/termvoice/CommandResult";
import RiskBadge from "@/components/termvoice/RiskBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Result() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [sshConnections, setSshConnections] = useState([]);
  const [showRunModal, setShowRunModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [selectedConn, setSelectedConn] = useState("");
  const [runOutput, setRunOutput] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    base44.entities.CommandHistory.get(id).then(setEntry);
    base44.entities.SSHConnection.list().then(conns => {
      setSshConnections(conns);
      if (conns.length > 0) setSelectedConn(conns[0].id);
    });
  }, [id]);

  const handleRun = async () => {
    if (!entry || !selectedConn) return;
    setRunning(true);
    const response = await base44.functions.invoke("runSSHCommand", { command: entry.command, connectionId: selectedConn });
    const data = response.data;
    setRunning(false);
    setShowRunModal(false);

    if (data.fallback) {
      setRunOutput({ error: data.error, fallback: true });
    } else if (data.error) {
      setRunOutput({ error: data.error });
    } else {
      setRunOutput(data.output);
      await base44.entities.CommandHistory.update(id, { executed: true, output: JSON.stringify(data.output) });
    }
  };

  const canProceedRun = () => {
    if (entry?.risk_level === "dangerous") return confirmText === "CONFIRM";
    return true;
  };

  if (!entry) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <Link to="/" className="text-zinc-400 hover:text-zinc-100"><ArrowLeft className="w-5 h-5" /></Link>
        <span className="font-mono font-bold text-emerald-400">Result</span>
        <div className="ml-auto"><RiskBadge level={entry.risk_level} /></div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {entry.spoken_text && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-700 px-4 py-3">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Your request</p>
            <p className="text-sm text-zinc-300 italic">"{entry.spoken_text}"</p>
          </div>
        )}

        {/* Risk warning banners */}
        {entry.risk_level === "dangerous" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-sm text-red-400 font-mono">⚠ This command is marked DANGEROUS. Read the explanation carefully before using it.</p>
          </div>
        )}
        {entry.risk_level === "caution" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
            <p className="text-sm text-yellow-400 font-mono">⚠ Use caution with this command. Double-check before running.</p>
          </div>
        )}

        <CommandResult
          result={entry}
          sshConnected={sshConnections.length > 0}
          onRun={() => setShowRunModal(true)}
        />

        {/* SSH Output */}
        {runOutput && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700">
              <span className="font-mono text-xs text-zinc-400">Terminal Output</span>
            </div>
            <pre className="p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto">
              {runOutput.fallback ? runOutput.error :
               runOutput.error ? <span className="text-red-400">{runOutput.error}</span> :
               (runOutput.stdout || "") + (runOutput.stderr ? `\n[stderr] ${runOutput.stderr}` : "") || "(no output)"}
            </pre>
          </div>
        )}
      </div>

      {/* SSH Run Modal */}
      <Dialog open={showRunModal} onOpenChange={setShowRunModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="font-mono text-zinc-100">Run this on your Mac?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <pre className="bg-zinc-950 rounded-lg p-3 font-mono text-sm text-emerald-300 overflow-x-auto">{entry.command}</pre>
            <p className="text-sm text-zinc-400">{entry.explanation}</p>
            <div className="flex items-center gap-2"><RiskBadge level={entry.risk_level} /></div>

            {sshConnections.length > 1 && (
              <select value={selectedConn} onChange={e => setSelectedConn(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:outline-none">
                {sshConnections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}

            {entry.risk_level === "dangerous" && (
              <div>
                <p className="text-xs text-red-400 font-mono mb-2">Type CONFIRM to proceed with this dangerous command:</p>
                <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
                  placeholder="CONFIRM"
                  className="w-full bg-zinc-800 border border-red-500/50 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-red-400" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRunModal(false)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">Cancel</Button>
            <Button
              disabled={!canProceedRun() || running}
              onClick={handleRun}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono"
            >
              {running ? "Running..." : "Yes, run it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}