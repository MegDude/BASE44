/**
 * Centralized FAQ data for Downtown Perks partner system
 * Organized by page type: homepage, partners, residential, hospitality, venues, brands, civic
 */

export const FAQ_HOMEPAGE = [
  {
    id: 'homepage-1',
    question: 'What is Downtown Perks?',
    answer:
      'Downtown Perks is a live downtown map that brings places, events, perks, buildings, and local context into one working layer. It helps people decide what to do based on what is actually nearby and useful right now.',
  },
  {
    id: 'homepage-2',
    question: 'Do I need to download an app?',
    answer:
      'No. It is a mobile web experience. Open the map, browse, save, RSVP, and use the card when access matters.',
  },
  {
    id: 'homepage-3',
    question: 'Is this just a list of deals?',
    answer:
      'No. Deals and perks are one part of the system, but the map is the product. Downtown Perks brings places, events, perks, buildings, and local context into one usable downtown layer.',
  },
  {
    id: 'homepage-4',
    question: 'Who is it built for?',
    answer:
      'It is built for people who actually live downtown, and for the buildings, hotels, venues, brands, and civic groups that want to meet them there.',
  },
  {
    id: 'homepage-5',
    question: 'How do people use it?',
    answer:
      'People open the map, see what is nearby, and decide what is worth doing now. The card appears later when a save, RSVP, member perk, or redemption actually matters.',
  },
  {
    id: 'homepage-6',
    question: 'Why is the map central?',
    answer:
      'Because the map is the product. It keeps places, events, perks, buildings, and movement in one live downtown layer instead of splitting the experience across feeds, lists, and disconnected pages.',
  },
  {
    id: 'homepage-7',
    question: 'How is performance measured?',
    answer:
      'Performance is measured through useful actions: scans, saves, RSVPs, visits, redemptions, source scans, and repeat use. The point is to show what actually happened, not just what was shown.',
  },
  {
    id: 'homepage-8',
    question: 'Is this one system or multiple?',
    answer:
      'It is one system. The map stays central, the card works as the access layer, and the partner dashboard becomes the proof layer for buildings, hospitality, venues, brands, and civic partners.',
  },
];

export const FAQ_PARTNERS = [
  {
    id: 'partners-1',
    question: 'Are these separate products or one shared system?',
    answer:
      'It is one shared system. Properties, hotels, venues, brands, and civic groups all use the same map and the same action flow.',
  },
  {
    id: 'partners-2',
    question: 'How are properties handled?',
    answer:
      'Properties are still a core part of the system. They are handled as the residential side of the product because that is how people actually use it.',
  },
  {
    id: 'partners-3',
    question: 'What does each partner type get?',
    answer:
      'Everyone gets the same core system: map visibility, nearby discovery, actions, reporting, and planning tools. What changes is how each partner uses it.',
  },
  {
    id: 'partners-4',
    question: 'What actions can users take?',
    answer: 'Save, unlock, redeem, RSVP, book, reserve, navigate, and act directly inside the map.',
  },
  {
    id: 'partners-5',
    question: 'How do examples work?',
    answer:
      'They are live examples tied to the map and the reporting layer, not static case studies.',
  },
  {
    id: 'partners-6',
    question: 'Why does the Brands page go deeper?',
    answer: 'It shows the widest range of ways the system can be used, so it is a helpful reference for the rest of the partner pages.',
  },
  {
    id: 'partners-7',
    question: 'What makes this credible?',
    answer: 'It is tied to real actions people take: scans, saves, RSVPs, visits, and redemptions.',
  },
  {
    id: 'partners-8',
    question: 'What should this feel like?',
    answer: 'One system, one map, and different views for different partner types.',
  },
];

export const FAQ_RESIDENTIAL = [
  {
    id: 'residential-1',
    question: 'How does residential fit into Downtown Perks?',
    answer:
      'Residential turns where someone lives into a stronger entry point into downtown. Buildings become part of the same live map system residents use to decide where to go.',
  },
  {
    id: 'residential-2',
    question: 'What does a building actually offer through this?',
    answer:
      'A building can give residents easy access, move-in onboarding, nearby discovery, local perks, and a stronger amenity experience.',
  },
  {
    id: 'residential-3',
    question: 'Why is this better than a static amenity list?',
    answer:
      'Because residents need something current and useful, not an old list that nobody checks. Downtown Perks shows what is nearby and worth using right now.',
  },
  {
    id: 'residential-4',
    question: 'How do residents get in?',
    answer:
      'They can enter through a QR code, text flow, building-linked access path, or direct sign-up depending on the rollout model.',
  },
  {
    id: 'residential-5',
    question: 'What can a property measure?',
    answer:
      'Buildings can track scans, signups, engagement, repeat use, and local perk use.',
  },
  {
    id: 'residential-6',
    question: 'How does Downtown Perks work with BuildingLink?',
    answer:
      'BuildingLink continues to handle building operations like maintenance, notices, and resident communication. Downtown Perks adds the live neighborhood layer for places, events, perks, and local discovery. One runs the building. The other makes the area around it more usable.',
  },
  {
    id: 'residential-7',
    question: 'What is different between Downtown Perks and BuildingLink?',
    answer:
      'BuildingLink helps run the building. Downtown Perks helps residents decide what to do around it.',
  },
];

export const FAQ_HOSPITALITY = [
  {
    id: 'hospitality-1',
    question: 'How does this work for hotels?',
    answer:
      'Hotels use Downtown Perks as a guest entry point into nearby places, events, local movement, and curated local value.',
  },
  {
    id: 'hospitality-2',
    question: 'Is this meant to replace concierge recommendations?',
    answer:
      'No. It supports concierge teams by making local discovery easier to hand off and easier to measure.',
  },
  {
    id: 'hospitality-3',
    question: 'What guest actions matter most?',
    answer:
      'Scans, map opens, visits, perk use, event interest, and repeat use all show how guests are engaging.',
  },
  {
    id: 'hospitality-4',
    question: 'Can this support event-linked stays?',
    answer:
      'Yes. Hospitality can connect guests to live events, timed prompts, RSVP flows, and follow-up behavior tied to what is happening during the stay.',
  },
  {
    id: 'hospitality-5',
    question: 'Does this only work for perks?',
    answer:
      'No. Perks are only one part of it. The bigger value is helping guests find the right place faster and showing what they actually do next.',
  },
  {
    id: 'hospitality-6',
    question: 'Can this work with the systems we already use?',
    answer:
      'Yes. Downtown Perks is designed to sit alongside the systems a hotel already uses. It adds a live local discovery layer, not a replacement for property operations, payment, or point-of-sale tools.',
  },
  {
    id: 'hospitality-7',
    question: 'How does Downtown Perks work with a POS?',
    answer:
      'A POS records the sale. Downtown Perks helps the guest choose, visit, and engage before the sale happens.',
  },
];

export const FAQ_VENUES = [
  {
    id: 'venues-1',
    question: 'How do venues appear in the system?',
    answer:
      'Venues can appear through map pins, nearby results, perk placements, event-linked visibility, booking actions, and repeat local discovery paths.',
  },
  {
    id: 'venues-2',
    question: 'What makes this different from a listing site?',
    answer:
      'A listing site waits for someone to search. Downtown Perks helps your venue show up when someone nearby is deciding where to go.',
  },
  {
    id: 'venues-3',
    question: 'What kinds of actions can a venue drive?',
    answer:
      'Venues can drive saves, visits, redemptions, RSVPs, bookings, reservations, and repeat neighborhood use.',
  },
  {
    id: 'venues-4',
    question: 'Does this work for both everyday and event-driven traffic?',
    answer:
      'Yes. A venue can stay visible all the time, activate around a specific perk, or tie into live events and timed downtown moments.',
  },
  {
    id: 'venues-5',
    question: 'What proof matters most for venue partners?',
    answer:
      'The proof is simple: opens, saves, scans, redemptions, visits, and repeat customers.',
  },
  {
    id: 'venues-6',
    question: 'Does Downtown Perks replace inKind or our POS?',
    answer:
      'No. It is not a payment tool or a POS. It helps create the visit before the transaction happens.',
  },
  {
    id: 'venues-7',
    question: 'How does Downtown Perks work with inKind?',
    answer:
      'inKind helps with payment-linked value and hospitality transactions. Downtown Perks helps drive the decision before the transaction happens by helping someone choose the place in the first place.',
  },
  {
    id: 'venues-8',
    question: 'How does Downtown Perks work with a POS?',
    answer:
      'A POS tells you what sold. Downtown Perks helps show why someone came in to begin with.',
  },
];

export const FAQ_BRANDS = [
  {
    id: 'brands-1',
    question: 'What kind of brand campaigns fit here?',
    answer:
      'Always-on presence, launch moments, building-led resident access, event-linked campaigns, and useful service-driven activations all fit the system.',
  },
  {
    id: 'brands-2',
    question: 'How is this different from sponsorship placement?',
    answer:
      'This is not just a logo placement. Brands show up inside real downtown moments and real user actions.',
  },
  {
    id: 'brands-3',
    question: 'Can a brand connect to buildings and residents?',
    answer:
      'Yes. Brand campaigns can route through building access, move-in flows, resident prompts, lobby QR placements, and local unlock logic.',
  },
  {
    id: 'brands-4',
    question: 'Can campaigns tie into events and districts?',
    answer:
      'Yes. Brands can activate around live events, timed moments, district relevance, and downtown movement patterns.',
  },
  {
    id: 'brands-5',
    question: 'What makes the Brands page the highest-fidelity page?',
    answer:
      'It covers the widest range of campaign uses, map placements, examples, and reporting, so it sets the standard for the rest of the partner pages.',
  },
  {
    id: 'brands-6',
    question: 'What should a brand be able to measure?',
    answer:
      'Brands should be able to measure scans, saves, visits, redemptions, repeat use, and event engagement.',
  },
  {
    id: 'brands-7',
    question: 'How does Downtown Perks work with inKind?',
    answer:
      'Where relevant, Downtown Perks can drive discovery and local action before a purchase, while inKind can support payment-linked value or transaction handling afterward. One helps create the decision. The other helps handle the spend.',
  },
];

export const FAQ_CIVIC = [
  {
    id: 'civic-1',
    question: 'How does civic fit into the Downtown Perks system?',
    answer:
      'Civic is one of the partner views in the same map system. It helps show public events, districts, and useful local information.',
  },
  {
    id: 'civic-2',
    question: 'What kinds of civic use cases belong here?',
    answer:
      'District visibility, event-led participation, resident outreach, public guidance, seasonal activations, and collaborative downtown moments all fit.',
  },
  {
    id: 'civic-3',
    question: 'Can civic organizations appear on the map like other partners?',
    answer:
      'Yes. Civic groups, districts, public events, and useful civic information can all appear on the same map.',
  },
  {
    id: 'civic-4',
    question: 'What should civic partners be able to measure?',
    answer:
      'They should be able to measure map opens, scans, saves, RSVPs, turnout, and repeat participation.',
  },
  {
    id: 'civic-5',
    question: 'Does this still feel public-facing rather than commercial?',
    answer:
      'Yes. The civic layer should still feel useful and public-facing while giving organizations proof that people are seeing and using it.',
  },
];
