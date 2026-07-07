import React from "react";
import { Shield, AlertTriangle, Skull } from "lucide-react";

export default function RiskBadge({ level, size = "sm" }) {
  const configs = {
    safe: { icon: Shield, label: "Safe", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    caution: { icon: AlertTriangle, label: "Caution", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    dangerous: { icon: Skull, label: "Dangerous", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const config = configs[level] || configs.safe;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono font-semibold ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}