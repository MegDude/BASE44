import { forwardRef } from "react";

const Section = forwardRef(function Section({ children, className = "" }, ref) {
  return (
    <section ref={ref} className={`mx-auto max-w-6xl px-6 py-16 ${className}`}>
      {children}
    </section>
  );
});

export default Section;
