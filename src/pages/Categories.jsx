import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Folder, HardDrive, Wifi, Cpu, Info, Terminal, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  {
    id: "files", icon: Folder, label: "Files & Folders", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
    tasks: [
      { label: "List files here", prompt: "list all files and folders in the current directory" },
      { label: "Find a file by name", prompt: "find a file named {filename}", params: [{ key: "filename", placeholder: "e.g. report.pdf" }] },
      { label: "Create a folder", prompt: "create a new folder called {foldername}", params: [{ key: "foldername", placeholder: "e.g. Projects" }] },
      { label: "Copy a file", prompt: "copy a file called {source} to {destination}", params: [{ key: "source", placeholder: "source file" }, { key: "destination", placeholder: "destination" }] },
      { label: "Show hidden files", prompt: "show all files including hidden ones in the current directory" },
      { label: "Delete a file", prompt: "delete the file called {filename}", params: [{ key: "filename", placeholder: "e.g. old.txt" }] },
    ]
  },
  {
    id: "disk", icon: HardDrive, label: "Disk & Memory", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
    tasks: [
      { label: "How much disk space left?", prompt: "show how much disk space I have left on my Mac" },
      { label: "Check RAM usage", prompt: "show how much memory is being used" },
      { label: "Find large files", prompt: "find the largest files on my Mac" },
      { label: "Show disk usage by folder", prompt: "show disk usage for each folder in current directory" },
    ]
  },
  {
    id: "network", icon: Wifi, label: "Network & Wi-Fi", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20",
    tasks: [
      { label: "What's my IP address?", prompt: "show my Mac's IP address" },
      { label: "Ping a website", prompt: "ping {host} to check if it's reachable", params: [{ key: "host", placeholder: "e.g. google.com" }] },
      { label: "Check open ports", prompt: "list all open network ports on my Mac" },
      { label: "Show network interfaces", prompt: "show all network interfaces on my Mac" },
    ]
  },
  {
    id: "processes", icon: Cpu, label: "Apps & Processes", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20",
    tasks: [
      { label: "List running processes", prompt: "show all running processes on my Mac" },
      { label: "Kill an app", prompt: "force quit the application called {appname}", params: [{ key: "appname", placeholder: "e.g. Finder" }] },
      { label: "Top CPU usage", prompt: "show which processes are using the most CPU" },
      { label: "Find what's using a port", prompt: "find what process is using port {port}", params: [{ key: "port", placeholder: "e.g. 3000" }] },
    ]
  },
  {
    id: "sysinfo", icon: Info, label: "System Info", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
    tasks: [
      { label: "macOS version", prompt: "show my macOS version" },
      { label: "System uptime", prompt: "how long has my Mac been running" },
      { label: "CPU info", prompt: "show my CPU model and cores" },
      { label: "Current user & hostname", prompt: "show my current username and computer name" },
    ]
  },
  {
    id: "ssh", icon: Terminal, label: "SSH & Remote", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20",
    tasks: [
      { label: "SSH into a server", prompt: "connect via SSH to {host} as user {username}", params: [{ key: "host", placeholder: "e.g. 192.168.1.1" }, { key: "username", placeholder: "e.g. root" }] },
      { label: "Copy file to remote", prompt: "copy {file} to remote server {host}", params: [{ key: "file", placeholder: "e.g. backup.tar" }, { key: "host", placeholder: "e.g. user@server" }] },
      { label: "Enable Remote Login", prompt: "enable remote login (SSH) on my Mac" },
      { label: "Generate SSH key", prompt: "generate a new SSH key pair on my Mac" },
    ]
  },
];

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTaskClick = (task) => {
    if (task.params?.length) {
      setSelectedTask(task);
      setParamValues({});
    } else {
      translateTask(task.prompt);
    }
  };

  const translateTask = async (promptTemplate) => {
    let prompt = promptTemplate;
    Object.entries(paramValues).forEach(([k, v]) => { prompt = prompt.replace(`{${k}}`, v); });
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Mac terminal expert helping a complete beginner. Translate their plain-English request into a single macOS-compatible shell command. Respond ONLY in JSON with keys: command, explanation (one friendly sentence), risk_level (safe/caution/dangerous), breakdown (array of {part, meaning}). Prefer safest version. If unsafe, return command as empty string.\n\nUser request: "${prompt}"`,
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
      spoken_text: prompt,
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

  const category = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        {selectedCategory ? (
          <button onClick={() => { setSelectedCategory(null); setSelectedTask(null); }} className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <Link to="/" className="text-zinc-400 hover:text-zinc-100"><ArrowLeft className="w-5 h-5" /></Link>
        )}
        <span className="font-mono font-bold text-emerald-400">
          {category ? category.label : "Categories"}
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {!selectedCategory && (
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={`border rounded-2xl p-5 text-left hover:opacity-90 transition-all ${cat.bg}`}>
                  <Icon className={`w-8 h-8 mb-3 ${cat.color}`} />
                  <p className={`font-mono text-sm font-semibold ${cat.color}`}>{cat.label}</p>
                  <p className="text-xs text-zinc-500 mt-1">{cat.tasks.length} tasks</p>
                </button>
              );
            })}
          </div>
        )}

        {selectedCategory && !selectedTask && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : (
              category.tasks.map((task, i) => (
                <button key={i} onClick={() => handleTaskClick(task)}
                  className="w-full text-left bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 hover:border-zinc-500 hover:bg-zinc-800 transition-all flex items-center justify-between group">
                  <span className="font-mono text-sm text-zinc-200">{task.label}</span>
                  <span className="text-zinc-600 group-hover:text-zinc-400">›</span>
                </button>
              ))
            )}
          </div>
        )}

        {selectedTask && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-semibold text-zinc-200">{selectedTask.label}</p>
              <button onClick={() => setSelectedTask(null)} className="text-zinc-500 hover:text-zinc-200"><X className="w-4 h-4" /></button>
            </div>
            {selectedTask.params.map(p => (
              <div key={p.key}>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">{p.key}</label>
                <input
                  value={paramValues[p.key] || ""}
                  onChange={e => setParamValues(v => ({ ...v, [p.key]: e.target.value }))}
                  placeholder={p.placeholder}
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
            <Button
              disabled={loading || selectedTask.params.some(p => !paramValues[p.key]?.trim())}
              onClick={() => translateTask(selectedTask.prompt)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono"
            >
              {loading ? "Generating..." : "Generate Command"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}