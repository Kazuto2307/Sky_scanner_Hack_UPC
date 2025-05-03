from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
import subprocess
import json
import os
import logging

from python_scripts.prompt_2 import main_program

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendationRequest(BaseModel):
    budgets: dict[str, int]
    scores: dict[str, float]


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

def format_python_argument(data: RecommendationRequest) -> str:
    """Formatea los datos según lo esperado por el script Python"""
    budget_str = json.dumps(data.budgets)
    score_str = json.dumps({
        k: round(v * 10) for k, v in data.scores.items()  # Ajustar escala si es necesario
    })
    
    return f'{budget_str};{score_str}'.replace('"', '\"')

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):  # Usar el modelo correcto
    try:
        # Acceder a los campos correctamente
        logger.info(f"Request received: {request.dict()}")
        logger.info(f"Budgets: {request.budgets}")
        logger.info(f"Scores: {request.scores}")
        
        # Ejecutar el programa principal con el argumento
        result = main_program(scores=request.scores, budgets=request.budgets)  # Asegúrate que main_program acepte el argumento
        
        logger.info(f"Python script result: {result}")
        return result
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return {"error": "Invalid JSON format"}
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(500, detail=str(e))