import React from 'react';
import { Session } from '../types';

interface ProgressBarProps {
  currentSession: Session | null;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentSession }) => {
  if (!currentSession) return null;
  
  const steps = [
    { id: 'tierList', label: 'Preferences' },
    { id: 'preferences', label: 'Details' },
    { id: 'geographical', label: 'Location' },
    { id: 'results', label: 'Results' }
  ];
  
  const currentStepIndex = steps.findIndex(step => step.id === currentSession.currentStep);
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <React.Fragment key={step.id}>
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted
                      ? 'bg-teal-500 text-white'
                      : isCurrent
                      ? 'bg-blue-900 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={`mt-2 text-sm ${isCurrent ? 'font-medium text-blue-900' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className="flex-1 h-1 mx-2"
                  style={{
                    background: `linear-gradient(to right, 
                      ${index < currentStepIndex ? '#38B2AC' : '#E5E7EB'} 0%, 
                      ${index < currentStepIndex - 1 ? '#38B2AC' : 
                         index === currentStepIndex - 1 ? '#38B2AC 50%, #E5E7EB 50%' : 
                         '#E5E7EB'} 100%)`
                  }}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;