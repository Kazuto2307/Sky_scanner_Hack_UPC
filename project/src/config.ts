// config.ts
export const GEO_API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo';
export const geoApiOptions = {
  headers: {
    'X-RapidAPI-Key': '7a8002b2c8msh15497745a73ae3ep11d958jsn2587f073535f',
    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
  }
};

export const SKYSCANNER_API_URL = 'https://partners.api.skyscanner.net/apiservices/v3/autosuggest/flights';
export const skyscannerApiOptions = (apiKey: string) => ({
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  }
});