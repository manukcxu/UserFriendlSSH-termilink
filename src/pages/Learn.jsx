import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LEVELS = [
  {
    level: 1, title: "Navigation", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
    commands: [
      { cmd: "pwd", desc: "Print Working Directory — shows where you are" },
      { cmd: "ls", desc: "List files and folders in current location" },
      { cmd: "ls -la", desc: "List all files (including hidden) with details" },
      { cmd: "cd ~", desc: "Go to your home folder" },
      { cmd: "cd Desktop", desc: "Move into the Desktop folder" },
      { cmd: "cd ..", desc: "Go up one folder level" },
    ]
  },
  {
    level: 2, title: "Files", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
    commands: [
      { cmd: "mkdir MyFolder", desc: "Create a new folder called MyFolder" },
      { cmd: "cp file.txt copy.txt", desc: "Copy file.txt to copy.txt" },
      { cmd: "mv file.txt ~/Desktop/", desc: "Move file.txt to Desktop" },
      { cmd: "rm file.txt", desc: "Delete file.txt (permanent!)" },
      { cmd: "cat file.txt", desc: "Show the contents of a file" },
      { cmd: "touch newfile.txt", desc: "Create a new empty file" },
    ]
  },
  {
    level: 3, title: "Power", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
    commands: [
      { cmd: "ls | grep .pdf", desc: "List files and filter for PDFs (pipe)" },
      { cmd: "grep 'hello' file.txt", desc: "Find the word 'hello' inside a file" },
      { cmd: "sudo softwareupdate -i -a", desc: "Install all Mac software updates as admin" },
      { cmd: "brew install wget", desc: "Install wget via Homebrew package manager" },
      { cmd: "history", desc: "Show your command history" },
      { cmd: "ps aux | grep Chrome", desc: "Find Chrome's process ID" },
    ]
  },
  {
    level: 4, title: "Remote", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20",
    commands: [
      { cmd: "ssh user@192.168.1.1", desc: "Connect to another computer via SSH" },
      { cmd: "scp file.txt user@host:~/", desc: "Copy a file to a remote computer" },
      { cmd: "ssh-keygen -t ed25519", desc: "Generate a secure SSH key pair" },
      { cmd: "cat ~/.ssh/id_ed25519.pub", desc: "Show your public SSH key" },
      { cmd: "chmod 600 ~/.ssh/id_rsa", desc: "Set correct permissions on your SSH key" },
    ]
  },
];

export default function Learn() {
  const [copiedCmd, setCopiedCmd] = useState(null);
  const navigate = useNavigate();

  const handleCopy = (cmd, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleTryCommand = async (cmd, desc) => {
    const entry = await base44.entities.CommandHistory.create({
      spoken_text: desc,
      command: cmd,
      explanation: desc,
      risk_level: cmd.includes("sudo") || cmd.includes("rm") ? "caution" : "safe",
      breakdown: [],
      executed: false,
      timestamp: new Date().toISOString(),
    });
    navigate(`/result/${entry.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <Link to="/" className="text-zinc-400 hover:text-zinc-100"><ArrowLeft className="w-5 h-5" /></Link>
        <span className="font-mono font-bold text-emerald-400">Learn Terminal</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h2 className="font-mono text-xl font-bold text-zinc-100 mb-2">Beginner Roadmap</h2>
          <p className="text-sm text-zinc-500">Tap any command to load it into Copy Mode. Start at Level 1!</p>
        </div>

        {LEVELS.map(lvl => (
          <div key={lvl.level} className={`border rounded-2xl overflow-hidden ${lvl.bg}`}>
            <div className={`px-5 py-4 border-b border-current/10`}>
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full bg-current/10 flex items-center justify-center font-mono font-bold text-sm ${lvl.color}`}>{lvl.level}</span>
                <div>
                  <p className={`font-mono font-bold text-sm ${lvl.color}`}>Level {lvl.level}: {lvl.title}</p>
                  <p className="text-xs text-zinc-500">{lvl.commands.length} commands</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {lvl.commands.map((item, i) => (
                <div key={i} onClick={() => handleTryCommand(item.cmd, item.desc)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-900/50 cursor-pointer group transition-all">
                  <code className={`font-mono text-sm font-semibold shrink-0 ${lvl.color}`}>{item.cmd}</code>
                  <span className="text-xs text-zinc-500 flex-1 min-w-0">{item.desc}</span>
                  <button onClick={(e) => handleCopy(item.cmd, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 shrink-0 transition-all">
                    {copiedCmd === item.cmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}