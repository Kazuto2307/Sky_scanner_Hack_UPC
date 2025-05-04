import { GoogleGenerativeAI } from '@google/generative-ai';
import { Session } from '../types/index';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Gemini API key not configured');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash', // Modelo actualizado
  apiVersion: 'v1' // Versión de API actualizada
});
export const processSessionData = (sessions: Session[]) => {
  const completedSessions = sessions.filter(session => 
    session.currentStep === 'results'
  );

  if (completedSessions.length === 0) {
    throw new Error('No hay sesiones completas para procesar');
  }

  // Resto de la lógica de procesamiento usando completedSessions
  const tierPoints = { S: 3, A: 2, B: 1, C: 0 };
  const itemScores = {};

  completedSessions.forEach(session => {
    Object.entries(session.tierList).forEach(([tier, items]) => {
      if (tier !== 'unranked') {
        items.forEach(item => {
          itemScores[item] = (itemScores[item] || 0) + tierPoints[tier];
        });
      }
    });
  });
  // Normalización
  const numSessions = completedSessions.length;
  const normalizedScores = {};

  if (numSessions > 0) {
    const normalizationFactor = 3 * numSessions;
    
    Object.entries(itemScores).forEach(([item, score]) => {
      const normalizedValue = Number((score / normalizationFactor).toFixed(2));
      if (normalizedValue > 0.5) {  // Filtramos durante la normalización
        normalizedScores[item] = normalizedValue;
      }
    });
}
  // console.log(itemScores, 'Item Scores')
  // Process free text preferences
  const allPreferences = completedSessions
    .map(session => session.preferences?.text || '')
    .filter(text => text.length > 0)
    .join(' | ');

  // Process continent preferences

  const continentScores: Record<string, number> = {};
  const VALID_CONTINENTS = new Set(['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania']);

  completedSessions.forEach(session => {
    const continents = session.geographical?.selectedContinents || [];
    
    if (Array.isArray(continents)) {
      continents.forEach(continent => {
        if (VALID_CONTINENTS.has(continent)) {
          continentScores[continent] = (continentScores[continent] || 0) + 1;
        }
      });
    }
  });

  const topContinents = Object.entries(continentScores)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 3)
  .map(([continent]) => continent);

  // Sort items by score
  const rankedItems = Object.entries(normalizedScores)
    .sort(([, a], [, b]) => b - a)
    .map(([item]) => item);

  // Get top 3 continents
  // const topContinents = Object.entries(continentScores)
  // .sort((a, b) => {
  //   // Ordenar primero por conteo descendente, luego alfabéticamente
  //   if (b[1] !== a[1]) return b[1] - a[1];
  //   return a[0].localeCompare(b[0]);
  // })
  // .slice(0, 3)
  // .map(([continent]) => continent);
  // console.log('prepro state gemini', allPreferences)
  return { rankedItems, allPreferences, topContinents };
}

export async function getCityRecommendations(completedSessions: Session[]) {
  try {
    const { rankedItems, allPreferences, topContinents } = await processSessionData(completedSessions);
    // console.log('Top cons:', topContinents);
    const prompt = `A group of people wants to make a travel, where the most important aspects for them are [from most to least important]: ${rankedItems.join(', ')}. 
    In their dream travel they do this: ${allPreferences}. Try to consider as much as possible the preferences of the group.
    And the most liked continents to visit [from most to least] are ${topContinents.join(', ')}. 
    Considering all this information, think deeply of the 10 cities that are most suitable for this travel. 
    Don't answer with the first cities that come to your mind, but think about the best options for this group of people.
    For each city give also a mark for how good it siuts their demands. 
    OUTPUT:
    Return ONLY a JSON with a format like this one: {"Barcelona, Spain": 10, "Milan, Italy": 9, ...}`;
    // console.log('Prompt:', prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    return recommendations;
  } catch (error) {
    console.error('Error getting city recommendations:', error);
    return {};
  }
}

export async function FinalRecommendations(completedSessions: Session[], prompt: string) {
  try{
  const { rankedItems, allPreferences, topContinents } = await processSessionData(completedSessions);
  const updatedPrompt = `${prompt} ${rankedItems.join(', ')}.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format');
  }

  const recommendations = JSON.parse(jsonMatch[0]);
  return recommendations;
  } catch (error) {
    console.error('Error getting city recommendations:', error);
    return {};
  }

}

// export async function getCityRecommendations(sessions) {
//   try {
//     const { rankedItems, allPreferences, topContinents } = await processSessionData(sessions);
    
//     const prompt = `A group of people wants to make a travel, where the most important aspects are: ${rankedItems.join(', ')}. 
// //     Their preferences are ${allPreferences} and the most liked continents to visit are ${topContinents.join(', ')}. 
// //     Think of the 10 cities that are most suitable for this travel. For each city give also a mark for how good it may be. 
// //     Return the ONLY list in a JSON format like this: {"Barcelona, Spain": 10, "Milan, Italy": 9, ...}`; 

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     // Extraer JSON y razonamiento
//     const jsonRegex = /```json\n([\s\S]*?)\n```/;
//     const jsonMatch = text.match(jsonRegex);
    
//     if (!jsonMatch) {
//       throw new Error('Formato de respuesta inválido');
//     }

//     const reasoning = text.split('```').pop()?.trim() || '';
//     const recommendations = JSON.parse(jsonMatch[1]);

//     return {
//       recommendations,
//       reasoning: reasoning.replace(/\*\*Reasoning for City Choices and Scores:\*\*\n*/, '')
//     };

//   } catch (error) {
//     console.error('Error getting recommendations:', error);
//     return {
//       recommendations: {},
//       reasoning: 'Could not generate reasoning'
//     };
//   }
// }