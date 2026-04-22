export default function ResidentProfileTab({ user }) {
  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-medium mb-2">You</h2>
          <p className="text-sm text-muted-foreground">Profile, building context, and resident preferences.</p>
        </div>

        <div className="rounded-xl border border-border/40 bg-white p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Profile</div>
          <div className="mt-3 font-semibold text-foreground">{user?.full_name || "Downtown Resident"}</div>
          <div className="mt-1 text-sm text-muted-foreground">{user?.email || "guest@downtownperks.demo"}</div>
        </div>

        <div className="rounded-xl border border-border/40 bg-white p-4">
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Building</div>
          <div className="mt-3 font-semibold text-foreground">No building linked yet</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Building-aware recommendations and preferences will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}
