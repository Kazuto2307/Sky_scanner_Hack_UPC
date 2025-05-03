export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Mock function to simulate Gemini API call to generate questions based on preferences
export const mockGenerateQuestionsFromPreferences = async (preferences: string): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // These are mock questions that will be "generated" based on the user's preferences
  // In a real implementation, this would make an actual API call to Gemini
  const mockQuestions = [
    `Based on your interest in "${preferences.substring(0, 10)}...", would you prefer urban exploration or rural retreats?`,
    `Have you considered visiting ${preferences.includes('beach') ? 'mountain regions' : 'coastal areas'} as an alternative?`,
    `How would you feel about exploring destinations with ${preferences.includes('food') ? 'historical significance' : 'renowned cuisine'}?`,
    `Would you be interested in destinations that offer ${preferences.includes('relax') ? 'adventure activities' : 'relaxation opportunities'}?`,
    `Do you prefer traveling during peak seasons or would you consider visiting during ${preferences.includes('summer') ? 'winter' : 'summer'} months?`
  ];
  
  return mockQuestions;
};