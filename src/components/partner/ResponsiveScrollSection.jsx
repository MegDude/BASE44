import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ResponsiveScrollSection({
  items = [],
  renderItem,
  getKey,
  desktopClassName = "md:grid-cols-3",
  mobileCardClassName = "w-[86%]",
  gapClassName = "gap-4",
}) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  function updateActiveIndex() {
    const element = scrollRef.current;
    if (!element || safeItems.length <= 1) return;

    const cardWidth = element.scrollWidth / safeItems.length;
    if (!cardWidth) return;
    setActiveIndex(Math.round(element.scrollLeft / cardWidth));
  }

  function scrollToIndex(nextIndex) {
    const element = scrollRef.current;
    if (!element) return;

    const clampedIndex = Math.max(0, Math.min(nextIndex, safeItems.length - 1));
    const cardWidth = element.scrollWidth / safeItems.length;
    element.scrollTo({
      left: clampedIndex * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(clampedIndex);
  }

  return (
    <>
      <div className={`hidden md:grid ${desktopClassName} ${gapClassName}`}>
        {safeItems.map((item, index) => (
          <div key={getKey ? getKey(item, index) : index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      <div className="md:hidden">
        <div
          ref={scrollRef}
          onScroll={updateActiveIndex}
          className={`-mx-6 flex snap-x snap-mandatory overflow-x-auto px-6 pb-3 ${gapClassName} no-scrollbar`}
        >
          {safeItems.map((item, index) => (
            <div
              key={getKey ? getKey(item, index) : index}
              className={`shrink-0 snap-start ${mobileCardClassName}`}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>

        {safeItems.length > 1 ? (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {safeItems.map((item, index) => (
                <button
                  key={getKey ? getKey(item, index) : index}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index
                      ? "w-6 bg-[var(--dp-gold,#C8973A)]"
                      : "w-2 bg-[rgba(11,31,51,0.18)]"
                  }`}
                  aria-label={`Go to item ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex - 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,31,51,0.10)] bg-white text-[var(--dp-navy,#0B1F33)]"
                aria-label="Previous section"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex + 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,31,51,0.10)] bg-white text-[var(--dp-navy,#0B1F33)]"
                aria-label="Next section"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
