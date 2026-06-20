type GoogleMapEmbedProps = {
  embedUrl: string;
  title?: string;
  className?: string;
};

export default function GoogleMapEmbed({
  embedUrl,
  title = "Location Map",
  className = "",
}: GoogleMapEmbedProps) {
  return (
    <div
      className={[
        "relative w-full overflow-hidden rounded-xl border border-dp-gold/15 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-full pb-[56.25%]">
        <iframe
          title={title}
          src={embedUrl}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
