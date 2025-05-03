import { StaticQuestion } from '../types';

export const STATIC_QUESTIONS: Omit<StaticQuestion, 'importance'>[] = [
  {
    id: 'art',
    question: 'How important is art and culture to you when traveling?'
  },
  {
    id: 'food',
    question: 'How important is trying local cuisine and food experiences?'
  },
  {
    id: 'nature',
    question: 'How important are natural landscapes and outdoor activities?'
  },
  {
    id: 'luxury',
    question: 'How important is luxury and comfort during your travels?'
  },
  {
    id: 'adventure',
    question: 'How important are adventurous or adrenaline-pumping activities?'
  }
];

export enum Continent {
  NorthAmerica = 'North America',
  SouthAmerica = 'South America',
  Europe = 'Europe',
  Africa = 'Africa',
  Asia = 'Asia',
  Oceania = 'Oceania'
}

export const CONTINENT_COORDINATES = {
  [Continent.NorthAmerica]: { x: 15, y: 25 },
  [Continent.SouthAmerica]: { x: 25, y: 60 },
  [Continent.Europe]: { x: 45, y: 20 },
  [Continent.Africa]: { x: 45, y: 45 },
  [Continent.Asia]: { x: 65, y: 30 },
  [Continent.Oceania]: { x: 80, y: 60 }
};