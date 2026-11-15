import datasetJson from "@/data/dataset.json";
import type { City, CountryContext, Dataset } from "./types";

const dataset = datasetJson as unknown as Dataset;

export function getDataset(): Dataset {
  return dataset;
}

export function getAllCities(): City[] {
  return dataset.cities;
}

export function getCityBySlug(slug: string): City | undefined {
  return dataset.cities.find((city) => city.slug === slug);
}

export function getCountry(code: string): CountryContext | undefined {
  return dataset.countries.find((country) => country.code === code);
}

export function getCitySlugs(): string[] {
  return dataset.cities.map((city) => city.slug);
}

export const METHODOLOGY_VERSION = dataset.methodologyVersion;
export const DATASET_GENERATED_AT = dataset.generatedAt;
export const CITY_COUNT = dataset.cities.length;
export const COUNTRY_COUNT = dataset.countries.length;
