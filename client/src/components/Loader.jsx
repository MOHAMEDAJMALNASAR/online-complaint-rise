import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 size={28} className="animate-spin text-brand-600" />
      <p className="text-sm">Loading...</p>
    </div>
  );
}
