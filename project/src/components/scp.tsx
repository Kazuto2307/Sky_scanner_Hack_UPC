import React, { useState } from 'react';
import { useTravelContext } from '../context/TravelContext';
import Button from './Button';
import { Globe2, MapPin, Navigation } from 'lucide-react';
import { Continent, CONTINENT_COORDINATES } from '../constants';

// Add this city data (you can expand it with more cities)
const CITIES = [
  'New York', 'London', 'Paris', 'Tokyo', 'Dubai',
  'Singapore', 'Sydney', 'Los Angeles', 'Berlin', 'Rome'
];

const GeographicalPreferences: React.FC = () => {
  const { getCurrentSession, moveToNextStep, updateGeographicalPreferences } = useTravelContext();
  const currentSession = getCurrentSession();
  
  const [homeCity, setHomeCity] = useState(currentSession?.geographical.homeCity || '');
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(
    currentSession?.geographical.selectedContinent || null
  );
  const [error, setError] = useState('');

  if (!currentSession) return null;

  const handleContinue = () => {
    if (!homeCity.trim()) {
      setError('Please select your home city');
      return;
    }
    
    if (!selectedContinent) {
      setError('Please select a continent you wish to visit');
      return;
    }

    updateGeographicalPreferences(currentSession.id, {
      homeCity: homeCity.trim(),
      selectedContinent
    });
    
    moveToNextStep(currentSession.id);
  };

  const handleContinentClick = (continent: Continent) => {
    setSelectedContinent(continent);
    setError('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white relative">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <Globe2 className="mr-3" size={32} />
            <h2 className="text-3xl font-bold">Where To?</h2>
          </div>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Tell us where you're from and where you'd like to go. This helps us provide
            more relevant travel recommendations.
          </p>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Your Home City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={homeCity}
              onChange={(e) => {
                setHomeCity(e.target.value);
                setError('');
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-300"
            >
              <option value="">Select your city</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-4">Select Destination Continent</label>
          <div className="relative w-full aspect-[2/1] bg-blue-50 rounded-xl overflow-hidden">
            {/* Fixed background image URL */}
            <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/592753/pexels-photo-592753.jpeg')] bg-cover bg-center opacity-100"></div>
            
            {/* Continent Markers */}
            {Object.entries(CONTINENT_COORDINATES).map(([continent, coords]) => (
              <button
                key={continent}
                onClick={() => handleContinentClick(continent as Continent)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  selectedContinent === continent
                    ? 'scale-125 z-10'
                    : 'hover:scale-110'
                }`}
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              >
                <div className={`p-2 rounded-full ${
                  selectedContinent === continent
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-blue-900 hover:bg-blue-50'
                } shadow-lg flex items-center justify-center`}>
                  <Navigation size={20} className={selectedContinent === continent ? 'animate-pulse' : ''} />
                </div>
                <div className={`mt-2 text-sm font-medium ${
                  selectedContinent === continent
                    ? 'text-orange-500'
                    : 'text-blue-900'
                }`}>
                  {continent}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            className="flex items-center px-8"
          >
            <Navigation className="mr-2" size={16} />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeographicalPreferences;