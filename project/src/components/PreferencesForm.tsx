import React, { useState, useEffect } from 'react';
import { useTravelContext } from '../context/TravelContext';
import Button from './Button';
import { Plane, Globe, MapPin, Compass, ChevronDown } from 'lucide-react';
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';
import { GEO_API_URL, geoApiOptions , SKYSCANNER_API_URL, skyscannerApiOptions } from '../config';

interface CityOption {
  value: string;
  label: string;
  country: string;
  region: string;
}

interface AirportOption {
  value: string;  // IATA code
  label: string;
  country: string;
  city: string;
  entityId: string;

}

const PreferencesForm: React.FC = () => {
  const { updateCityandBudget, updatePreferences, moveToNextStep, getCurrentSession } = useTravelContext();
  const [preferences, setPreferences] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [budget, setBudget] = useState(5);
  const [selectedAirport, setSelectedAirport] = useState<AirportOption | null>(null);
  const currentSession = getCurrentSession();

  const loadAirportOptions = async (inputValue: string) => {
    if (inputValue.length < 3) return { options: [] };
    
    try {
      const response = await fetch(
        '/api/skyscanner/v3/autosuggest/flights',
        {
          method: 'POST',
          headers: {
            'x-api-key': 'sh969210162413250384813708759185',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: {
              searchTerm: inputValue,
              market: 'UK',
              locale: 'en-GB',
              limit: 50
            }
          })
        }
      );
      
      const data = await response.json();
      // console.log(data)
      return {
        options: data.places
          .filter((place: any) => place.type === 'PLACE_TYPE_AIRPORT')
          .map((airport: any) => ({
            value: airport.iataCode,
            label: `${airport.name} (${airport.iataCode}), ${airport.cityName}, ${airport.countryName}`,//,${airport.entityId}`,
            country: airport.countryName,
            city: airport.cityName,
            entityId: airport.entityId
          })),
        hasMore: false
      };
    } catch (error) {
      console.error('Error loading airports:', error);
      return { options: [] };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preferences.trim() || !selectedAirport) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (currentSession) {
      setIsLoading(true);
      setError('');
      
      try {
        const fullPreferences = `${preferences}`;
        console.log('Pref',preferences)
        updatePreferences(currentSession.id, fullPreferences);
        const BudgetAndCity = `${selectedAirport.entityId}|${budget}`;
        updateCityandBudget(currentSession.id, BudgetAndCity)
        console.log(BudgetAndCity)
        moveToNextStep(currentSession.id);
      } catch (err) {
        setError('Failed to save preferences. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <Globe className="mr-3" size={32} />
              <h2 className="text-3xl font-bold">Plan Your Dream Trip</h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Enter Your Closest Airport
              <span className="text-red-500 ml-1">*</span>
            </label>
            <AsyncPaginate
              value={selectedAirport}
              loadOptions={loadAirportOptions}
              onChange={setSelectedAirport}
              placeholder="Search for your city..."
              components={{
                DropdownIndicator: () => <ChevronDown className="w-5 h-5 text-gray-400 mr-2" />,
                IndicatorSeparator: () => null
              }}
              classNames={{
                control: () => 'border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500',
                input: () => 'text-gray-700',
                option: () => 'hover:bg-blue-50 p-2',
                menu: () => 'border border-gray-200 rounded-lg mt-1 shadow-lg'
              }}
              additional={{
                page: 1
              }}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Budget Importance
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
              <div className="text-center mt-1 text-blue-600 font-medium">
                {budget}/10
              </div>
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">
              Travel Preferences
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full h-48 p-6 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 resize-none"
                placeholder="Describe your ideal travel experience..."
              />
              <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                {preferences.length} characters
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <Button 
              type="submit"
              disabled={isLoading || !preferences.trim() || !selectedAirport}
              className="flex items-center px-8"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  Processing...
                </>
              ) : (
                <>
                  <Plane className="mr-2" size={16} />
                  Continue
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesForm;