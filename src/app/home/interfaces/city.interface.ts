
export interface City {
  name:           string;
  qualityOfLife:  number;
  happinessRate:  number;
  publicServices: number;
  safety:         number;
  averageSalary:  number;
  costOfLiving:   number;
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
