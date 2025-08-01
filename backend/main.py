from fastapi import FastAPI, HTTPException, Query
from services.risk_calculator import fetch_and_compute

app = FastAPI(title="Crypto Risk API")

@app.get("/risk_score")
def get_risk_score(symbol: str = Query(...)):
    try:
        result = fetch_and_compute(symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
