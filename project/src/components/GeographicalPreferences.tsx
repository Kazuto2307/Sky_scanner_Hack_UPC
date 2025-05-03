import React, { useState } from 'react';
import { useTravelContext } from '../context/TravelContext';
import Button from './Button';
import { Globe2, CheckCircle } from 'lucide-react';

type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';

const CONTINENTS: {
  name: Continent;
  image: string;
}[] = [
  { 
    name: 'Africa',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Asia',
    image: 'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Europe',
    image: 'https://images.unsplash.com/photo-1505764761634-1d77b57e1966?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'North America',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'South America',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Oceania',
    image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];

const GeographicalPreferences: React.FC = () => {
  const { getCurrentSession, moveToNextStep, updateGeographicalPreferences } = useTravelContext();
  const currentSession = getCurrentSession();
  
  const [selectedContinents, setSelectedContinents] = useState<Continent[]>(
    currentSession?.geographical.selectedContinents || []
  );
  const [error, setError] = useState('');

  const handleContinentSelect = (continent: Continent) => {
    setError('');
    if (selectedContinents.includes(continent)) {
      setSelectedContinents(selectedContinents.filter(c => c !== continent));
    } else {
      if (selectedContinents.length < 3) {
        setSelectedContinents([...selectedContinents, continent]);
      }
    }
  };

  const handleContinue = () => {
    if (selectedContinents.length !== 3) {
      setError('Please select exactly 3 continents');
      return;
    }

    updateGeographicalPreferences(currentSession.id, {
      selectedContinents
    });
    // console.log('Selected continents:', selectedContinents);
    moveToNextStep(currentSession.id);
  };

  if (!currentSession) return null;

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white relative">
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <Globe2 className="mr-3" size={32} />
            <h2 className="text-3xl font-bold">Where Calls to You?</h2>
          </div>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Select your top 3 continents that spark your wanderlust (Order does matter!!)
          </p>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {CONTINENTS.map((continent) => {
            const isSelected = selectedContinents.includes(continent.name);
            const selectionIndex = selectedContinents.indexOf(continent.name) + 1;

            return (
              <button
                key={continent.name}
                onClick={() => handleContinentSelect(continent.name)}
                className={`relative h-48 rounded-xl overflow-hidden transition-all duration-300 ${
                  isSelected ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-102'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <img
                  src={continent.image}
                  alt={continent.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-left">
                  <h3 className="font-bold text-lg">{continent.name}</h3>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1.5">
                    <CheckCircle size={20} className="text-white" />
                    <span className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {selectionIndex}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600">
            Selected {selectedContinents.length} of 3 continents
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={selectedContinents.length !== 3}
            className="px-12 py-4 text-lg"
          >
            Continue to Destinations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeographicalPreferences;