import ccxt
import pandas as pd
import numpy as np
from ta.momentum import RSIIndicator
from datetime import datetime, timedelta
import time
import httpx

binance = ccxt.binance()

def clamp01(x):
    return min(1, max(0, x))

def scale_rsi(rsi_value):
    base = clamp01((rsi_value - 30) / 60)
    return 0.01 + base * 0.98

def scale_perf(perf_value, scale):
    return clamp01(abs(perf_value) / scale)

def fetch_fear_and_greed():
    url = "https://api.alternative.me/fng/?limit=1"
    try:
        response = httpx.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if "data" in data and len(data["data"]) > 0:
            latest = data["data"][0]
            return int(latest["value"])
        else:
            return None
    except Exception:
        return None

def compute_risk_score(volatility, fear_and_greed_value, rsi_1h, rsi_4h, rsi_1d, perf_1d, perf_7d, perf_30d, perf_60d, perf_90d, perf_120d):
    vol_score = clamp01(volatility / 2.0)

    rsi_1h_score = scale_rsi(rsi_1h)
    rsi_4h_score = scale_rsi(rsi_4h)
    rsi_1d_score = scale_rsi(rsi_1d)

    perf_1d_score = scale_perf(perf_1d, 20.0)
    perf_7d_score = scale_perf(perf_7d, 50.0)
    perf_30d_score = scale_perf(perf_30d, 100.0)
    perf_90d_score = scale_perf(perf_90d, 100.0)
    perf_120d_score = scale_perf(perf_120d, 100.0)

    fear_and_greed_norm = clamp01(fear_and_greed_value / 100.0)

    risk_score = (
        0.30 * vol_score +
        0.35 * fear_and_greed_norm +
        0.10 * rsi_1h_score +
        0.10 * rsi_4h_score +
        0.10 * rsi_1d_score +
        0.10 * perf_1d_score +
        0.05 * perf_7d_score +
        0.05 * perf_30d_score +
        0.05 * perf_90d_score +
        0.05 * perf_120d_score
    )
    return min(10, max(1, risk_score * 10))

def fetch_ohlcv(symbol, timeframe, since_days):
    since = int((datetime.utcnow() - timedelta(days=since_days)).timestamp() * 1000)
    all_candles = []
    limit = 1000

    while True:
        candles = binance.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit)
        if not candles:
            break
        all_candles.extend(candles)
        if len(candles) < limit:
            break
        since = candles[-1][0] + 1
        time.sleep(0.2)

    df = pd.DataFrame(all_candles, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df.set_index("timestamp", inplace=True)
    return df

def fetch_and_compute(symbol: str) -> dict:
    market_symbol = f"{symbol}/USDT"

    daily = fetch_ohlcv(market_symbol, "1d", 130)
    hourly = fetch_ohlcv(market_symbol, "1h", 7)

    if daily.empty or hourly.empty:
        raise ValueError("Market data unavailable for the given symbol.")

    daily_close = daily["close"]
    hourly_close = hourly["close"]

    price_usd = float(daily_close.iloc[-1])

    # EUR conversion
    fx = fetch_ohlcv("EUR/USDT", "1d", 5)
    if fx.empty:
        raise ValueError("EUR/USDT data unavailable.")
    eurusd_rate = float(fx["close"].iloc[-1])

    price_eur = price_usd / eurusd_rate

    rsi_1d = RSIIndicator(close=daily_close).rsi().iloc[-1]
    rsi_4h = RSIIndicator(close=hourly_close).rsi().iloc[-20]
    rsi_1h = RSIIndicator(close=hourly_close).rsi().iloc[-1]

    returns = np.log(daily_close / daily_close.shift(1)).dropna()
    volatility = float(returns.std() * np.sqrt(365))

    def get_perf(n):
        if len(daily_close) <= n:
            return 0
        return (daily_close.iloc[-1] / daily_close.iloc[-n - 1] - 1) * 100

    perf_1d = get_perf(1)
    perf_7d = get_perf(7)
    perf_30d = get_perf(30)
    perf_60d = get_perf(60)
    perf_90d = get_perf(90)
    perf_120d = get_perf(120)

    fear_and_greed_value = fetch_fear_and_greed()
    if fear_and_greed_value is None:
        fear_and_greed_value = 50

    score = compute_risk_score(
        volatility=volatility,
        fear_and_greed_value=fear_and_greed_value,
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

    if volatility < 0.1:
        score = 1.0

    return {
        "symbol": symbol.upper(),
        "price_eur": round(price_eur, 4),
        "volatility": round(volatility, 4),
        "fear_and_greed_value": fear_and_greed_value,
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
