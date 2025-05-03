// proxy-server.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON

const SKYSCANNER_API_KEY = process.env.SKYSCANNER_API_KEY;

app.post('/api/autosuggest', async (req, res) => { // Cambiado a POST
  try {
    const { query } = req.body; // Ahora viene del body
    
    const response = await axios.post( // Cambiado a POST
      'https://partners.api.skyscanner.net/apiservices/v3/autosuggest/flights',
      {
        query,
        market: "UK",
        locale: "en-GB",
        currency: "GBP"
      },
      {
        headers: {
          'x-api-key': SKYSCANNER_API_KEY,
          'Content-Type': 'application/json' // Añadir header de contenido
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Detalles del error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error desconocido' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy en puerto ${PORT}`));