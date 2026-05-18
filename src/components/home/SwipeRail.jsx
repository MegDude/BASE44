import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SwipeRail({
  items = [],
  renderItem,
  getKey,
  className = "",
  cardClassName = "w-[88%] sm:w-[72%] lg:w-[46%] xl:w-[38%]",
  showDots = true,
  showArrows = true,
}) {
  const railRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  function updateActiveIndex() {
    const element = railRef.current;
    if (!element || safeItems.length <= 1) return;

    const cards = Array.from(element.querySelectorAll("[data-rail-card='true']"));
    if (!cards.length) return;

    const railLeft = element.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardLeft = card.getBoundingClientRect().left - railLeft;
      const distance = Math.abs(cardLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  function scrollToIndex(index) {
    const element = railRef.current;
    if (!element) return;

    const cards = Array.from(element.querySelectorAll("[data-rail-card='true']"));
    const clampedIndex = Math.max(0, Math.min(index, cards.length - 1));
    const target = cards[clampedIndex];
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActiveIndex(clampedIndex);
  }

  return (
    <div className={className}>
      <div
        ref={railRef}
        onScroll={updateActiveIndex}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:-mx-6 md:px-6"
      >
        {safeItems.map((item, index) => (
          <div
            key={getKey ? getKey(item, index) : index}
            data-rail-card="true"
            className={`shrink-0 snap-start ${cardClassName}`}
          >
            {renderItem(item, index, activeIndex === index)}
          </div>
        ))}
      </div>

      {(showDots || showArrows) && safeItems.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          {showDots ? (
            <div className="flex items-center gap-1.5">
              {safeItems.map((item, index) => (
                <button
                  key={getKey ? getKey(item, index) : index}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index
                      ? "w-6 bg-[var(--dp-gold-muted)]"
                      : "w-2 bg-[rgba(11,26,43,0.18)]"
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
          ) : (
            <div />
          )}

          {showArrows ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex - 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,26,43,0.10)] bg-white text-[var(--dp-navy)]"
                aria-label="Previous card"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(activeIndex + 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(11,26,43,0.10)] bg-white text-[var(--dp-navy)]"
                aria-label="Next card"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
