const brandCards = [
  {
    name: "Fine Eyewear",
    image: "/images/imported/perks/fine-eyewear.png",
    body: "Local retail visibility tied to downtown shopping, errands, and resident offers.",
  },
  {
    name: "YETI",
    image: "/images/imported/perks/yeti-store.png",
    body: "Austin brand moments connected to events, outdoor plans, and nearby discovery.",
  },
  {
    name: "Rivian",
    image: "/images/imported/perks/rivian.png",
    body: "Downtown test-drive interest connected to hotels, residences, and walkable plans.",
  },
];

export default function BrandNetworkShowcase() {
  return (
    <section className="dp-brand-network-showcase">
      {brandCards.map((brand) => (
        <article key={brand.name}>
          <img src={brand.image} alt={brand.name} loading="lazy" decoding="async" />
          <div>
            <strong>{brand.name}</strong>
            <p>{brand.body}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

