export const partnerDashboardMetrics = [
  { label: "Scans", value: "2,786", trend: "+12%" },
  { label: "Action rate", value: "24%", trend: "+4%" },
  { label: "Redemptions", value: "96", trend: "+18%" },
  { label: "Live offers / events", value: "24 / 12", trend: "Live" },
];

export const partnerDashboardControls = {
  view: ["All", "Properties", "Hospitality", "Venues", "Brands", "Civic"],
  layers: ["Everything", "Scans", "Redemptions", "Events", "Offers", "Properties"],
  time: ["Live", "Today", "Tonight", "7 days", "30 days"],
  open: ["Open", "Saved", "Redeemed", "RSVPed"],
};

export const partnerDashboardAnswer = {
  entityType: "venue",
  entityName: "Banger's Sausage House & Beer Garden",
  district: "Rainey",
  address: "79 Rainey Street, Austin, TX 78701",
  capturedActivity: 8,
  redemptions: 8,
  scans: 234,
  visits: 51,
  directAnswer: "Banger's Sausage House & Beer Garden is the clearest answer right now.",
  explanation:
    "This is the strongest current answer from the map based on what is nearby, what is active, and where people are responding.",
  context:
    "Banger's Sausage House & Beer Garden is already showing downtown activity, nearby intent, and walkable pull from the map.",
};

export const partnerSignalFeed = [
  {
    title: "Banger's Sausage House & Beer Garden leading",
    body: "8 redemptions captured",
    type: "venue",
  },
  {
    title: "Lustre Pearl Rainey active",
    body: "8 redemptions captured",
    type: "venue",
  },
  {
    title: "Via 313 Pizza active",
    body: "8 redemptions captured",
    type: "venue",
  },
  {
    title: "Banger's Sausage House & Beer Garden",
    body: "Open 11 more",
    type: "expand",
  },
];
