// ---------- Plant (plant_table) ----------
export interface Plant {
  plantId:             number;
  imageId?:            number;
  scientificName:      string;
  commonName:          string;
  family:              string;
  habitat?:            string;
  distribution?:       string;
  edibleParts?:        string;
  nutritionalValue?:   string;
  floweringSeason?:    string;
  conservationStatus?: string;
  imageUrl?:           string;
  latitude:            number;
  longitude:           number;
  uploadedBy:          number;
  verifiedStatus:      boolean;
  createdDate:         string;
}

// ---------- User ----------
export interface AppUser {
  userId: number;
  name:   string;
  role:   string;   // ADMIN | EDITOR | VALIDATOR | VIEWER
}

// ---------- Observation (FR06) ----------
export interface Observation {
  observationId:     number;
  plantId:           number;
  userId:            number;
  observationImage:  string;
  observationStatus: string;   // PENDING | APPROVED | REJECTED
  latitude:          number;
  longitude:         number;
  timeStamp:         string;
  feedback?:         string;
}

// ---------- Identification Result (FR07) ----------
export interface IdentificationResult {
  plantId:        number;
  scientificName: string;
  commonName:     string;
  family:         string;
  imageUrl:       string;
  confidence:     number;    // 0.0 – 100.0
  expertVerified: boolean;
  identifiedAt:   string;
}

// ---------- Navigation History ----------
export interface NavigationHistory {
  navigationId:         number;
  userId:               number;
  plantId:              number;
  startLatitude:        number;
  startLongitude:       number;
  destinationLatitude:  number;
  destinationLongitude: number;
  routeDistance:        number;
  estimatedTime:        number;
  navigationDate:       string;
  status:               string;
}
