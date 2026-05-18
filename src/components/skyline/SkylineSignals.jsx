import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function SkylineSignals({ signals = [] }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const nodes = rootRef.current.querySelectorAll(".dp-skyline-pulse");
    gsap.killTweensOf(nodes);

    if (!nodes.length) return;

    gsap.fromTo(
      nodes,
      { scale: 0.55, opacity: 0.52 },
      {
        scale: 1.85,
        opacity: 0,
        duration: 2.2,
        repeat: -1,
        stagger: 0.08,
        ease: "power2.out"
      }
    );
  }, [signals]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      {signals.map((signal, index) => {
        const size = Math.max(8, Math.min(34, 7 + Number(signal.intensity || 1) * 0.2));

        return (
          <div
            key={`${signal.x}-${signal.y}-${index}`}
            className="dp-skyline-pulse absolute rounded-full"
            style={{
              left: `${signal.x}%`,
              top: `${signal.y}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: "rgba(207,175,90,0.86)",
              boxShadow: "0 0 30px rgba(207,175,90,0.42)",
              transform: "translate(-50%, -50%)"
            }}
          />
        );
      })}
    </div>
  );
}
