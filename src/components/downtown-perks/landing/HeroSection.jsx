<form
  onSubmit={(e) => {
    e.preventDefault();
    console.log("Search:", query); // hook this to map later
  }}
  className="mx-auto mt-5 max-w-xl rounded-[22px] border border-white/70 bg-white shadow-[0_12px_30px_rgba(14,28,54,0.10)] md:mt-6"
>
  <div className="p-2">
    
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      
      {/* INPUT */}
      <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-[hsl(218,20%,80%)] bg-white px-4 transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]">
        
        <MapPin className="h-4 w-4 flex-shrink-0 text-foreground/45" />
        
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Where should I go right now?"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
        />
      
      </div>

      {/* OPEN MAP (SEARCH ACTION) */}
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
      >
        Open map
        <ArrowRight className="h-4 w-4" />
      </button>

    </div>

    {/* FILTER CHIPS */}
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      
      <button
        type="button"
        onClick={() => setQuery("restaurants nearby")}
        className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all border-[#cfaf5a]/45 bg-[#cfaf5a]/12 text-[hsl(218,42%,14%)]"
      >
        Venues
      </button>

      <button
        type="button"
        onClick={() => setQuery("events tonight")}
        className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all border-white/70 bg-white/76 text-foreground/70 backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:text-foreground"
      >
        Events
      </button>

      <button
        type="button"
        onClick={() => setQuery("local deals and perks")}
        className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all border-white/70 bg-white/76 text-foreground/70 backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:text-foreground"
      >
        Perks
      </button>

      <button
        type="button"
        onClick={() => setQuery("things within 5 minute walk")}
        className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all border-white/70 bg-white/76 text-foreground/70 backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:text-foreground"
      >
        5 min walk
      </button>

    </div>

  </div>
</form>
