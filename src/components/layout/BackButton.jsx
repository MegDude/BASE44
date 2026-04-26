export default function BackButton({ fallback = "/" }) {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = fallback;
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="dp-control min-h-10 px-4 text-sm font-semibold text-[var(--dp-navy)]"
    >
      ← Back
    </button>
  );
}
