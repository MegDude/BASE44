export const PARTNER_WORKSPACE_HERO_MEDIA = {
  "demo-org-waterloo-greenway": {
    src: "/images/map-entities/refresh/civic/waterloo-trail.jpeg",
    alt: "The shaded trail and restored landscape at Waterloo Park in downtown Austin.",
    caption: "Waterloo Park · Waller Creek",
    label: "Park in focus",
    headline: "Turn park discovery into repeat visits.",
    summary: "Use routes, events, and nearby recommendations to help more people return to Waterloo Park and the Waller Creek corridor.",
    width: 1600,
    height: 1066,
    position: "center 48%",
  },
  "demo-org-legends-real-estate": {
    src: "/images/properties/the-shore/hero.jpg",
    alt: "The Shore residential tower rising beside Lady Bird Lake in downtown Austin.",
    caption: "The Shore · Rainey District",
    label: "Listing in focus",
    headline: "Turn search interest into the right property choice.",
    summary: "Use current search demand to guide the next downtown comparison, listing update, and map-visible campaign.",
    width: 2400,
    height: 1599,
    position: "center 46%",
  },
  "demo-org-larry-and-guy": {
    src: "/images/workspace-media/red-ash.jpg",
    alt: "The wood-fired kitchen and dining room at Red Ash in downtown Austin.",
    caption: "Red Ash · Colorado Street",
    label: "Portfolio in focus",
    headline: "Bring five restaurants into one clear dining plan.",
    summary: "Connect each restaurant to the shared passport, then give residents one simple reason to explore the portfolio.",
    width: 1400,
    height: 700,
    position: "center 52%",
  },
  "demo-org-hotel-van-zandt": {
    src: "/images/imported/perks/hotel-van-zandt-2560x1570.webp",
    alt: "Hotel Van Zandt overlooking the Rainey District and Lady Bird Lake.",
    caption: "Hotel Van Zandt · Rainey District",
    label: "Guest experience",
    headline: "Help every guest find the right Rainey moment.",
    summary: "Connect the hotel stay to nearby dining, music, events, and recommendations guests can use without extra planning.",
    width: 2560,
    height: 1570,
    position: "center 50%",
  },
  "demo-org-yeti": {
    src: "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg",
    alt: "The YETI Flagship store interior on South Congress Avenue in Austin.",
    caption: "YETI Flagship · South Congress",
    label: "Flagship in focus",
    headline: "Connect the flagship to downtown adventure.",
    summary: "Turn the South Congress store into the starting point for useful routes, local events, and brand experiences across Austin.",
    width: 1200,
    height: 800,
    position: "center 52%",
  },
};

export const DEFAULT_PARTNER_WORKSPACE_HERO_MEDIA = {
  src: "/images/map-entities/refresh/civic/waterloo-park.jpeg",
  alt: "Waterloo Park and the downtown Austin skyline.",
  caption: "Downtown Austin",
  label: "Place in focus",
  headline: "See what needs attention and what is working.",
  summary: "Review the places connected here, publish the next useful update, and use current results to choose what happens next.",
  width: 1200,
  height: 675,
  position: "center 48%",
};

export function getPartnerWorkspaceHeroMedia(organizationId) {
  return PARTNER_WORKSPACE_HERO_MEDIA[organizationId] || DEFAULT_PARTNER_WORKSPACE_HERO_MEDIA;
}
