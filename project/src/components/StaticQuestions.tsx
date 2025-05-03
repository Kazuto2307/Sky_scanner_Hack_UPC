import React from 'react';
import { useTravelContext } from '../context/TravelContext';
import Button from './Button';
import { Star } from 'lucide-react';

const StaticQuestions: React.FC = () => {
  const { getCurrentSession, updateStaticQuestionImportance, moveToNextStep } = useTravelContext();
  const currentSession = getCurrentSession();
  
  if (!currentSession) {
    return <div className="text-center p-6">No session found. Please start over.</div>;
  }
  
  const handleRatingChange = (questionId: string, importance: number) => {
    updateStaticQuestionImportance(currentSession.id, questionId, importance);
  };
  
  const handleContinue = () => {
    moveToNextStep(currentSession.id);
  };
  
  const allQuestionsRated = currentSession.staticQuestions.every(q => q.importance > 0);
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-center mb-6">
          <Star className="text-blue-900 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-blue-900">Rate Your Interests</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Please rate how important each of the following aspects is to you when traveling.
          Your ratings will help us prioritize the most relevant recommendations.
        </p>
        
        <div className="space-y-8">
          {currentSession.staticQuestions.map((question) => (
            <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">{question.question}</h3>
              
              <div className="flex flex-col sm:flex-row items-center mt-4">
                <div className="flex-grow w-full sm:w-auto">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-500">Not Important</span>
                    <span className="text-xs text-gray-500">Very Important</span>
                  </div>
                  <div className="flex justify-between space-x-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingChange(question.id, value)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          question.importance === value
                            ? 'bg-orange-500 text-white transform scale-110'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                        aria-label={`Rate ${value}`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-4 sm:w-24 text-center">
                  {question.importance > 0 && (
                    <div className="text-lg font-semibold text-orange-500 animate-fadeIn">
                      {question.importance}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleContinue}
            disabled={!allQuestionsRated}
            className={`transition-all duration-300 ${
              allQuestionsRated 
                ? 'transform hover:scale-105' 
                : ''
            }`}
          >
            See Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaticQuestions;