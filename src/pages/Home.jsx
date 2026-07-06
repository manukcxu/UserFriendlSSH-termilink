import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SessionSidebar from "@/components/terminal/SessionSidebar";
import TerminalOutput from "@/components/terminal/TerminalOutput";
import TerminalInput from "@/components/terminal/TerminalInput";
import ConnectionDialog from "@/components/terminal/ConnectionDialog";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIMULATED_COMMANDS = {
  help: `Available commands:
  help        - Show this help message
  ls          - List directory contents
  pwd         - Print working directory
  whoami      - Display current user
  date        - Show current date and time
  uptime      - Show system uptime
  df          - Display disk usage
  free        - Show memory usage
  uname       - System information
  clear       - Clear terminal
  history     - Show command history
  echo [text] - Print text to terminal
  cat [file]  - Display file contents
  ping [host] - Ping a host`,

  ls: `drwxr-xr-x  2 root root 4096 Jul 06 10:23 .ssh
-rw-r--r--  1 root root  220 Jul 06 09:15 .bashrc
-rw-r--r--  1 root root  807 Jul 06 09:15 .profile
drwxr-xr-x  3 root root 4096 Jul 06 10:40 projects
drwxr-xr-x  2 root root 4096 Jul 06 11:02 logs
-rw-r--r--  1 root root 1024 Jul 06 12:30 config.yml`,

  pwd: "/home/user",
  whoami: null, // dynamic
  date: null, // dynamic
  uptime: " 14:23:05 up 42 days, 3:15,  1 user,  load average: 0.12, 0.08, 0.05",
  df: `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       51200000 12800000  38400000  25% /
tmpfs            4096000        0   4096000   0% /dev/shm
/dev/sdb1      102400000 51200000  51200000  50% /data`,

  free: `              total        used        free      shared  buff/cache   available
Mem:        8192000     3276800     2457600      204800     2457600     4505600
Swap:       2097152      524288     1572864`,

  uname: "Linux server-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux",

  "cat config.yml": `server:
  host: 0.0.0.0
  port: 8080
  workers: 4

database:
  host: localhost
  port: 5432
  name: production_db

logging:
  level: info
  file: /var/log/app.log`,
};

function simulateCommand(cmd, username) {
  const trimmed = cmd.trim().toLowerCase();

  if (trimmed === "clear") return { clear: true };
  if (trimmed === "whoami") return { output: username };
  if (trimmed === "date") return { output: new Date().toString() };
  if (trimmed.startsWith("echo ")) return { output: cmd.slice(5) };
  if (trimmed.startsWith("ping ")) {
    const target = cmd.slice(5).trim();
    return {
      output: `PING ${target} (93.184.216.34): 56 data bytes
64 bytes from 93.184.216.34: icmp_seq=0 ttl=56 time=11.632 ms
64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=11.726 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=56 time=10.683 ms
--- ${target} ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss`,
    };
  }

  if (SIMULATED_COMMANDS[trimmed]) {
    return { output: SIMULATED_COMMANDS[trimmed] };
  }

  // Check for cat with other files
  if (trimmed.startsWith("cat ")) {
    const file = cmd.slice(4).trim();
    if (SIMULATED_COMMANDS[`cat ${file}`]) {
      return { output: SIMULATED_COMMANDS[`cat ${file}`] };
    }
    return { output: `cat: ${file}: No such file or directory`, is_error: true };
  }

  return {
    output: `bash: ${cmd}: command not found`,
    is_error: true,
  };
}

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showConnect, setShowConnect] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await base44.entities.TerminalSession.list("-created_date");
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (form) => {
    try {
      const session = await base44.entities.TerminalSession.create({
        ...form,
        status: "connected",
        command_history: [],
      });
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setShowConnect(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommand = async (cmd) => {
    if (!activeSession) return;
    setProcessing(true);

    // Simulate a small delay
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

    const result = simulateCommand(cmd, activeSession.username);

    if (result.clear) {
      const updated = await base44.entities.TerminalSession.update(activeSession.id, {
        command_history: [],
      });
      setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
      setProcessing(false);
      return;
    }

    const entry = {
      command: cmd,
      output: result.output || "",
      timestamp: new Date().toISOString(),
      is_error: result.is_error || false,
    };

    const newHistory = [...(activeSession.command_history || []), entry];
    const updated = await base44.entities.TerminalSession.update(activeSession.id, {
      command_history: newHistory,
    });
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? updated : s)));
    setProcessing(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.TerminalSession.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(sessions.find((s) => s.id !== id)?.id || null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 flex overflow-hidden">
      {/* Sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onNew={() => setShowConnect(true)}
        onDelete={handleDelete}
      />

      {/* Terminal area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeSession ? (
          <>
            {/* Title bar */}
            <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 shrink-0">
              <div className="flex items-center gap-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="font-mono text-xs text-zinc-400">
                {activeSession.username}@{activeSession.host}:{activeSession.port} — bash
              </span>
            </div>

            {/* Output */}
            <TerminalOutput
              history={activeSession.command_history || []}
              username={activeSession.username}
              host={activeSession.host}
            />

            {/* Input */}
            <TerminalInput
              username={activeSession.username}
              host={activeSession.host}
              onSubmit={handleCommand}
              disabled={processing}
              history={activeSession.command_history || []}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
            <Terminal className="w-16 h-16 mb-4 text-zinc-700" />
            <p className="font-mono text-sm mb-1">No active session</p>
            <p className="font-mono text-xs text-zinc-700 mb-6">Create a new connection to get started</p>
            <Button
              onClick={() => setShowConnect(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-sm"
            >
              New Connection
            </Button>
          </div>
        )}
      </div>

      {/* Connection dialog */}
      <ConnectionDialog open={showConnect} onOpenChange={setShowConnect} onConnect={handleConnect} />
    </div>
  );
}