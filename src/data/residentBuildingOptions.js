export const residentBuildingOptions = [
  { id: "the-independent", name: "The Independent" },
  { id: "seaholm-residences", name: "Seaholm Residences" },
  { id: "spring-condominiums", name: "Spring Condominiums" },
  { id: "the-shore", name: "The Shore" },
  { id: "austin-proper-residences", name: "Austin Proper Residences" },
  { id: "fifth-and-west", name: "Fifth & West" },
  { id: "44-east", name: "44 East" },
  { id: "milago", name: "Milago" },
  { id: "the-waterline", name: "The Waterline" },
  { id: "four-seasons-residences", name: "Four Seasons Residences" },
  { id: "not-listed", name: "My building is not listed" },
];

export const residentBuildingNames = residentBuildingOptions.map((building) => building.name);

export function getResidentBuildingName(buildingId) {
  return residentBuildingOptions.find((building) => building.id === buildingId)?.name || "";
}
