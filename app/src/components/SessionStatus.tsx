import React from 'react';
import { useTravelContext } from '../context/TravelContext';

const SessionStatus: React.FC = () => {
  const { sessions } = useTravelContext();
  
  // Componente interno para la barra de progreso
  const Progress = ({ value }: { value: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-500 rounded-full h-2 transition-all duration-300" 
        style={{ width: `${value}%` }}
      />
    </div>
  );

  // Componente interno para el badge de estado
  const Badge = ({ color, children }: { color: string; children: React.ReactNode }) => (
    <span className={`px-2 py-1 rounded-full text-xs ${
      color === 'green' ? 'bg-green-100 text-green-800' :
      color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {children}
    </span>
  );

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Group Progress</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session, index) => {
          const stepIndex = ['tierList', 'preferences', 'geographical', 'results']
            .indexOf(session.currentStep);
          const progressValue = (stepIndex + 1) * 25;

          return (
            <div 
              key={session.id}
              className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">Traveler #{index + 1}</span>
                <Badge color={
                  session.currentStep === 'results' ? 'green' : 
                  session.currentStep === 'geographical' ? 'yellow' : 'gray'
                }>
                  {session.currentStep.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              </div>
              <Progress value={progressValue} />
              <div className="mt-2 text-sm text-gray-500">
                Completed: {['25%', '50%', '75%', '100%'][stepIndex]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionStatus;