import { useState } from "react";

const fallbackImages = {
  hotel: "/images/partners/hospitality-rooftop-social.png",
  residential: "/images/buildings/lobby-to-street-arrival.png",
  map: "/images/splash/walkable-map.png",
  venue: "/images/map-entities/rainey-bars/bangers.jpg",
  retail: "/images/map-entities/brand-fine-eyewear/Oversized-Eyewear-1920w.webp",
  rivian: "/images/map-entities/brand-rivian/8J5L62CIianOYc2pGK7bnSfPHVKIfXD5f2L1WtaTz8q1zatxBiIjQFc9ZTuyRKp9PlKp8gfvhxjcO310jjX8CUNmqQpi6FHS9GciwhJxC953o58_YOMskbnF-WVNCiaTxcL3LQ8uCvfpnWUnJqs57UOf5lyhZgP6kS7WAvH3yrk0qzA-dlHBBWDn2WEpKA_c.jpeg",
  civic: "/images/map-entities/perks/civic_republic_square_1779052838327.png",
  realEstate: "/images/legends-listings/83dcefb7.jpeg",
};

export const campaignImages = {
  qwrFrontDesk: { src: "/images/campaigns/QWR code at front desk.jpeg", fallback: fallbackImages.hotel },
  elevatorQr: { src: "/images/campaigns/elevator QR.jpeg", fallback: fallbackImages.residential },
  mapUi: { src: "/images/campaigns/map ui.jpeg", fallback: fallbackImages.map },
  bangersPoster: { src: "/images/campaigns/campaign poster.jpeg", fallback: fallbackImages.venue },
  fineEyewear: { src: "/images/campaigns/fine eyewear campaign.jpeg", fallback: fallbackImages.retail },
  rivian: { src: "/images/campaigns/rivian campaign.jpeg", fallback: fallbackImages.rivian },
  daa: { src: "/images/campaigns/DAA CAMPAIGN.jpeg", fallback: fallbackImages.civic },
  dana: { src: "/images/campaigns/DANA CAMPAIGN1.jpeg", fallback: fallbackImages.civic },
  legends: { src: "/images/campaigns/legends campaign.jpeg", fallback: fallbackImages.realEstate },
};

export function CampaignImagePanel({ image, eyebrow, title, body }) {
  const [src, setSrc] = useState(image?.src);

  return (
    <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-[18px] border border-[#C8A96A]/20 bg-[#FFFFFF] shadow-sm">
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
        <div className="border-t border-[#C8A96A]/12 p-5">
          {eyebrow && (
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#C8A96A]">
              {eyebrow}
            </div>
          )}
          {title && <div className="font-heading text-lg font-medium text-[#0B1F33]">{title}</div>}
          {body && <p className="mt-2 text-[13px] leading-relaxed text-[#0B1F33]/70">{body}</p>}
        </div>
      )}
    </div>
  );
}

export function StackedCampaignImages({ items }) {
  return (
    <div className="mx-auto grid w-full max-w-[480px] gap-4">
      {items.map((item) => (
        <CampaignImagePanel key={item.title} {...item} />
      ))}
    </div>
  );
}
