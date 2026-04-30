
export type Mode = 'resident' | 'partner';

export type SearchEntityType = 'venue' | 'building' | 'property' | 'event' | 'moment';

export type SearchEntity = {
  id: string;
  type: SearchEntityType;
  title: string;
  lat: number;
  lng: number;
  summary: string;
  detail: string;
  district?: string;
  price?: number;
  buildingKey?: string;
  category?: string;
  offer?: string;
  distance?: string;
  hours?: string;
  rating?: number;
  href?: string;
  signals: string[];
  score?: number;
};

export type ActionPayload = {
  itemId: string;
  itemTitle: string;
  mode: Mode;
  email?: string;
  phone?: string;
};
