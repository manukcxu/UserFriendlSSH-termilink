import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";

export default function ConnectionDialog({ open, onOpenChange, onConnect, initialData }) {
  const [form, setForm] = useState(initialData || {
    name: "",
    host: "",
    port: 22,
    username: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConnect(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-700 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100 font-mono">
            <Monitor className="w-5 h-5 text-emerald-400" />
            New Connection
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Session Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My Server"
              required
              className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Host</Label>
              <Input
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                placeholder="192.168.1.1"
                required
                className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Port</Label>
              <Input
                type="number"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 22 })}
                className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Username</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="root"
              required
              className="bg-zinc-800 border-zinc-600 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono">
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}