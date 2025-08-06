from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from services.crypto_data import fetch_and_compute

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/crypto_data")
def get_crypto_data(symbol: str = Query(..., min_length=2)):
    try:
        result = fetch_and_compute(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
