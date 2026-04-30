export default function PageShell({ children, className = "" }) {
  return <div className={`min-h-screen bg-[#f7f7fb] text-[#1A1D2B] ${className}`}>{children}</div>;
}
