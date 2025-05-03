import React, { useState } from 'react';
import { useTravelContext } from '../context/TravelContext';
import Button from './Button';
import { HelpCircle } from 'lucide-react';

const GeneratedQuestions: React.FC = () => {
  const { getCurrentSession, moveToNextStep } = useTravelContext();
  const currentSession = getCurrentSession();
  
  const [answers, setAnswers] = useState<Record<string, string>>(
    currentSession?.generatedQuestions.reduce((acc, q) => ({ ...acc, [q.id]: q.answer }), {}) || {}
  );
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  const handleContinue = () => {
    if (currentSession) {
      moveToNextStep(currentSession.id);
    }
  };
  
  if (!currentSession || !currentSession.generatedQuestions.length) {
    return <div className="text-center p-6">No questions generated. Please go back and enter your preferences.</div>;
  }
  
  const allQuestionsAnswered = Object.values(answers).every(answer => answer.trim() !== '');
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-center mb-6">
          <HelpCircle className="text-blue-900 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-blue-900">Personalized Questions</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Based on your preferences, we've generated these questions to better understand your travel style.
          Please answer each question to help us tailor recommendations for you.
        </p>
        
        <div className="space-y-6">
          {currentSession.generatedQuestions.map((question, index) => (
            <div key={question.id} className="bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
              <h3 className="font-medium text-blue-900 mb-2">Question {index + 1}</h3>
              <p className="mb-3">{question.question}</p>
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Type your answer here..."
                rows={2}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleContinue}
            disabled={!allQuestionsAnswered}
            className={`transition-all duration-300 ${
              allQuestionsAnswered 
                ? 'transform hover:scale-105' 
                : ''
            }`}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedQuestions;