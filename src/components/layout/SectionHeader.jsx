export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-10">
      <h2 className="font-heading text-[28px] font-semibold tracking-tight text-[#1A1D2B]">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
