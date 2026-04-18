<form className="mx-auto mt-5 max-w-xl rounded-[22px] border border-white/70 bg-white/[0.92] shadow-[0_12px_30px_rgba(14,28,54,0.10)] md:mt-6">
  
  <div className="p-2">
    
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      
      {/* Input container */}
      <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-[hsl(218,20%,86%)] bg-white px-4 transition-colors focus-within:border-primary/40">
        
        <MapPin className="h-4 w-4 flex-shrink-0 text-foreground/45" />
        
        <input
          type="text"
          placeholder="Where should I go right now?"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
        />
      
      </div>

      {/* CTA button */}
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
      >
        Open map
        <ArrowRight className="h-4 w-4" />
      </button>

    </div>

    {/* Filter chips */}
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      
      <button className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all border-[#cfaf5a]/45 bg-[#cfaf5a]/12 text-[hsl(218,42%,14%)]">
        Venues
      </button>

      <button className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all border-white/70 bg-white/76 text-foreground/70 backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:text-foreground">
        Events
      </button>

      <button className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all border-white/70 bg-white/76 text-foreground/70 backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:text-foreground">
        Perks
      </button>

      <button className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all border-white/70 bg-white/76 text-foreground/70 backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:text-foreground">
        5 min walk
      </button>

    </div>

  </div>
</form>
