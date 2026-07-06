import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1];

const sceneVariants = {
  enter: (direction) => ({
    opacity: 0,
    y: direction > 0 ? 18 : -18,
    scale: 0.985,
    filter: "blur(12px)",
  }),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.58, ease },
  },
  exit: (direction) => ({
    opacity: 0,
    y: direction > 0 ? -14 : 14,
    scale: 0.992,
    filter: "blur(8px)",
    transition: { duration: 0.26, ease },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.56, delay, ease },
  }),
};

function normalizeHeadlineRows(scene) {
  if (Array.isArray(scene.headlineGroups)) return scene.headlineGroups;
  if (Array.isArray(scene.headlineParts)) return [scene.headlineParts];
  if (Array.isArray(scene.headline)) return scene.headline.map((text) => [{ text, tone: "navy" }]);
  return [];
}

export default function DowntownPerksStory({
  scenes,
  activeIndex,
  direction,
  onStep,
  onActivate,
}) {
  const reduceMotion = useReducedMotion();
  const scene = scenes[activeIndex] || scenes[0];
  const headlineRows = normalizeHeadlineRows(scene);
  const progress = ((activeIndex + 1) / scenes.length) * 100;

  return (
    <section
      className="dp-story-os"
      data-story-scene={scene.id}
      data-story-active="true"
      aria-label="Downtown Perks story"
    >
      <div className="dp-story-os__frame">
        <div className="dp-story-os__meta" aria-label={`Scene ${activeIndex + 1} of ${scenes.length}`}>
          <span>{scene.index}</span>
          <div aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </div>
          <span>{String(scenes.length).padStart(2, "0")}</span>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={scene.id}
            className="dp-story-os__scene"
            custom={direction}
            variants={sceneVariants}
            initial={reduceMotion ? false : "enter"}
            animate="center"
            exit={reduceMotion ? undefined : "exit"}
          >
            <motion.p
              className="dp-story-os__kicker"
              variants={itemVariants}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              custom={0.02}
            >
              {scene.kicker}
            </motion.p>

            <motion.h1
              className="dp-story-os__headline"
              variants={itemVariants}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              custom={0.08}
            >
              {headlineRows.map((row, rowIndex) => (
                <span key={`${scene.id}-row-${rowIndex}`} className="dp-story-os__headline-row">
                  {row.map((part, partIndex) => (
                    <motion.span
                      key={`${scene.id}-${part.text}-${partIndex}`}
                      className="dp-story-os__headline-part"
                      data-tone={part.tone === "gold" ? "gold" : "navy"}
                      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.48, delay: 0.12 + rowIndex * 0.08 + partIndex * 0.04, ease }}
                    >
                      {part.text}
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.h1>

            {scene.meaning ? (
              <motion.p
                className="dp-story-os__meaning"
                variants={itemVariants}
                initial={reduceMotion ? false : "hidden"}
                animate="visible"
                custom={0.2}
              >
                {scene.meaning}
              </motion.p>
            ) : null}

            {scene.supporting?.length ? (
              <motion.div
                className="dp-story-os__supporting"
                variants={itemVariants}
                initial={reduceMotion ? false : "hidden"}
                animate="visible"
                custom={scene.meaning ? 0.28 : 0.2}
              >
                {scene.supporting.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </motion.div>
            ) : null}
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="dp-story-os__controls" aria-label="Story controls">
        <button type="button" onClick={() => onStep(-1)} disabled={activeIndex === 0} aria-label="Previous story scene">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div className="dp-story-os__progress" aria-label={`Story scene ${activeIndex + 1} of ${scenes.length}`}>
          <span>{scene.index}</span>
          <div><i style={{ width: `${progress}%` }} /></div>
          <span>{String(scenes.length).padStart(2, "0")}</span>
        </div>
        <div className="dp-story-os__dots" aria-label="Story scenes">
          {scenes.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              aria-label={`Show ${item.navLabel}`}
              aria-current={index === activeIndex ? "step" : undefined}
              onClick={() => onActivate(index)}
            />
          ))}
        </div>
        <button type="button" onClick={() => onStep(1)} disabled={activeIndex === scenes.length - 1} aria-label="Next story scene">
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
