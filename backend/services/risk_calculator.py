import numpy as np
import yfinance as yf
from ta.momentum import RSIIndicator

def clamp01(x):
    """
    Clamp a value between 0 and 1.

    Parameters:
        x (float): Input value.

    Returns:
        float: Value clamped to the range [0, 1].
    """
    return min(1, max(0, x))

def scale_rsi(rsi_value):
    """
    Scale RSI value from range [30, 90] to approximately [0.01, 0.99].

    Parameters:
        rsi_value (float): RSI value, typically between 0 and 100.

    Returns:
        float: Scaled RSI score between 0.01 and 0.99.
    """
    base = clamp01((rsi_value - 30) / 60)
    return 0.01 + base * 0.98

def scale_perf(perf_value, scale):
    """
    Scale performance value by dividing by a scale and clamping between 0 and 1.

    Parameters:
        perf_value (float): Performance percentage (can be positive or negative).
        scale (float): Scaling factor representing the max expected absolute performance.

    Returns:
        float: Scaled performance score between 0 and 1.
    """
    return clamp01(abs(perf_value) / scale)

def compute_risk_score(volatility, rsi_1h, rsi_4h, rsi_1d, perf_1d, perf_7d, perf_30d, perf_90d):
    """
    Compute an overall risk score based on volatility, RSI values, and performance metrics.

    Parameters:
        volatility (float): Annualized volatility.
        rsi_1h (float): 1-hour RSI.
        rsi_4h (float): 4-hour RSI.
        rsi_1d (float): 1-day RSI.
        perf_1d (float): Performance over 1 day in percentage.
        perf_7d (float): Performance over 7 days in percentage.
        perf_30d (float): Performance over 30 days in percentage.
        perf_90d (float): Performance over 90 days in percentage.

    Returns:
        float: Risk score scaled between 1 and 10.
    """
    vol_score = clamp01(volatility / 2.0)

    rsi_1h_score = scale_rsi(rsi_1h)
    rsi_4h_score = scale_rsi(rsi_4h)
    rsi_1d_score = scale_rsi(rsi_1d)

    perf_1d_score = scale_perf(perf_1d, 20.0)
    perf_7d_score = scale_perf(perf_7d, 50.0)
    perf_30d_score = scale_perf(perf_30d, 100.0)
    perf_90d_score = scale_perf(perf_90d, 100.0)

    risk_score = (
        0.50 * vol_score +
        0.07 * rsi_1h_score +
        0.09 * rsi_4h_score +
        0.07 * rsi_1d_score +
        0.07 * perf_1d_score +
        0.09 * perf_7d_score +
        0.07 * perf_30d_score +
        0.06 * perf_90d_score
    )
    return min(10, max(1, risk_score * 10))

def fetch_and_compute(symbol: str) -> dict:
    """
    Fetch market data for a given symbol and compute its risk score.

    Parameters:
        symbol (str): Ticker symbol of the cryptocurrency.

    Raises:
        ValueError: If market data is unavailable for the given symbol.

    Returns:
        dict: Dictionary containing symbol, indicators, performances, and risk score.
    """
    daily = yf.download(symbol, interval="1d", period="120d", progress=False)
    hourly = yf.download(symbol, interval="1h", period="7d", progress=False)

    if daily.empty or hourly.empty:
        raise ValueError("Market data unavailable for the given symbol.")

    daily_close = daily["Close"].squeeze()
    hourly_close = hourly["Close"].squeeze()

    rsi_1d = RSIIndicator(close=daily_close).rsi().iloc[-1]
    rsi_4h = RSIIndicator(close=hourly_close).rsi().iloc[-20]
    rsi_1h = RSIIndicator(close=hourly_close).rsi().iloc[-1]

    returns = np.log(daily_close / daily_close.shift(1)).dropna()
    volatility = float(returns.std() * np.sqrt(365))

    perf_1d = ((daily_close.iloc[-1] / daily_close.iloc[-2] - 1) * 100)
    perf_7d = ((daily_close.iloc[-1] / daily_close.iloc[-8] - 1) * 100)
    perf_30d = ((daily_close.iloc[-1] / daily_close.iloc[-31] - 1) * 100)
    perf_90d = ((daily_close.iloc[-1] / daily_close.iloc[-91] - 1) * 100)

    score = compute_risk_score(
        volatility=volatility,
        rsi_1h=rsi_1h,
        rsi_4h=rsi_4h,
        rsi_1d=rsi_1d,
        perf_1d=perf_1d,
        perf_7d=perf_7d,
        perf_30d=perf_30d,
        perf_90d=perf_90d,
    )

    return {
        "symbol": symbol,
        "volatility": volatility,
        "rsi_1h": rsi_1h,
        "rsi_4h": rsi_4h,
        "rsi_1d": rsi_1d,
        "perf_1d": perf_1d,
        "perf_7d": perf_7d,
        "perf_30d": perf_30d,
        "perf_90d": perf_90d,
        "risk_score": round(score, 2),
    }
