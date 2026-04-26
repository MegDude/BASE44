import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function SkylineFocus({ focus }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !focus) return;

    gsap.killTweensOf(ref.current);

    gsap.fromTo(
      ref.current,
      { scale: 0.75, opacity: 0.42 },
      {
        scale: 1.4,
        opacity: 0.08,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      }
    );
  }, [focus]);

  if (!focus) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-10 rounded-full"
      style={{
        left: `${focus.x}%`,
        top: `${focus.y}%`,
        width: "150px",
        height: "150px",
        background: "rgba(207,175,90,0.30)",
        filter: "blur(24px)",
        transform: "translate(-50%, -50%)"
      }}
      aria-hidden="true"
    />
  );
}
