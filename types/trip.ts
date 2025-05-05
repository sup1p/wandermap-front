export interface Trip {
  id: number;
  place: string;
  date: string;
  note: string;
  latitude: number;
  longitude: number;
  photo_urls: { id: number; url: string }[];
  // If you also need coordinates for backward compatibility
  coordinates?: [number, number]; // Optional for backward compatibility
}