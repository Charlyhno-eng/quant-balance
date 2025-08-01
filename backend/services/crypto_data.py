import numpy as np
import yfinance as yf
from ta.momentum import RSIIndicator

def clamp01(x):
    return min(1, max(0, x))

def scale_rsi(rsi_value):
    base = clamp01((rsi_value - 30) / 60)
    return 0.01 + base * 0.98

def scale_perf(perf_value, scale):
    return clamp01(abs(perf_value) / scale)

def compute_risk_score(volatility, rsi_1h, rsi_4h, rsi_1d, perf_1d, perf_7d, perf_30d, perf_60d, perf_90d, perf_120d):
    vol_score = clamp01(volatility / 2.0)

    rsi_1h_score = scale_rsi(rsi_1h)
    rsi_4h_score = scale_rsi(rsi_4h)
    rsi_1d_score = scale_rsi(rsi_1d)

    perf_1d_score = scale_perf(perf_1d, 20.0)
    perf_7d_score = scale_perf(perf_7d, 50.0)
    perf_30d_score = scale_perf(perf_30d, 100.0)
    perf_90d_score = scale_perf(perf_90d, 100.0)
    perf_120d_score = scale_perf(perf_120d, 100.0)

    risk_score = (
        0.50 * vol_score +
        0.07 * rsi_1h_score +
        0.09 * rsi_4h_score +
        0.07 * rsi_1d_score +
        0.07 * perf_1d_score +
        0.09 * perf_7d_score +
        0.07 * perf_30d_score +
        0.06 * perf_90d_score +
        0.03 * perf_120d_score
    )
    return min(10, max(1, risk_score * 10))

def fetch_and_compute(symbol: str) -> dict:
    daily = yf.download(symbol, interval="1d", period="130d", progress=False)
    hourly = yf.download(symbol, interval="1h", period="7d", progress=False)

    if daily.empty or hourly.empty:
        raise ValueError("Market data unavailable for the given symbol.")

    daily_close = daily["Close"].squeeze()
    hourly_close = hourly["Close"].squeeze()

    price_usd = float(daily_close.iloc[-1])

    # Change the currency to EUR
    fx = yf.download("EURUSD=X", interval="1d", period="5d", progress=False)
    if fx.empty:
        raise ValueError("FX data unavailable for EURUSD.")

    eurusd_rate = float(fx["Close"].iloc[-1])

    price_eur = price_usd / eurusd_rate

    rsi_1d = RSIIndicator(close=daily_close).rsi().iloc[-1]
    rsi_4h = RSIIndicator(close=hourly_close).rsi().iloc[-20]
    rsi_1h = RSIIndicator(close=hourly_close).rsi().iloc[-1]

    returns = np.log(daily_close / daily_close.shift(1)).dropna()
    volatility = float(returns.std() * np.sqrt(365))

    perf_1d = ((daily_close.iloc[-1] / daily_close.iloc[-2] - 1) * 100)
    perf_7d = ((daily_close.iloc[-1] / daily_close.iloc[-8] - 1) * 100)
    perf_30d = ((daily_close.iloc[-1] / daily_close.iloc[-31] - 1) * 100)
    perf_60d = ((daily_close.iloc[-1] / daily_close.iloc[-61] - 1) * 100)
    perf_90d = ((daily_close.iloc[-1] / daily_close.iloc[-91] - 1) * 100)
    perf_120d = ((daily_close.iloc[-1] / daily_close.iloc[-121] - 1) * 100)

    score = compute_risk_score(
        volatility=volatility,
        rsi_1h=rsi_1h,
        rsi_4h=rsi_4h,
        rsi_1d=rsi_1d,
        perf_1d=perf_1d,
        perf_7d=perf_7d,
        perf_30d=perf_30d,
        perf_60d=perf_60d,
        perf_90d=perf_90d,
        perf_120d=perf_120d,
    )

    return {
        "symbol": symbol.upper(),
        "price_eur": round(price_eur, 4),
        "volatility": round(volatility, 4),
        "risk_score": round(score, 2),
        "rsi_1h": round(rsi_1h, 2),
        "rsi_4h": round(rsi_4h, 2),
        "rsi_1d": round(rsi_1d, 2),
        "perf_1d": round(perf_1d, 2),
        "perf_7d": round(perf_7d, 2),
        "perf_30d": round(perf_30d, 2),
        "perf_60d": round(perf_60d, 2),
        "perf_90d": round(perf_90d, 2),
        "perf_120d": round(perf_120d, 2),
    }
