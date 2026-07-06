import { Link } from "react-router-dom";

const brandCards = [
  {
    name: "Fine Eyewear",
    type: "Discovery Trail",
    image: "/images/imported/perks/fine-eyewear-campaign.png",
    body: "A Waterloo Greenway partnership built around design, architecture, nature, art, and seeing Austin differently.",
    example: "Turn a brand partnership into a permanent discovery trail with resident perks and Golden Hour events.",
    href: "/map?mode=partner&tab=map&filter=Discovery%20Trails&entityId=campaign-see-austin-differently-fine-eyewear",
  },
  {
    name: "YETI",
    type: "Austin brand",
    image: "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg",
    body: "Trail mornings, event days, hotel guests, and outdoor plans connected to a useful local offer.",
    example: "Pair a gear moment with lake walks, music nights, or rooftop events.",
    href: "/brands/yeti",
  },
  {
    name: "Rivian",
    type: "Mobility",
    image: "/images/imported/perks/rivian.png",
    body: "Test drives, ride requests, hotel routes, and weekend errands placed inside real downtown routines.",
    example: "Book a drive between coffee, the trail, brunch, or dinner.",
    href: "/brands/rivian",
  },
  {
    name: "Lululemon",
    type: "Wellness",
    image: "/images/imported/perks/lulu-lemon-campoaign.png",
    body: "Run clubs, yoga mornings, recovery stops, and resident wellness moments that feel native to downtown.",
    example: "Connect a class to nearby coffee, trails, and buildings.",
    href: "/brands/lululemon",
  },
  {
    name: "inKind",
    type: "Dining",
    image: "/images/partner/drop-in-images/inkind-table-spread.jpg",
    body: "Dining value attached to restaurants people are already choosing from the map.",
    example: "Create the restaurant decision first, then make the benefit easy to use.",
    href: "/brands/inkind",
  },
  {
    name: "Hotel Van Zandt",
    type: "Hotel",
    image: "/images/imported/perks/hotel-van-zandt-entrance.jpg",
    body: "Guest recommendations, lobby moments, music nights, and nearby dining connected in one place.",
    example: "Turn concierge suggestions into saved map routes.",
    href: "/brands/hotel-van-zandt",
  },
];

export default function BrandNetworkShowcase() {
  return (
    <section className="dp-brand-network-showcase" aria-label="Partner brand examples">
      {brandCards.map((brand) => (
        <Link key={brand.name} to={brand.href} className="dp-brand-network-card">
          <img src={brand.image} alt={brand.name} loading="lazy" decoding="async" />
          <div>
            <span>{brand.type}</span>
            <strong>{brand.name}</strong>
            <p>{brand.body}</p>
            <em>{brand.example}</em>
          </div>
        </Link>
      ))}
    </section>
  );
}
