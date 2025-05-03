import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { animated, useSpring } from '@react-spring/web';

// Try this alternative GeoJSON source
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";

type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';

const CONTINENT_COLORS: Record<Continent, string> = {
  'Africa': '#FF6B6B',
  'Asia': '#4ECDC4',
  'Europe': '#45B7D1',
  'North America': '#96CEB4',
  'South America': '#FFEEAD',
  'Oceania': '#D4A5A5'
};

interface WorldMapProps {
  selectedContinent: Continent | null;
  onContinentSelect: (continent: Continent) => void;
}

const WorldMap = ({ selectedContinent, onContinentSelect }: WorldMapProps) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredContinent, setHoveredContinent] = useState<Continent | null>(null);

  // Load geography data
  useEffect(() => {
    fetch(GEO_URL)
      .then(response => response.json())
      .then(data => {
        console.log('GeoJSON loaded:', data);
        setGeoData(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  const { transform } = useSpring({
    transform: `scale(${hoveredContinent ? 1.02 : 1})`,
    config: { tension: 300, friction: 20 }
  });

  if (!geoData) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] bg-blue-50 rounded-xl overflow-hidden border-2 border-blue-100">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{
          scale: 200,
          center: [10, 30]
        }}
        width={1024}
        height={500}
        className="bg-blue-50"
      >
        <ZoomableGroup center={[0, 30]} zoom={1}>
          <Geographies geography={geoData}>
            {({ geographies }) => {
              console.log('Rendering geographies:', geographies.length);
              return geographies.map((geo) => (
                <animated.g
                  key={geo.rsmKey}
                  style={{ transform }}
                >
                  <Geography
                    geography={geo}
                    onMouseEnter={() => setHoveredContinent('Africa' /* Temp fix */)}
                    onMouseLeave={() => setHoveredContinent(null)}
                    onClick={() => onContinentSelect('Africa' /* Temp fix */)}
                    style={{
                      default: {
                        fill: '#E2E8F0',
                        stroke: '#FFF',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: '#CBD5E1',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: '#94A3B8',
                      }
                    }}
                  />
                </animated.g>
              ));
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Debug overlay */}
      <div className="absolute top-2 left-2 bg-white p-2 rounded text-xs">
        <div>Container size: 1024x500</div>
        <div>Data loaded: {geoData ? 'Yes' : 'No'}</div>
        <div>Features: {geoData?.objects?.land?.geometries?.length || 0}</div>
      </div>
    </div>
  );
};

export default WorldMap;