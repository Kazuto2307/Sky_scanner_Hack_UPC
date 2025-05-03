import { Continent } from '../constants';

export interface TravelPreference {
  id: string;
  text: string;
}

export interface Session {
  id: string;
  preferences: TravelPreference | null;
  currentStep: 'tierList' | 'preferences' | 'geographical' | 'results';
  tierList: TierListData;
  geographical: GeographicalPreference;
  budgetandcity?: TravelPreference;}

export interface TravelAspect {
  id: string;
  name: string;
  icon: string;
}

export interface TierListData {
  S: string[];
  A: string[];
  B: string[];
  C: string[];
  unranked: string[];
}

export type TierType = 'S' | 'A' | 'B' | 'C' | 'unranked';

export interface GeographicalPreference {
  homeCity: string;
  selectedContinents: Continent | null;
}