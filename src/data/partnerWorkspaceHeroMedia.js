export const PARTNER_WORKSPACE_HERO_MEDIA = {
  "demo-org-waterloo-greenway": {
    src: "/images/map-entities/refresh/civic/waterloo-trail.jpeg",
    alt: "The shaded trail and restored landscape at Waterloo Park in downtown Austin.",
    caption: "Waterloo Park · Waller Creek",
    width: 1600,
    height: 1066,
    position: "center 48%",
  },
  "demo-org-legends-real-estate": {
    src: "/images/properties/the-shore/hero.jpg",
    alt: "The Shore residential tower rising beside Lady Bird Lake in downtown Austin.",
    caption: "The Shore · Rainey District",
    width: 2400,
    height: 1599,
    position: "center 46%",
  },
  "demo-org-larry-and-guy": {
    src: "/images/workspace-media/red-ash.jpg",
    alt: "The wood-fired kitchen and dining room at Red Ash in downtown Austin.",
    caption: "Red Ash · Colorado Street",
    width: 1400,
    height: 700,
    position: "center 52%",
  },
  "demo-org-hotel-van-zandt": {
    src: "/images/imported/perks/hotel-van-zandt-2560x1570.webp",
    alt: "Hotel Van Zandt overlooking the Rainey District and Lady Bird Lake.",
    caption: "Hotel Van Zandt · Rainey District",
    width: 2560,
    height: 1570,
    position: "center 50%",
  },
  "demo-org-yeti": {
    src: "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg",
    alt: "The YETI Flagship store interior on South Congress Avenue in Austin.",
    caption: "YETI Flagship · South Congress",
    width: 1200,
    height: 800,
    position: "center 52%",
  },
};

export const DEFAULT_PARTNER_WORKSPACE_HERO_MEDIA = {
  src: "/images/map-entities/refresh/civic/waterloo-park.jpeg",
  alt: "Waterloo Park and the downtown Austin skyline.",
  caption: "Downtown Austin",
  width: 1200,
  height: 675,
  position: "center 48%",
};

export function getPartnerWorkspaceHeroMedia(organizationId) {
  return PARTNER_WORKSPACE_HERO_MEDIA[organizationId] || DEFAULT_PARTNER_WORKSPACE_HERO_MEDIA;
}
