export type MapLocation = {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  perk: string;
  description: string;
  distance: string;
  status: string;
  popularity?: number;
  boost?: { active: boolean; weight?: number; expiresAt?: number };
};

export const mapData: MapLocation[] = [
  {
    id: "houndstooth",
    name: "Houndstooth",
    category: "Cafe",
    address: "401 Congress Ave, Austin, TX",
    lat: 30.2669,
    lng: -97.7428,
    perk: "Resident drip + pastry pairing",
    description:
      "A steady coffee anchor for quick solo resets, laptop mornings, and post-walk regrouping.",
    distance: "0.2 mi",
    status: "Open now",
    popularity: 8,
  },
  {
    id: "jos-coffee",
    name: "Jo's Coffee",
    category: "Cafe",
    address: "242 W 2nd St, Austin, TX",
    lat: 30.2654,
    lng: -97.7461,
    perk: "Free pastry with any large coffee",
    description:
      "Fast neighborhood coffee without losing the sense that you are still in downtown.",
    distance: "0.3 mi",
    status: "Open until 7 PM",
    popularity: 7,
  },
  {
    id: "halcyon",
    name: "Halcyon",
    category: "Coworking",
    address: "218 W 4th St, Austin, TX",
    lat: 30.2661,
    lng: -97.7459,
    perk: "Late-afternoon espresso tonic on the house",
    description:
      "The in-between space for coffee, coworking, and an easy shift into evening plans.",
    distance: "0.4 mi",
    status: "Open now",
    popularity: 7,
    boost: { active: true, weight: 2 },
  },
  {
    id: "caroline",
    name: "Upstairs at Caroline",
    category: "Dining",
    address: "621 Congress Ave Suite 201, Austin, TX",
    lat: 30.2687,
    lng: -97.7424,
    perk: "Members-only happy hour flight",
    description:
      "Reliable downtown dinner energy with an easy handoff from office, hotel, or building lobby.",
    distance: "0.5 mi",
    status: "Happy hour live",
    popularity: 9,
    boost: { active: true, weight: 3 },
  },
  {
    id: "van-zandt",
    name: "Hotel Van Zandt",
    category: "Hotel",
    address: "605 Davis St, Austin, TX",
    lat: 30.2608,
    lng: -97.7387,
    perk: "Guest welcome perks and rooftop access",
    description:
      "A polished hotel stop that ties resident and guest experience into the same downtown layer.",
    distance: "0.6 mi",
    status: "Open today",
    popularity: 6,
  },
];
