export default function SectionContainer({
  children,
  className = "",
  width = "content",
  as: Component = "section",
}) {
  const widthClass =
    width === "wide"
      ? "max-w-6xl"
      : width === "narrow"
        ? "max-w-[680px]"
        : "max-w-[720px]";

  return (
    <Component className={`px-4 md:px-6 ${className}`.trim()}>
      <div className={`mx-auto w-full ${widthClass}`}>{children}</div>
    </Component>
  );
}
