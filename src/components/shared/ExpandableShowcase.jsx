import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ExpandableShowcase({
  items = [],
  getKey,
  renderMenuMeta,
  renderMenuBody,
  renderDetail,
  initialIndex = 0,
  collapseLabel = "Collapse",
  expandLabel = "Expand",
  className = "",
}) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!safeItems.length) return;
    setActiveIndex((current) => Math.max(0, Math.min(current, safeItems.length - 1)));
  }, [safeItems.length]);

  if (!safeItems.length) return null;

  const activeItem = safeItems[activeIndex] ?? safeItems[0];

  return (
    <div className={className}>
      <div className="hidden lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
        <div className="border-r border-[rgba(11,31,51,0.08)] pr-5">
          <div className="mb-2 flex items-center justify-between gap-3 px-2 py-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Section menu
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-navy)]"
            >
              {collapsed ? expandLabel : collapseLabel}
              {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.div
                key="menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {safeItems.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={getKey ? getKey(item, index) : index}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`w-full border-b border-[rgba(11,31,51,0.08)] px-2 py-4 text-left transition-all ${
                          isActive
                            ? "text-[var(--dp-navy)]"
                            : "text-[rgba(11,31,51,0.78)] hover:text-[var(--dp-navy)]"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {renderMenuMeta ? (
                            <div className="shrink-0">{renderMenuMeta(item, index, isActive)}</div>
                          ) : null}
                          <div className="min-w-0 flex-1">
                            {renderMenuBody ? renderMenuBody(item, index, isActive) : null}
                          </div>
                          <ChevronDown
                            className={`mt-1 h-4 w-4 shrink-0 text-[rgba(11,31,51,0.42)] transition-transform ${
                              isActive ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <motion.div
          key={getKey ? getKey(activeItem, activeIndex) : activeIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border-t border-[rgba(11,31,51,0.08)] pt-6"
        >
          {renderDetail(activeItem, activeIndex)}
        </motion.div>
      </div>

      <div className="space-y-3 lg:hidden">
        {safeItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={getKey ? getKey(item, index) : index}
              className="overflow-hidden border-t border-[rgba(11,31,51,0.08)]"
            >
              <button
                type="button"
                onClick={() => setActiveIndex(isActive ? -1 : index)}
                className="w-full px-0 py-4 text-left"
              >
                <div className="flex items-start gap-4">
                  {renderMenuMeta ? (
                    <div className="shrink-0">{renderMenuMeta(item, index, isActive)}</div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    {renderMenuBody ? renderMenuBody(item, index, isActive) : null}
                  </div>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-[rgba(11,31,51,0.42)] transition-transform ${
                      isActive ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[rgba(11,31,51,0.06)] px-0 pb-4 pt-3">
                      {renderDetail(item, index)}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
