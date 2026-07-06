import React from "react";
import { Plus, Terminal, Trash2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SessionSidebar({ sessions, activeId, onSelect, onNew, onDelete }) {
  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h1 className="font-mono text-sm font-semibold text-zinc-100 tracking-wide">SSH Terminal</h1>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onNew}
            className="h-7 w-7 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 && (
          <div className="text-zinc-600 text-xs font-mono text-center py-8 px-4">
            No sessions yet.
            <br />
            Click + to connect.
          </div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelect(session.id)}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
              activeId === session.id
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            }`}
          >
            <Circle
              className={`w-2 h-2 shrink-0 ${
                session.status === "connected" ? "text-emerald-400 fill-emerald-400" : "text-zinc-600 fill-zinc-600"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-medium truncate">{session.name}</p>
              <p className="font-mono text-[10px] text-zinc-600 truncate">
                {session.username}@{session.host}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-transparent"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800">
        <p className="font-mono text-[10px] text-zinc-700 text-center">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}