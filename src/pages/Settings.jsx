import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Server, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

export default function Settings() {
  const [connections, setConnections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [form, setForm] = useState({ name: "", host: "", port: 22, username: "", encrypted_credential: "", credential_type: "password" });
  const [saving, setSaving] = useState(false);
  const [voiceLang, setVoiceLang] = useState(localStorage.getItem("voice_lang") || "en-US");

  useEffect(() => {
    base44.entities.SSHConnection.list().then(setConnections);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const conn = await base44.entities.SSHConnection.create(form);
    setConnections(prev => [...prev, conn]);
    setForm({ name: "", host: "", port: 22, username: "", encrypted_credential: "", credential_type: "password" });
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.SSHConnection.delete(id);
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const handleLangChange = (lang) => {
    setVoiceLang(lang);
    localStorage.setItem("voice_lang", lang);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <Link to="/" className="text-zinc-400 hover:text-zinc-100"><ArrowLeft className="w-5 h-5" /></Link>
        <span className="font-mono font-bold text-emerald-400">Settings</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Voice Language */}
        <section>
          <h2 className="font-mono text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Voice Language</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { code: "en-US", label: "English (US)" }, { code: "en-GB", label: "English (UK)" },
              { code: "es-ES", label: "Español" }, { code: "fr-FR", label: "Français" },
              { code: "de-DE", label: "Deutsch" }, { code: "zh-CN", label: "中文" },
            ].map(l => (
              <button key={l.code} onClick={() => handleLangChange(l.code)}
                className={`px-3 py-2 rounded-lg text-sm font-mono border transition-all ${voiceLang === l.code ? "bg-emerald-600 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </section>

        {/* SSH Connections */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4" /> SSH Connections
            </h2>
            <Button size="sm" onClick={() => setShowForm(!showForm)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>

          {connections.length === 0 && !showForm && (
            <p className="text-sm text-zinc-600 font-mono text-center py-6 bg-zinc-900 rounded-xl border border-zinc-800">No SSH connections saved yet.</p>
          )}

          <div className="space-y-2">
            {connections.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3">
                <div>
                  <p className="font-mono text-sm text-zinc-200">{c.name}</p>
                  <p className="font-mono text-xs text-zinc-500">{c.username}@{c.host}:{c.port}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-zinc-600 hover:text-red-400 p-1 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {showForm && (
            <form onSubmit={handleSave} className="mt-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Session Name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Mac" required className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Host / IP</Label>
                  <Input value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} placeholder="192.168.1.x" required className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Port</Label>
                  <Input type="number" value={form.port} onChange={e => setForm({ ...form, port: parseInt(e.target.value) || 22 })} className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono focus:border-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Username</Label>
                  <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="your-mac-username" required className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Credential Type</Label>
                  <select value={form.credential_type} onChange={e => setForm({ ...form, credential_type: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500">
                    <option value="password">Password</option>
                    <option value="private_key">Private Key</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                    {form.credential_type === "private_key" ? "Private Key (PEM)" : "Password"}
                  </Label>
                  <Input type={form.credential_type === "password" ? "password" : "text"} value={form.encrypted_credential}
                    onChange={e => setForm({ ...form, encrypted_credential: e.target.value })}
                    placeholder={form.credential_type === "private_key" ? "-----BEGIN OPENSSH PRIVATE KEY-----" : "••••••••"}
                    className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 text-zinc-400 hover:bg-zinc-800">Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono">
                  {saving ? "Saving..." : "Save Connection"}
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Setup Guide */}
        <section>
          <button onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 hover:border-zinc-500 transition-all">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-sm text-zinc-300">SSH Setup Guide</span>
            </div>
            {showGuide ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>

          {showGuide && (
            <div className="mt-2 bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4 text-sm text-zinc-400">
              <div>
                <p className="font-mono font-semibold text-cyan-400 mb-2">Step 1 — Enable Remote Login on your Mac</p>
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Open <strong className="text-zinc-300">System Settings</strong> on your Mac</li>
                  <li>Go to <strong className="text-zinc-300">General → Sharing</strong></li>
                  <li>Turn on <strong className="text-zinc-300">Remote Login</strong></li>
                  <li>Note your Mac's username and local IP (shown under Remote Login)</li>
                </ol>
              </div>
              <div>
                <p className="font-mono font-semibold text-cyan-400 mb-2">Step 2 — (Recommended) Install Tailscale</p>
                <p className="leading-relaxed">Tailscale is a free VPN that makes your Mac reachable from anywhere without changing router settings. Download from <strong className="text-zinc-300">tailscale.com</strong>, sign in, and your Mac gets a stable IP like <code className="font-mono text-xs bg-zinc-800 px-1 py-0.5 rounded">100.x.x.x</code>. Use that as the host above.</p>
              </div>
              <div>
                <p className="font-mono font-semibold text-cyan-400 mb-2">Step 3 — Add the connection above</p>
                <p>Use your Tailscale IP (or local IP if on the same network), your Mac username, and password.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}