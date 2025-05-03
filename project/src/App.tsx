import React, { useEffect } from 'react';
import { TravelProvider, useTravelContext } from './context/TravelContext';
import TierList from './components/TierList';
import PreferencesForm from './components/PreferencesForm';
import GeographicalPreferences from './components/GeographicalPreferences';
import Results from './components/Results';
import SessionManager from './components/SessionManager';
import ProgressBar from './components/ProgressBar';
import { Plane, Globe } from 'lucide-react';
import SessionStatus from './components/SessionStatus';

const TravelApp: React.FC = () => {
  const { getCurrentSession, createNewSession } = useTravelContext();
  const currentSession = getCurrentSession();
  
  useEffect(() => {
    if (!currentSession) {
      createNewSession();
    }
  }, [currentSession, createNewSession]);
  
  const renderCurrentStep = () => {
    if (!currentSession) return null;
    
    switch (currentSession.currentStep) {
      case 'tierList':
        return <TierList />;
      case 'preferences':
        return <PreferencesForm />;
      case 'geographical':
        return <GeographicalPreferences />;
      case 'results':
        return <Results />;
      default:
        return <TierList />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/1/14/Skyscanner_Icon_2020.svg" 
          alt="Skyscanner Logo" 
          className="h-8 mr-3" // Ajusta la altura según necesites
        />
        <h1 className="text-4xl font-bold text-blue-600">SkyMeet</h1>
      </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover destinations perfectly tailored to your unique travel style and preferences
          </p>
        </header>
        
        <SessionManager />
        
        {currentSession && <ProgressBar currentSession={currentSession} />}
        
        <div className="transition-all duration-500 ease-in-out">
          {renderCurrentStep()}
        </div>
      </div>
      
      <footer className="mt-20 py-6 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center flex items-center justify-center">
          <Plane className="mr-2" size={16} />
          <p>SkyMeet &copy; 2025 - Find your perfect destination</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <TravelProvider>
      <SessionStatus />
      <TravelApp />
    </TravelProvider>
  );
}

export default App;