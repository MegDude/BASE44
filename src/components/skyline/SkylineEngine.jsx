import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const SKYLINES = {
  day: "/assets/skyline/skyline-day.webp",
  dusk: "/assets/skyline/skyline-dusk.webp",
  night: "/assets/skyline/skyline-night.webp"
};

export default function SkylineEngine({ mode = "dusk" }) {
  const imageRef = useRef(null);

  useEffect(() => {
    if (!imageRef.current) return;

    gsap.to(imageRef.current, {
      scale: 1.045,
      y: -8,
      duration: 18,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
  }, []);

  useEffect(() => {
    if (!imageRef.current) return;

    gsap.fromTo(
      imageRef.current,
      { opacity: 0.58 },
      { opacity: 1, duration: 1.1, ease: "power2.out" }
    );
  }, [mode]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <img
        ref={imageRef}
        src={SKYLINES[mode] || SKYLINES.dusk}
        alt=""
        className="h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06101d]/70 via-[#06101d]/18 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(207,175,90,0.18),transparent_28rem)] mix-blend-screen" />
    </div>
  );
}
