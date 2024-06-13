
export interface City {
  name:           string;
  country:        string;
  qualityOfLife:  number;
  happinessRate:  number;
  publicServices: number;
  safety:         number;
  averageSalary:  number;
  costOfLiving:   number;
  coincidence?:    number;
}

export interface Requirements {
  qualityOfLife:  number;
  happinessRate:  number;
  publicServices: number;
  safety:         number;
  desiredJob:     string;
  averageSalary:  number;
  costOfLiving:   number;
}
