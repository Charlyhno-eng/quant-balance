# quant-balance

## Overview

---

## Installation

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

```bash
cd frontend
npm install
```

---

## Frontend

```bash
npm run dev
```

---

## Backend

```bash
uvicorn main:app --reload
```

##### Test the API:

http://127.0.0.1:8000/risk_score?symbol=PENGU34466-USD

---

### How the risk score is calculated

* $\text{volatility}$ be the annualized volatility
* $\text{RSI}_{1h}, \text{RSI}_{4h}, \text{RSI}_{1d}$ be the RSI values for 1 hour, 4 hours, and 1 day intervals, respectively
* $\text{Perf}_{1d}, \text{Perf}_{7d}, \text{Perf}_{30d}, \text{Perf}_{90d}$ be the performance percentages over 1, 7, 30, and 90 days, respectively

Define the auxiliary functions:

$$
\text{clamp01}(x) = \min(1, \max(0, x))
$$

$$
\text{scale\_RSI}(rsi) = 0.01 + 0.98 \times \text{clamp01} \left( \frac{rsi - 30}{60} \right)
$$

$$
\text{scale\_Perf}(perf, s) = \text{clamp01}\left( \frac{|perf|}{s} \right)
$$

where $s$ is the scaling factor depending on the time period.

The risk score before scaling is computed as:

$$
\begin{aligned}
\text{risk\_score} =\; & 0.25 \times \text{clamp01}(\text{volatility}) \\
& + 0.07 \times \text{scale\_RSI}(\text{RSI}_{1h}) \\
& + 0.09 \times \text{scale\_RSI}(\text{RSI}_{4h}) \\
& + 0.07 \times \text{scale\_RSI}(\text{RSI}_{1d}) \\
& + 0.07 \times \text{scale\_Perf}(\text{Perf}_{1d}, 20) \\
& + 0.09 \times \text{scale\_Perf}(\text{Perf}_{7d}, 50) \\
& + 0.07 \times \text{scale\_Perf}(\text{Perf}_{30d}, 100) \\
& + 0.06 \times \text{scale\_Perf}(\text{Perf}_{90d}, 100)
\end{aligned}
$$

Finally, the risk score is scaled and bounded between 1 and 10:

$$
\text{Risk Score} = \min \left( 10, \max \left( 1, 10 \times \text{risk\_score} \right) \right)
$$
