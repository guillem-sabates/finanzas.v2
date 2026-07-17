# Mercados & Carteras · Prototipo (Guillem S.)

Panel de mercado y backtester de carteras (ETFs y fondos) con **datos reales** de
Yahoo Finance. Prototipo educativo: no es asesoramiento financiero.

## Ver la plataforma

- **En la web:** el enlace de GitHub Pages de este repositorio
  (Settings → Pages). Siempre con los datos del día.
- **En local:** los datos se cargan por `fetch`, así que hace falta un servidor
  (con doble clic se vería el **modo demo** con datos simulados):
  `python -m http.server` y abrir `http://localhost:8000`.

## Cómo se actualizan los datos

- **Automático (en la web):** `.github/workflows/actualizar-datos.yml` ejecuta
  `fetch_datos.py` cada día laborable tras el cierre de EE.UU. y actualiza
  **`datos.json`** (JSON pasivo, no ejecutable). Si la descarga o la validación
  fallan, el job se pone en rojo y **se conserva el último `datos.json` bueno**.
- **Tests en cada cambio:** `.github/workflows/ci.yml` ejecuta pytest y Vitest
  en cada push/PR.
- **Manual (en tu PC):** `python fetch_datos.py` (solo Python, sin dependencias).

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La página (sin JS inline; CSP estricta). |
| `js/finance.js` | Motor financiero puro (el mismo que prueban los tests). |
| `js/app.js` | Lógica de la aplicación y render. |
| `datos.json` | Datos de mercado (precios ajustados, macro, FX EUR/USD). |
| `fetch_datos.py` | Descargador/validador (escritura atómica, comparación con el anterior). |
| `tests/` | pytest (descargador) · Vitest (motor) · Playwright (UI). |

## Añadir fondos

En `fetch_datos.py`, lista `FONDOS`: añade `("símbolo_yahoo", "Nombre", "Banco", "tipo")`
y ejecuta el workflow (o el script). Los símbolos de fondos en Yahoo son tipo `0P0000XXXX.F`;
se localizan con `https://query1.finance.yahoo.com/v1/finance/search?q=<ISIN>`.

## Metodología y límites

- Cierres **ajustados** (rentabilidad total, dividendos reinvertidos), compra y mantén,
  sin rebalanceo. Sharpe/Sortino con tipo sin riesgo 0.
- Conversión EUR/USD con tipo de cambio **histórico fecha a fecha** (sin costes de cambio
  ni cobertura). Sin comisiones de compraventa ni impuestos.
- Inflación: medias anuales aproximadas (Eurostat/BLS) para la rentabilidad "real".
- **Rentabilidad pasada no garantiza resultados futuros.**


<!-- v2 -->
