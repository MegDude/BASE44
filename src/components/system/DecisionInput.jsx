import React, { useState } from "react";
import GlassPanel from "./GlassPanel";

export default function DecisionInput({
  placeholder = "What do you want to know?",
  onSubmit,
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit?.(value);
  };

  return (
    <GlassPanel variant="floating" className="p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs"
        >
          Ask
        </button>
      </form>
    </GlassPanel>
  );
}
