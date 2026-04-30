export default function MapShell({ children }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-200">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[url('/map-placeholder.png')] bg-cover grayscale-[0.2]" />
      </div>
      <div className="relative z-10 h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}
