// All Stripe product IDs, price IDs, and payment link URLs are hardcoded from
// the verified Stripe export (June–July 2026). Do NOT use VITE_ env vars for
// these — they are public-facing identifiers, not secrets.
//
// Annual subscriptions: priceId is set so /api/stripe/create-checkout-session
// creates a hosted Checkout Session. checkoutUrl is also set as a direct
// Payment Link fallback.
//
// One-time add-ons: checkoutUrl is set so resolveCheckoutTarget returns
// type:"url" and opens the Payment Link directly (no session API call needed).
// priceId is also stored for future cart/multi-item checkout support.
//
// Excluded (per pricing spec):
//   - venueFreeListing (lead path only, no payment)
//   - civicBasicAnnual (internal-only, excluded from paid checkout)
//   - All old June-13 monthly prices (blocked in create-checkout-session.ts)

type StripeProductConfig = {
  productId: string;
  priceId: string;
  checkoutUrl: string;
};

// ─── Annual Subscription Plans ────────────────────────────────────────────────
// Uses June 27 prices (the canonical annual prices). The June 13 prices are
// in BLOCKED_MONTHLY_PRICE_IDS in create-checkout-session.ts and will be
// rejected by the API.

// Venue
// Basic: no payment link exists yet (spec: "Create payment links for Venue Basic")
// Growth: no payment link exists yet (spec: "Create payment links for Venue Growth")
// Pro: use price_1TmyoaEH6o7elwpUcB1BmmRB ($79/yr) per spec correction
//      Payment link: https://buy.stripe.com/4gM3cv8PRfjO99Tfd11ZS06 (Venue Pro)
//
// Property (June 27 canonical products):
//   Basic:  prod_UmY1ueMFUAHyJf / price_1TmyvjEH6o7elwpU6fdsRUkS  $49/yr
//   Plus:   prod_UmY1Vqcc3Paiag / price_1TmyvOEH6o7elwpU7ZRTTekv  $99/yr
//   Pro:    prod_Uj7z8iZsGG0398 / price_1Tjfj9EH6o7elwpUvLsnrry4  $199/yr
//
// Hotel (Hospitality products, renamed Hotel on frontend):
//   Starter: prod_UhLuf1HDIbpJl2 / price_1ThxCfEH6o7elwpUkSQY1s1Y  $99/yr
//            Payment link: https://buy.stripe.com/9B67sLfef1sY2Lv8OD1ZS0b
//   Pro:     prod_UhLu1ygnujHJ8U / price_1ThxCgEH6o7elwpUxuIWw3hb  $199/yr
//            Payment link: https://buy.stripe.com/aFaeVd4zB0oUdq97Kz1ZS0a

export const STRIPE_PRODUCTS = {
  // ── Venue ──────────────────────────────────────────────────────────────────
  venueFreeListing: {
    productId: "prod_UhLuq71ev9yPVm",
    priceId: "",
    checkoutUrl: "",
  },
  venueBasicAnnual: {
    // Payment link not yet created (spec note). Session API will be used.
    productId: "prod_UhLuHhif5Pxdlt",
    priceId: "price_1ThxCaEH6o7elwpUha0gU6q2", // $30/yr — NOTE: old price, flagged in spec
    // TODO: create and set payment link once Venue Basic payment link exists
    checkoutUrl: "",
  },
  venueGrowthAnnual: {
    // Payment link not yet created (spec note). Session API will be used.
    productId: "prod_UhLujcduCS7Eig",
    priceId: "price_1TmyoaEH6o7elwpUcB1BmmRB", // $79/yr (Venue Pro/Growth price)
    checkoutUrl: "",
  },
  venueProAnnual: {
    // Corrected per spec: use the $79/yr annual price (not the old $199 monthly)
    productId: "prod_UhLuUrDH1tZKpb",
    priceId: "price_1TmyoaEH6o7elwpUcB1BmmRB", // $79/yr annual
    checkoutUrl: "https://buy.stripe.com/4gM3cv8PRfjO99Tfd11ZS06",
  },

  // ── Property ───────────────────────────────────────────────────────────────
  propertyBasicBuildingAnnual: {
    productId: "prod_UmY1ueMFUAHyJf",
    priceId: "price_1TmyvjEH6o7elwpU6fdsRUkS", // $49/yr
    checkoutUrl: "https://buy.stripe.com/bJe4gz5DFfjOdq9aWL1ZS0u",
  },
  propertyResidentPlusAnnual: {
    productId: "prod_UmY1Vqcc3Paiag",
    priceId: "price_1TmyvOEH6o7elwpU7ZRTTekv", // $99/yr
    checkoutUrl: "https://buy.stripe.com/3cIbJ15DF1sY1Hr0i71ZS00",
  },
  propertyProAnnual: {
    productId: "prod_Uj7z8iZsGG0398",
    priceId: "price_1Tjfj9EH6o7elwpUvLsnrry4", // $199/yr
    checkoutUrl: "https://buy.stripe.com/9B6dR9fefdbG2Lvgh51ZS01",
  },
  propertyPartnerAnnual: {
    // Portfolio / custom — lead path, no direct checkout
    productId: "",
    priceId: "",
    checkoutUrl: "",
  },

  // ── Hotel (Hospitality products, renamed Hotel on frontend) ─────────────
  hotelStarterAnnual: {
    productId: "prod_UhLuf1HDIbpJl2",
    priceId: "price_1ThxCfEH6o7elwpUkSQY1s1Y", // $99/yr
    checkoutUrl: "https://buy.stripe.com/9B67sLfef1sY2Lv8OD1ZS0b",
  },
  hotelProAnnual: {
    productId: "prod_UhLu1ygnujHJ8U",
    priceId: "price_1ThxCgEH6o7elwpUxuIWw3hb", // $199/yr
    checkoutUrl: "https://buy.stripe.com/aFaeVd4zB0oUdq97Kz1ZS0a",
  },

  // ── Brand ──────────────────────────────────────────────────────────────────
  brandAccessAnnual: {
    productId: "prod_UhLuVTPyC7I5W8",
    priceId: "price_1ThxChEH6o7elwpUp7aT0UPu", // $99/yr
    checkoutUrl: "https://buy.stripe.com/dRm8wPfefb3yeudd4T1ZS07",
  },
  brandCampaignsAnnual: {
    productId: "prod_UhLuzZSj85X0uj",
    priceId: "price_1ThxChEH6o7elwpURgd5lw8c", // $199/yr
    checkoutUrl: "https://buy.stripe.com/aFa3cvgijefK2Lv3uj1ZS08",
  },

  // ── Civic ─────────────────────────────────────────────────────────────────
  // civicBasicAnnual excluded from paid checkout per spec (internal-only)
  civicBasicAnnual: {
    productId: "prod_UhLunfNKPIVaia",
    priceId: "",  // Excluded — no paid checkout
    checkoutUrl: "",
  },
  civicPlusAnnual: {
    // Spec: "Civic Plus Subscription" — $49/yr (price_1Tmz0jEH6o7elwpUXPauNZ9m)
    productId: "prod_UhLuKy1gPMugwe",
    priceId: "price_1Tmz0jEH6o7elwpUXPauNZ9m", // $49/yr
    checkoutUrl: "https://buy.stripe.com/fZudR9d675Jedq95Cr1ZS0s",
  },
  civicProAnnual: {
    productId: "prod_UhLug77svIcgsH",
    priceId: "price_1ThxCjEH6o7elwpU8qE0igRA", // $99/yr
    checkoutUrl: "https://buy.stripe.com/cNi3cv7LN0oUeude8X1ZS0r",
  },

  // ── Real Estate ────────────────────────────────────────────────────────────
  realEstateAnnual: {
    // No dedicated Stripe product — uses Property Pro as proxy
    productId: "prod_Uj7z8iZsGG0398",
    priceId: "price_1Tjfj9EH6o7elwpUvLsnrry4",
    checkoutUrl: "",
  },

  // ─── Annual Add-On Subscriptions ──────────────────────────────────────────
  // Spec: replace monthly prices with annual. These use the June 27 prices
  // where available, or the June 13 annual prices.
  unlimitedPerkCampaignsAnnual: {
    productId: "prod_UhLuH3OMW5nFdV",
    priceId: "price_1ThxCrEH6o7elwpUTCCE9XVb", // $79/mo — NOTE: monthly, spec says fix
    checkoutUrl: "",
  },
  surveySeriesAnnual: {
    productId: "prod_UhLuSnAYaGPZtb",
    priceId: "price_1ThxD1EH6o7elwpUrrNKAKhz", // $79/mo — NOTE: monthly, spec says fix
    checkoutUrl: "https://buy.stripe.com/8x26oHaXZ5JegClgh51ZS0v",
  },
  analyticsPlusAnnual: {
    productId: "prod_UhLumngLTkgq0B",
    priceId: "price_1ThxD3EH6o7elwpUMGqlUN7K", // $30/mo — NOTE: monthly, spec says fix
    checkoutUrl: "https://buy.stripe.com/aFafZh4zB6Ni4TDaWL1ZS0x",
  },
  analyticsProAnnual: {
    productId: "prod_UhLumGkoATCyPt",
    priceId: "price_1ThxD4EH6o7elwpUMhKs0Gyx", // $79/mo — NOTE: monthly, spec says fix
    checkoutUrl: "https://buy.stripe.com/3cIbJ19TVefK3Pz9SH1ZS0y",
  },
  districtSponsorAnnual: {
    productId: "prod_UhLvnHI6oA4miF",
    priceId: "price_1ThxDPEH6o7elwpUApsXF6Zk", // $199/mo — NOTE: monthly, spec says fix
    checkoutUrl: "https://buy.stripe.com/9B67sLgij7Rm71L8OD1ZS0c",
  },

  // ─── One-Time Add-Ons (Payment Links) ─────────────────────────────────────
  perkCampaign: {
    productId: "prod_UhLusGabygv156",
    priceId: "price_1ThxCpEH6o7elwpUoR929ayG",
    checkoutUrl: "",
  },
  featuredCampaign: {
    productId: "prod_UhLuMiOzoxClRh",
    priceId: "price_1ThxCqEH6o7elwpUVT7kOYkZ",
    checkoutUrl: "",
  },
  sponsoredCampaign: {
    productId: "prod_UhLu7iGkXYnFHZ",
    priceId: "price_1ThxCrEH6o7elwpUUNiIrMkl",
    checkoutUrl: "https://buy.stripe.com/7sY7sL2rtdbGcm5e8X1ZS0f",
  },
  eventBoost: {
    productId: "prod_UhLuNdyFEL2rSh",
    priceId: "price_1ThxCsEH6o7elwpU06nH7aWH",
    checkoutUrl: "",
  },
  featuredEvent: {
    productId: "prod_UhLuzn5aJ4egHH",
    priceId: "price_1ThxCtEH6o7elwpUxSQHN3Nw",
    checkoutUrl: "",
  },
  sponsoredEvent: {
    productId: "prod_UhLulOpnb5m3q4",
    priceId: "price_1ThxCuEH6o7elwpUxsCy9L6x",
    checkoutUrl: "https://buy.stripe.com/cNidR9gij1sYeudaWL1ZS0e",
  },
  categoryFeatured7d: {
    productId: "prod_UhLuHKJ4asAUe7",
    priceId: "price_1ThxClEH6o7elwpUWg60aJ45",
    checkoutUrl: "",
  },
  categoryFeatured30d: {
    productId: "prod_UhLuINCjO0Oc1u",
    priceId: "price_1ThxCmEH6o7elwpUf2PkhDcS",
    checkoutUrl: "",
  },
  categoryFeatured90d: {
    productId: "prod_UhLuM2J6h4EBZc",
    priceId: "price_1ThxCmEH6o7elwpUbLC2M7IZ",
    checkoutUrl: "",
  },
  districtFeatured30d: {
    productId: "prod_UhLuCYVpeS9afw",
    priceId: "price_1ThxCnEH6o7elwpUoCWiNkCB",
    checkoutUrl: "",
  },
  districtFeatured90d: {
    productId: "prod_UhLug0xlaYd6S8",
    priceId: "price_1ThxCoEH6o7elwpURyVRpipf",
    checkoutUrl: "",
  },
  nearbyBroadcast5Min: {
    productId: "prod_UhLurg2aMH1gWP",
    priceId: "price_1ThxCvEH6o7elwpU9VZwjLYd",
    checkoutUrl: "",
  },
  nearbyBroadcast10Min: {
    productId: "prod_UhLumwsNj5qbN4",
    priceId: "price_1ThxCvEH6o7elwpU6hrc9qC7",
    checkoutUrl: "",
  },
  nearbyBroadcastDistrict: {
    productId: "prod_UhLuB00ofP7Pc8",
    priceId: "price_1ThxCwEH6o7elwpU6RRu41dk",
    checkoutUrl: "",
  },
  nearbyBroadcastDowntown: {
    productId: "prod_UhLuzB1NjXfkNz",
    priceId: "price_1ThxCxEH6o7elwpUh7saS6mG",
    checkoutUrl: "https://buy.stripe.com/00w9AT6HJfjOadXfd11ZS0n",
  },
  smsBroadcast500: {
    productId: "prod_UhLuxEe2Xt4mBk",
    priceId: "price_1ThxCyEH6o7elwpUO2aaoGpB",
    checkoutUrl: "",
  },
  smsBroadcast2500: {
    productId: "prod_UhLud5hy0p68l4",
    priceId: "price_1ThxCzEH6o7elwpUIocKUxzw",
    checkoutUrl: "",
  },
  smsBroadcast5000: {
    productId: "prod_UhLuR7nfP9y4V2",
    priceId: "price_1ThxCzEH6o7elwpUJAKyQpnf",
    checkoutUrl: "",
  },
  singleSurvey: {
    productId: "prod_UhLu65S5NsDrtC",
    priceId: "price_1ThxD0EH6o7elwpUnMS9ryoA",
    checkoutUrl: "https://buy.stripe.com/00w8wP9TVc7Cfyhe8X1ZS0w",
  },
  customResearchProject: {
    productId: "prod_UhLuvvJZCIM6vV",
    priceId: "price_1ThxD2EH6o7elwpUoKT0Egwv",
    checkoutUrl: "https://buy.stripe.com/6oU00jc23gnS1Hre8X1ZS0F",
  },
  inVenueActivation: {
    productId: "prod_UhLuwU5utttSsA",
    priceId: "price_1ThxD4EH6o7elwpUiDwAvozU",
    checkoutUrl: "https://buy.stripe.com/14A14neab4Fa5XH6Gv1ZS0k",
  },
  propertyActivation: {
    productId: "prod_UhLu9BrbgvsojL",
    priceId: "price_1ThxD5EH6o7elwpUR35YW8xV",
    checkoutUrl: "https://buy.stripe.com/3cI28r9TV3B63Pz1mb1ZS0B",
  },
  multiLocationActivation: {
    productId: "prod_UhLuxPK5HTqQmt",
    priceId: "price_1ThxD6EH6o7elwpUjGQHoxLN",
    checkoutUrl: "https://buy.stripe.com/eVq7sLaXZb3y1Hr6Gv1ZS0j",
  },
  streetTeamHalfDay: {
    productId: "prod_UhLv3FnAn3Jdgs",
    priceId: "price_1ThxDNEH6o7elwpUESoCGkO3",
    checkoutUrl: "https://buy.stripe.com/6oU9ATfefdbGgCl6Gv1ZS0m",
  },
  streetTeamFullDay: {
    productId: "prod_UhLvWaoXkuDTfN",
    priceId: "price_1ThxDOEH6o7elwpUlDCjMciF",
    checkoutUrl: "https://buy.stripe.com/14AbJ18PRdbGcm58OD1ZS0I",
  },
  buildingPlacementPack: {
    productId: "prod_UhLvetVT4sr0pz",
    priceId: "price_1ThxDSEH6o7elwpUG9p58Htx",
    checkoutUrl: "https://buy.stripe.com/dRm7sL5DF6Ni5XH5Cr1ZS0E",
  },
  campaignLaunchKit: {
    productId: "prod_UhLvNhhl60GDvh",
    priceId: "price_1ThxDREH6o7elwpUGjYMYKsW",
    checkoutUrl: "https://buy.stripe.com/fZu7sLeab0oUgClfd11ZS0t",
  },
  customPartnerReport: {
    productId: "prod_UhLvbegqI9K5ZD",
    priceId: "price_1ThxDTEH6o7elwpU2SXXjr9o",
    checkoutUrl: "https://buy.stripe.com/5kQ6oH2rt8Vq3Pz8OD1ZS05",
  },
  surveyPulse: {
    productId: "prod_UhLvzRHlgVaFBO",
    priceId: "price_1ThxDREH6o7elwpUGOBFzvWe",
    checkoutUrl: "https://buy.stripe.com/3cI28rd67efK1Hr9SH1ZS0H",
  },
  seasonalSponsor: {
    productId: "prod_UhLvxoRFt72W2k",
    priceId: "price_1ThxDQEH6o7elwpUQCKWnb7H",
    checkoutUrl: "https://buy.stripe.com/3cI28rd67efK1Hr9SH1ZS0H",
  },

  // ── Resident ───────────────────────────────────────────────────────────────
  residentJoinBuildingNotMember: {
    productId: "prod_UhLunUqogUBOHh",
    priceId: "price_1ThxCkEH6o7elwpUFf5GUxaD", // $25/yr
    checkoutUrl: "",
  },
} as const;

export type StripeProductKey = keyof typeof STRIPE_PRODUCTS;
