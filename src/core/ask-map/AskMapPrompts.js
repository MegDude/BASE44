export const residentAskMapPrompts = [
  "What should I do tonight?",
  "Coffee within walking distance",
  "Where should we go for drinks?",
  "What perks can I use now?",
  "What's happening nearby?",
];

export const partnerAskMapPrompts = [
  "What should I promote next?",
  "Where is activity increasing?",
  "What are people saving nearby?",
  "Which audience is closest?",
  "Which campaign should I launch?",
];

export function getAskMapPrompts(mode = "resident") {
  return mode === "partner" ? partnerAskMapPrompts : residentAskMapPrompts;
}
