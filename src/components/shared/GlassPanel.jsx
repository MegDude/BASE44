export default function GlassPanel({ children, className = "" }) {
  return (
    <div className={`rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-[rgba(255,255,255,0.72)] shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-[18px] ${className}`}>
      {children}
    </div>
  );
}
