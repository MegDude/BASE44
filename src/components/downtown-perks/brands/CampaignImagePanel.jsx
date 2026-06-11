import { useState } from "react";

const fallbackImages = {
  hotel: "/images/partners/hospitality-rooftop-social.png",
  residential: "/images/buildings/lobby-to-street-arrival.png",
  map: "/images/splash/walkable-map.png",
  venue: "/images/map-entities/rainey-bars/bangers.jpg",
  retail: "/images/map-entities/brand-fine-eyewear/Oversized-Eyewear-1920w.webp",
  rivian: "/images/map-entities/brand-rivian/8J5L62CIianOYc2pGK7bnSfPHVKIfXD5f2L1WtaTz8q1zatxBiIjQFc9ZTuyRKp9PlKp8gfvhxjcO310jjX8CUNmqQpi6FHS9GciwhJxC953o58_YOMskbnF-WVNCiaTxcL3LQ8uCvfpnWUnJqs57UOf5lyhZgP6kS7WAvH3yrk0qzA-dlHBBWDn2WEpKA_c.jpeg",
  civic: "/images/imported/perks/republic-square.jpg",
  realEstate: "/images/legends-listings/83dcefb7.jpeg",
};

export const campaignImages = {
  qwrFrontDesk: { src: "/images/imported/perks/qwr-code-at-front-desk.png", fallback: fallbackImages.hotel },
  elevatorQr: { src: "/images/imported/perks/elevator-qr.png", fallback: fallbackImages.residential },
  mapUi: { src: "/images/imported/perks/map-ui.png", fallback: fallbackImages.map },
  bangersPoster: { src: "/images/imported/perks/scan-poster.png", fallback: fallbackImages.venue },
  fineEyewear: { src: "/images/imported/perks/fine-eyewear-campaign.png", fallback: fallbackImages.retail },
  rivian: { src: "/images/imported/perks/rivian-campaign.png", fallback: fallbackImages.rivian },
  daa: { src: "/images/imported/perks/daa-campaign.png", fallback: fallbackImages.civic },
  dana: { src: "/images/imported/perks/dana-campaign1.png", fallback: fallbackImages.civic },
  legends: { src: "/images/imported/perks/legends-campaign.png", fallback: fallbackImages.realEstate },
};

export function CampaignImagePanel({ image, eyebrow, title, body }) {
  const [src, setSrc] = useState(image?.src);

  return (
    <figure className="dp-editorial-media mx-auto w-full max-w-[480px]">
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => {
            if (image?.fallback && src !== image.fallback) setSrc(image.fallback);
          }}
        />
      </div>
      {(eyebrow || title || body) && (
        <figcaption className="sr-only">
          {[eyebrow, title, body].filter(Boolean).join(". ")}
        </figcaption>
      )}
    </figure>
  );
}

export function StackedCampaignImages({ items }) {
  return (
    <div className="mx-auto grid w-full max-w-[480px] gap-4">
      {items.slice(0, 1).map((item) => (
        <CampaignImagePanel key={item.title} {...item} />
      ))}
    </div>
  );
}
