export const collectionOperatingGoals = [
  { value: "1", label: "building pilot" },
  { value: "1", label: "hospitality pilot" },
  { value: "1", label: "written expansion path" },
  { value: "30", label: "day proof recap" },
];

export const collectionPriorityTargets = [
  {
    id: "greystar-lv",
    name: "Greystar + LV Collective",
    segment: "Residential",
    pilot: "Paseo joint pilot",
    approvalRoute: "Renee Zahn — Greystar Managing Director, Property Management, Central West; Jonathan Reyes — President, LV Collective",
    operatingRoute: "Jarrod Byer — supplied Paseo property-management route, reconfirm before outreach; Louie Colella — SVP, Property Management, LV Collective",
    contactPath: "Paseo: leasing@paseoatx.com · 512-856-5117. Greystar property route: 737-738-8129. LV Collective office: 512-410-0342.",
    confidence: "Renee Zahn, Jonathan Reyes, and Louie Colella are supported by current company leadership pages. Paseo-level authority, Jarrod Byer’s current role, joint signing, legal review, and resident-communications ownership require confirmation.",
    nextAction: "Confirm the signer, resident-communications owner, legal/vendor review, property operator, and one follow-on Austin property.",
    message: "Hi [Name] — Downtown Perks would like to invite Paseo into a focused 60–90 day resident pilot: one resident communication, one lobby QR touchpoint, and a 30-day engagement recap. Could you confirm who can approve the joint LV/Greystar scope, who owns resident communications and legal review, and who should run the pilot day to day?",
    sources: [
      ["Greystar — Renee Zahn", "https://www.greystar.com/contact-us/our-people/renee-zahn"],
      ["LV Collective — Jonathan Reyes", "https://lvcollective.com/team/jonathan-reyes/"],
      ["LV Collective — Louie Colella", "https://lvcollective.com/team/louie-colella/"],
      ["Paseo", "https://www.greystar.com/properties/austin-tx/paseo"],
    ],
  },
  {
    id: "worth-ross",
    name: "Worth Ross / WRMC",
    segment: "Residential portfolio",
    pilot: "One downtown condo + two follow-on communities",
    approvalRoute: "Kasidy Schaub — proposed Austin regional route; Andrea Willett — executive escalation",
    operatingRoute: "SaraMarie Blunt, Jack Thuet, or Rikki Conner + the selected community manager",
    contactPath: "CustomerCare@worthross.com · 214-522-1943. Portal support: info4hoa@worthross.com · 855-435-4596.",
    confidence: "Company channels are available. Kasidy Schaub’s current title and portfolio scope, the operating contact, and the association approval path require verification.",
    nextAction: "Verify the Austin portfolio lead, select one board-ready property, and document the HOA approval path.",
    message: "Hi [Name] — Downtown Perks is inviting one downtown Worth Ross community into a low-lift resident pilot. The immediate ask is to select a pilot-ready building, name the accountable community manager, confirm any board approval needed for resident distribution, and identify the path to two additional communities if the pilot performs.",
    sources: [["Worth Ross", "https://worthross.com/"]],
  },
  {
    id: "dunlap",
    name: "Dunlap ATX",
    segment: "Hospitality portfolio",
    pilot: "Lustre Pearl + Lucille",
    approvalRoute: "Bridget Dunlap — founder/principal relationship route",
    operatingRoute: "One portfolio operations or marketing lead + one lead at each participating venue",
    contactPath: "Supplied working route: bridget@dunlapatx.com. Clive: clivemgmt@dunlapatx.com. Lustre Pearl East: lpemgmt@dunlapatx.com · 512-524-1143. Reconfirm every route before sending.",
    confidence: "Warm founder route. Current email ownership, venue-level ownership, and the preferred first two concepts require confirmation.",
    nextAction: "Confirm Bridget’s preferred two concepts and appoint one cross-venue operating and reporting owner.",
    message: "Hi Bridget — Downtown Perks would love to begin with a simple two-venue resident pilot across Lustre Pearl and Lucille, or the two concepts you think are strongest. We’ll keep the staff lift contained and provide a 30-day recap of opens, saves, directions, and any redemption signal you prefer. Who should own coordination across the participating venues?",
    sources: [["Dunlap ATX contact", "https://dunlapatx.com/contact/"]],
  },
  {
    id: "frost-divcowest",
    name: "Endeavor → DivcoWest",
    segment: "Commercial property",
    pilot: "Frost Bank Tower tenant-experience pilot",
    approvalRoute: "Gregg Walker — President, DivcoWest Real Estate Asset Management; Jack Bossung — Associate Director, Investments, Austin",
    operatingRoute: "Tina Snyder — Senior Director, Head of Marketing + the current Frost Bank Tower property or tenant-experience lead",
    contactPath: "DivcoWest corporate line: 415-284-5700. Use Travis Dunaway at Endeavor as the proposed warm opening route.",
    confidence: "The DivcoWest titles and Austin office are supported by current company pages. Asset-specific approval, local property management, tenant experience, and communications authority require confirmation.",
    nextAction: "Confirm the Frost Bank Tower asset decision-maker, property manager, tenant-experience owner, and tenant communications channel.",
    message: "Hi [Name] — Downtown Perks is exploring one focused Frost Bank Tower tenant-experience pilot: a useful nearby-discovery layer, one tenant communication, one lobby QR touchpoint, and a 30-day engagement recap. Who currently owns approval, property operations, tenant experience, and communications for the building?",
    sources: [
      ["DivcoWest people", "https://divcowest.com/people/"],
      ["DivcoWest Austin office", "https://divcowest.com/company/about-us/"],
      ["Travis Dunaway", "https://www.endeavor-re.com/about/team/travis-dunaway/"],
    ],
  },
  {
    id: "inkind",
    name: "inKind",
    segment: "Dining platform",
    pilot: "Explicit five-to-ten venue downtown cohort",
    approvalRoute: "Johann Moonesinghe — Founder and CEO, preferably through a warm introduction",
    operatingRoute: "Steph “SJ” Carcamo — proposed partnerships/marketing route, current title to confirm + one assigned account owner",
    contactPath: "Use inKind’s official Contact Support path. Supplied working channels: support@inkind.com and impact@inkind.com; reconfirm before outreach. Warm introduction preferred for cohort approval.",
    confidence: "Johann Moonesinghe’s founder/CEO role is supported by inKind. The proposed operating route, cohort authority, participating venues, supplied inboxes, and reporting scope require direct confirmation.",
    nextAction: "Confirm the approved venue cohort, program evidence, current Austin partnerships owner, one account owner, and reporting expectations.",
    message: "Hi [Name] — Downtown Perks would like to feature a clearly verified downtown inKind cohort of five to ten venues within a resident-first dining experience. Could we align on the participating venues, one accountable Austin partnerships owner, and a simple 30-day measurement plan?",
    sources: [
      ["inKind about", "https://inkind.com/about"],
      ["inKind support", "https://inkind.com/how-to-contact-inkind-support"],
    ],
  },
  {
    id: "white-lodging",
    name: "White Lodging",
    segment: "Hotel + food and beverage",
    pilot: "Austin Marriott Downtown + Corinne + Zanzibar",
    approvalRoute: "David Meisner — Regional Vice President, White Lodging; Thomas Hoffmann — Vice President and General Manager, Austin Marriott Downtown",
    operatingRoute: "Hotel marketing lead + food-and-beverage lead + participating venue managers",
    contactPath: "Austin Marriott Downtown main line: 512-457-1111. Use the official hotel contact route and request the Austin marketing and F&B owners.",
    confidence: "David Meisner’s regional role and Thomas Hoffmann’s Austin Marriott Downtown leadership are supported by current public sources. Pilot authority and execution owners require direct confirmation.",
    nextAction: "Name the marketing and F&B owners and confirm scope, legal review, distribution, and reporting.",
    message: "Hi [Name] — Downtown Perks is inviting Austin Marriott Downtown into a focused local-discovery pilot connecting the hotel with Corinne and Zanzibar. Could you confirm who can approve the 60–90 day pilot and who should own marketing, F&B coordination, distribution, and the 30-day results review?",
    sources: [
      ["White Lodging — David Meisner", "https://www.whitelodging.com/news-events/david-meisner-rejoins-white-lodging-as-regional-vice-president"],
      ["Austin Marriott Downtown", "https://www.marriott.com/en-us/hotels/ausmd-austin-marriott-downtown/overview/"],
      ["Austin Hotel & Lodging Association", "https://www.austinlodging.org/about/board-of-directors/"],
    ],
  },
  {
    id: "hai",
    name: "Hai Hospitality",
    segment: "Hospitality portfolio",
    pilot: "Uchibā Austin anchor",
    approvalRoute: "Tony Montero — Chief Executive Officer; Tyson Cole — founder-level sponsor",
    operatingRoute: "Amber Quist — Chief Brand Officer; Leo Barrera — Vice President of Operations",
    contactPath: "info@haihospitality.com. Uchibā Austin: 512-916-4808.",
    confidence: "Tony Montero, Amber Quist, and Leo Barrera are supported by Hai’s current leadership page. The pilot offer, Tyson Cole’s sponsorship route, and day-to-day owner require confirmation.",
    nextAction: "Confirm an Uchibā-first experience, the accountable execution owner, and the expansion criteria.",
    message: "Hi [Name] — Downtown Perks would like to begin with an Uchibā-first resident pilot and a clear 30-day measurement plan. Could you confirm the person who can approve the pilot and the day-to-day owner for the experience, operating coordination, and results review?",
    sources: [
      ["Hai Hospitality leadership", "https://www.haihospitality.com/about"],
      ["Uchibā Austin", "https://uchiba.uchirestaurants.com/location/austin/"],
    ],
  },
  {
    id: "new-waterloo",
    name: "New Waterloo",
    segment: "Hotel + dining portfolio",
    pilot: "South Congress Hotel + Café No Sé",
    approvalRoute: "Bart Knaggs — Chief Executive Officer + Partner; Leigh Hitz — Chief Operations Officer",
    operatingRoute: "Sarah Swenson — Corporate Director of Marketing; Mindi Marshall — Corporate Director of Hotel Operations + the current South Congress Hotel property lead",
    contactPath: "Use New Waterloo’s official contact or work-with-us route. No direct personal email is treated as confirmed.",
    confidence: "The portfolio leadership, marketing, and hotel-operations titles are supported by New Waterloo’s current team pages. Property-level authority, the direct introduction path, and final approval model require confirmation.",
    nextAction: "Confirm the South Congress Hotel property lead, the warm route, and one hotel-plus-dining local experience.",
    message: "Hi [Name] — Downtown Perks would like to explore one focused South Congress Hotel + Café No Sé local-discovery pilot. Who can approve the pilot, and who should own the property launch, marketing coordination, distribution, and 30-day reporting?",
    sources: [
      ["New Waterloo team", "https://newwaterloo.com/who-we-are/our-team"],
      ["Bart Knaggs", "https://newwaterloo.com/who-we-are/our-team/bart-knaggs"],
      ["Leigh Hitz", "https://newwaterloo.com/who-we-are/our-team/leigh-hitz"],
    ],
  },
];

export const collectionResidentialRoutes = [
  { property: "The Austonian", contact: "Shawn Bell — GM", email: "shawn.bell@fsresidential.com", phone: "512-827-2710" },
  { property: "Four Seasons Residences", contact: "Sasha Horner Johnson", email: "Sasha.Horner@fourseasons.com", phone: "512-685-7777" },
  { property: "Residences at 6G", contact: "Holly Garcia", email: "hgarcia@kairoi.com", phone: "512-212-9001" },
  { property: "5 Fifty Five", contact: "Jim Reist", email: "jreist@somersetassociations.com", phone: "737-241-1051" },
  { property: "Brown Building", contact: "Alana Ulrich", email: "maluhia.ulrich@fsresidential.com", phone: "512-620-7096" },
  { property: "Plaza Lofts", contact: "Amy Wissler", email: "awissler@somersetassociations.com", phone: "512-480-0448" },
];

export const collectionAdditionalRoutes = [
  {
    organization: "Endeavor Real Estate Group",
    contacts: "Travis Dunaway; Anne Swift; Colton McCasland; Connor Lammert; Evan Deitch; Dana Gann",
    contactPath: "Use the Endeavor team page and Travis Dunaway relationship route. Confirm current Frost Bank Tower scope before outreach.",
  },
  {
    organization: "Lincoln Property Company",
    contacts: "Mark Miller; Seth Johnston; Trish Williams",
    contactPath: "Supplied working routes: MMiller@LPC.com · SJohnston@LPC.com · TRWilliams@LPC.com. Reconfirm recipients and scope before outreach.",
  },
  {
    organization: "Guy + Larry Restaurants",
    contacts: "Guy Villavaso; Larry Foles",
    contactPath: "Request one portfolio marketing or operations owner for a two-to-four concept dining collection.",
  },
];

export const collectionTechnicalNotes = [
  {
    id: "restaurant-inkind",
    title: "Restaurant identity and inKind membership",
    status: "Merged into current main",
    summary: "Restaurants retain their canonical dining type, drawer, and knife-and-fork glyph. inKind is an optional verified program layer based on explicit metadata or the curated cohort—not a replacement category and not an automatic label for every restaurant.",
  },
  {
    id: "qr-visibility",
    title: "Show QR visibility",
    status: "Included in the current review branch",
    summary: "Perk actions use a visible responsive layout. The secondary Show QR action spans the full row and cannot be pushed beyond an invisible horizontal rail.",
  },
];

export const collectionLaunchSequence = [
  { period: "Days 1–10", title: "Confirm authority", detail: "Verify one building approver, one hospitality approver, the operating owners, legal path, and distribution channel." },
  { period: "Days 11–30", title: "Launch the proof set", detail: "Activate one residential experience and one hospitality experience with unique links or QR destinations." },
  { period: "Days 31–60", title: "Report and expand", detail: "Review real behavior, document operating lift, and use the proof to open the next property or venue set." },
  { period: "Days 61–90", title: "Make the scale decision", detail: "Expand, refine, or stop based on resident usefulness, partner outcomes, and repeatable operations." },
];

export const collectionSuccessMeasures = [
  ["Approved building pilots", "1", "2"],
  ["Approved hospitality pilots", "1", "2"],
  ["Written expansion paths", "1", "3"],
  ["Resident or tenant opens", "100", "500"],
  ["Saves or directions", "30", "150"],
  ["Verified redemptions or RSVPs", "10", "50"],
  ["Operating owners appointed", "2", "5"],
  ["Partner proof reports", "1", "3"],
];

export const collectionWorkingRecords = [
  ["Founding Partner Collection — Contacts + Starter Messages", "Approvers, operators, public contact routes, pilot scope, confidence, and copy-ready asks"],
  ["Frost Bank Tower operating route", "Current asset authority, property management, tenant experience, communications, and pilot ownership"],
  ["Paseo joint pilot", "LV sponsorship, Greystar operations, resident communications, legal review, and expansion criteria"],
  ["Restaurant + inKind taxonomy", "Canonical dining identity, explicit program membership, and regression evidence"],
  ["Show QR visibility", "Responsive action layout, source regression, and release status"],
  ["Pilot proof template", "Audience, experience, distribution, measures, operating lift, findings, and expansion decision"],
];
