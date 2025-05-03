import React, { useEffect, useState } from 'react';
import { useTravelContext } from '../context/TravelContext';
import Button from './Button';
import { MapPin, Sparkles, Plane, AlertTriangleIcon,Globe} from 'lucide-react';
import { getCityRecommendations } from '../lib/gemini';

const Results: React.FC = () => {
  const { sessions, validateAllSessionsComplete, getCompletedSessions, getCurrentSession } = useTravelContext();
  const [recommendations, setRecommendations] = useState<Record<string, number>>({});
  const [recommendedCities, setRecommendedCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const currentSession = getCurrentSession();

  useEffect(() => {
    let isMounted = true; // Flag para controlar si el componente está montado
    const checkSessions = async () => {
      try {
        if (!validateAllSessionsComplete()) {
          throw new Error('Not all sessions are complete. Tell your friends to finish their sessions!!');
        }
        
        const completed = getCompletedSessions();
        const results = await getCityRecommendations(completed);
        if (isMounted) {
        setRecommendations(results);
        setValidationState('valid');
        }
      } catch (error) {
        setValidationState('invalid');
        setError(error.message);
      }
    };


    checkSessions();
  }, [sessions, validateAllSessionsComplete, getCompletedSessions]);
  
  // Función optimizada para obtener imágenes
  const getCityImage = async (city: string) => {
    // const formattedCity = city.replace(/ /g, '_');
    try {
      // Intento con Unsplash primero
      // const unsplashUrl = `https://source.unsplash.com/featured/600x400/?city,${encodeURIComponent(formattedCity)},landmark,skyline`;
      // const unsplashRes = await fetch(unsplashUrl);
      // if (unsplashRes.ok) return unsplashRes.url;

      // Fallback a Pexels si Unsplash falla
      const pexelsRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(city)}+city&per_page=1`,
        {
          headers: {
            'Authorization': import.meta.env.VITE_PEXELS_API_KEY || 'TU_API_KEY_AQUI'
          }
        }
      );
      const data = await pexelsRes.json();
      return data.photos[0]?.src.large || '/default-city.jpg';
      
    } catch (error) {
      console.error('Error fetching city image:', error);
      return '/default-city.jpg';
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const fetchRecommendations = async () => {
      try {
        // 1) Llamada a tu script Python
      //1. {origenid: budget}
      //2. {Ciudad, Pais: puntuacion}
      //chanchullo: 
        //const arg1 = JSON.stringify(sessions.map(session => session.budgetandcity));
        const BudCity: Record<string, number> = {};

        sessions.forEach(session => {
          if (session && session.budgetandcity?.text) {
            const [id, budget] = session.budgetandcity.text.split('|');
            BudCity[id] = parseInt(budget, 10);
          }
        });

        // Convertimos a JSON y escapamos las comillas
        const finalBudCity = JSON.stringify(BudCity)//.replace(/"/g, '\\"');
        console.log(finalBudCity);  
        const results = await getCityRecommendations(sessions);
        setRecommendations(results);
        const finalResults = JSON.stringify(results)//.replace(/"/g, '\\"');
        // // console.log(finalResults);
        // // console.log('Recommendations:', results);
        const arg1= `${finalBudCity};${finalResults}`;
        console.log('arg1:', arg1);
        const parsedarg1 = encodeURIComponent(arg1)
        // Llamar al servicio FastAPI
        const response = await fetch('http://localhost:8000/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgets: BudCity,
          scores: results
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error del servidor');
      }

      const pyData = await response.json();
        // const pyRes = await fetch(`/api/run-recs?arg1=${parsedarg1}`);
        // console.log('Python response:', pyRes);
        // if (!pyRes.ok) {
        //   console.log('Error executing Python script:', pyRes.statusText);
        //   throw new Error('Error ejecutando script Python');
        // }
        // const pyData = await pyRes.json();
        // console.log('Resultados Python:', pyData);

        // Procesar ciudades con imágenes
        const citiesWithImages = await Promise.all(
          Object.entries(results)
            .sort(([, a], [, b]) => b - a)
            .map(async ([city, score]) => ({
              name: city,
              match: score,
              description: `Experience the unique blend of culture, attractions, and lifestyle in ${city}.`,
              imageUrl: await getCityImage(city)
            }))
        );
        
        setRecommendedCities(citiesWithImages);
        setIsLoading(false);
        
      } catch (err) {
        setError('Failed to get recommendations. Please try again.');
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [sessions]);

  if (!currentSession) {
    return <div className="text-center p-6">No session found. Please start over.</div>;
  }

  if (validationState === 'checking') {
    return (
      <div className="text-center p-8">
        <div className="animate-pulse flex flex-col items-center">
          <Globe className="w-12 h-12 text-blue-500 mb-4" />
          <p className="text-gray-600">Verifying all travel sessions...</p>
        </div>
      </div>
    );
  }

  if (validationState === 'invalid') {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <AlertTriangleIcon className="mx-auto h-12 w-12" />
          <p className="mt-2">{error}</p>
          <p className="mt-2 text-sm">
            {sessions.filter(s => s.currentStep !== 'results').length} 
            incomplete session(s) detected
          </p>
        </div>
      {/* <Button onClick={() => window.location.reload()}> */}
        {/* Refresh Status */}
      {/* </Button> */}
      </div>
    );
  }
  

  const handleStartNewSession = () => {
    createNewSession();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing preferences and finding perfect destinations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleStartNewSession} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="text-blue-900 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-blue-900">Your Perfect Destinations</h2>
        </div>
        
        <p className="text-gray-600 mb-8 text-center">
          Based on all preferences and ratings, we've found these destinations that match your travel style perfectly.
        </p>
        
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {recommendedCities.map((destination, index) => (
            <div 
              key={index} 
              className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100"
            >
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src={destination.imageUrl} 
                    alt={destination.name} 
                    className="w-full h-48 md:h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <MapPin className="text-orange-500 mr-2" size={18} />
                        <h3 className="text-xl font-bold text-blue-900">{destination.name}</h3>
                      </div>
                      <div className="bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                        {destination.match * 10}% Match
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">{destination.description}</p>
                  </div>
                  
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/search?q=visit+${encodeURIComponent(destination.name)}`, '_blank')}
                      className="w-full justify-center"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            className="flex items-center"
          >
            <Plane className="mr-2" size={16} />
            Start New Adventure
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;