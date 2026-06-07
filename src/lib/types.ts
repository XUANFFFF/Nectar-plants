export type Observation = {
  id: string;
  mediaUrl: string | null;
  mediaUrls: string[];
  sourceMediaUrls: string[];
  originalFilename: string | null;
  observer: string | null;
  observerId: string | null;
  eventDate: string | null;
  dateIdentified: string | null;
  scientificName: string | null;
  scientificNameId: string | null;
  chineseName: string | null;
  establishmentMeans: string | null;
  locationId: string | null;
  higherGeographyId: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  county: string | null;
  longitude: number | null;
  latitude: number | null;
  elevation: number | null;
  remarks: string | null;
  verbatimIdentification: string | null;
  phylum: string | null;
  phylumChineseName: string | null;
  family: string | null;
  familyChineseName: string | null;
  genus: string | null;
  genusChineseName: string | null;
  authorship: string | null;
  identifiedBy: string | null;
  identifiedById: string | null;
  verificationStatus: string | null;
  datasetName: string | null;
  datasetId: string | null;
  license: string | null;
  cstr: string | null;
  habitatType: string | null;
  associatedTaxa: string[];
};

export type Summary = {
  recordCount: number;
  observerCount: number;
  speciesCount: number;
  familyCount: number;
  cityCount: number;
  countyCount: number;
  habitatTypes: string[];
  verificationStatuses: string[];
  establishmentMeans: string[];
};

export type GardenGroup = {
  id: string;
  name: string;
  city: string;
  county: string;
  longitude: number;
  latitude: number;
  recordCount: number;
  plantNames: string[];
  pollinatorNames: string[];
  observerNames: string[];
  latestObservation: Observation;
  observations: Observation[];
};

export type PlantSummary = {
  chineseName: string;
  scientificName: string;
  familyChineseName: string;
  genusChineseName: string;
  recordCount: number;
  cities: string[];
  counties: string[];
  pollinators: string[];
  observers: string[];
  establishmentMeans: string[];
  representative: Observation;
  observations: Observation[];
};

export type ObserverContribution = {
  observer: string;
  recordCount: number;
  speciesCount: number;
  countyCount: number;
  cityCount: number;
  gardenCount: number;
  plants: string[];
  latestRecords: Observation[];
  badges: string[];
};

export type CitySummary = {
  cityKey: string;
  cityLabel: string;
  recordCount: number;
  gardenCount: number;
  speciesCount: number;
  countyCount: number;
  topCounties: string[];
  topPlants: string[];
  latestObservationDate: string | null;
};
