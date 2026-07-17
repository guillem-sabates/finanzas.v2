// Vitest (o Jest). Ejecutar en CI: npx vitest run
// Casos de RESULTADO CONOCIDO de las fórmulas de backtest.
import { describe, it, expect } from 'vitest';
// finance.js es un archivo dual (global FIN en navegador / module.exports en Node).
// Importamos el objeto por defecto: son EXACTAMENTE las funciones que ejecuta index.html.
import FIN from '../js/finance.js';
const { metrics, maxDD, portfolioValue, yearly, currencyCheck, weightsValid, corr, fxConvert, convertSeries, dcaValue, cumInflationFactor, realReturn } = FIN;

describe('métricas conocidas', () => {
  it('activo con crecimiento constante 1%/dia', () => {
    const pv = []; let v = 100; for (let i = 0; i <= 252; i++) { pv.push(v); v *= 1.01; }
    const m = metrics(pv, 1);
    expect(m.totalRet).toBeCloseTo(Math.pow(1.01, 252) - 1, 6);
    expect(m.mdd).toBeCloseTo(0, 10);          // nunca cae
    expect(m.vol).toBeCloseTo(0, 8);           // sin variación de retorno
  });

  it('caída exacta del 50% -> maxDD = -0.5', () => {
    expect(maxDD([100, 120, 60, 80])).toBeCloseTo(-0.5, 10);
  });

  it('serie constante -> total 0, vol 0, sin NaN/Infinity', () => {
    const m = metrics(new Array(100).fill(50), 1);
    expect(m.totalRet).toBe(0);
    expect(m.vol).toBe(0);
    expect(Number.isFinite(m.sharpe)).toBe(true); // 0, no Infinity
    expect(Number.isNaN(m.sharpe)).toBe(false);
  });

  it('cartera 50/50 buy&hold: los pesos derivan (no rebalancea)', () => {
    // A duplica, B se mantiene. Valor final = 0.5*200 + 0.5*100 = 150 -> +50%
    const prices = { A: [100, 200], B: [100, 100] };
    const pv = portfolioValue(prices, { A: 50, B: 50 }, 0, 1);
    expect(pv[1] / pv[0] - 1).toBeCloseTo(0.5, 10);
  });

  it('mejor/peor año desde la serie de la cartera', () => {
    // años 2021(+20%), 2022(-50%), 2023(+10%) sobre la serie
    const pv = [100, 120, 60, 66];
    const years = [2020, 2021, 2022, 2023];
    const y = yearly(pv, years);
    expect(y.best.y).toBe(2021); expect(y.best.r).toBeCloseTo(0.2, 6);
    expect(y.worst.y).toBe(2022); expect(y.worst.r).toBeCloseTo(-0.5, 6);
  });

  it('correlación perfecta +1 y -1', () => {
    expect(corr([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1, 10);
    expect(corr([1, 2, 3, 4], [4, 3, 2, 1])).toBeCloseTo(-1, 10);
  });
});

describe('validaciones', () => {
  it('divisas incompatibles se detectan', () => {
    const c = currencyCheck({ A: 'EUR', B: 'USD' }, ['A', 'B']);
    expect(c.mixed).toBe(true); expect(c.symbol).toBe(null);
  });
  it('divisa única', () => {
    expect(currencyCheck({ A: 'EUR', B: 'EUR' }, ['A', 'B']).mixed).toBe(false);
  });
  it('pesos que no suman 100 se rechazan', () => {
    expect(weightsValid({ A: 60, B: 30 }).ok).toBe(false);
  });
  it('pesos negativos se rechazan', () => {
    expect(weightsValid({ A: 120, B: -20 }).ok).toBe(false);
  });
  it('pesos válidos = 100', () => {
    expect(weightsValid({ A: 60, B: 40 }).ok).toBe(true);
  });
});

describe('§3 series constantes y entradas inválidas (nunca NaN/Infinity)', () => {
  it('dos series constantes -> correlación null (no 0)', () => {
    expect(corr([5, 5, 5, 5], [3, 3, 3, 3])).toBe(null);
  });
  it('una serie constante y otra variable -> null', () => {
    expect(corr([5, 5, 5, 5], [1, 2, 3, 4])).toBe(null);
  });
  it('menos de 2 puntos -> null', () => {
    expect(corr([1], [1])).toBe(null);
  });
  it('cartera sin volatilidad -> sharpe/sortino 0, no Infinity', () => {
    const m = metrics([100, 100, 100, 100], 1);
    expect(m.vol).toBe(0);
    expect(Number.isFinite(m.sharpe)).toBe(true);
    expect(Number.isFinite(m.sortino)).toBe(true);
  });
  it('serie vacía -> métricas neutras', () => {
    const m = metrics([], 1);
    for (const v of Object.values(m)) expect(Number.isFinite(v)).toBe(true);
  });
  it('serie de un punto -> métricas neutras', () => {
    const m = metrics([100], 1);
    for (const v of Object.values(m)) { expect(Number.isNaN(v)).toBe(false); expect(v).not.toBe(Infinity); }
  });
  it('years <= 0 -> sin Infinity', () => {
    const m = metrics([100, 200], 0);
    for (const v of Object.values(m)) expect(Number.isFinite(v)).toBe(true);
  });
  it('maxDD y pstd con array vacío -> 0', () => {
    expect(maxDD([])).toBe(0);
  });
});

describe('conversión de divisas EUR/USD (fecha a fecha)', () => {
  it('USD -> EUR: precio / EURUSD', () => {
    expect(fxConvert(100, 'USD', 'EUR', 1.20)).toBeCloseTo(83.3333, 3);
    expect(fxConvert(120, 'USD', 'EUR', 1.20)).toBeCloseTo(100, 6);
  });
  it('EUR -> USD: precio * EURUSD', () => {
    expect(fxConvert(100, 'EUR', 'USD', 1.20)).toBeCloseTo(120, 6);
  });
  it('misma divisa -> sin cambio', () => {
    expect(fxConvert(100, 'USD', 'USD', 1.20)).toBe(100);
    expect(fxConvert(100, 'EUR', 'EUR', null)).toBe(100);
  });
  it('tasa inválida o ausente -> null (nunca NaN/Infinity)', () => {
    expect(fxConvert(100, 'USD', 'EUR', 0)).toBe(null);
    expect(fxConvert(100, 'USD', 'EUR', null)).toBe(null);
    expect(fxConvert(100, 'USD', 'EUR', -1)).toBe(null);
    expect(fxConvert(null, 'USD', 'EUR', 1.1)).toBe(null);
  });
  it('par no soportado (GBP) -> null, no se inventa', () => {
    expect(fxConvert(100, 'GBP', 'EUR', 1.15)).toBe(null);
    expect(fxConvert(100, 'USD', 'JPY', 150)).toBe(null);
  });
  it('EJEMPLO NUMÉRICO: activo USD constante 100, EURUSD 1.00->1.20 => en EUR 100 -> 83.333', () => {
    const prices = [100, 100];          // activo USD constante
    const fx = [1.00, 1.20];            // EURUSD sube
    const eur = convertSeries(prices, 'USD', 'EUR', fx, 0, 1);
    expect(eur[0]).toBeCloseTo(100, 6);
    expect(eur[1]).toBeCloseTo(83.3333, 3);
  });
  it('ambos EUR con base EUR: la serie no cambia', () => {
    const s = convertSeries([100, 110, 120], 'EUR', 'EUR', null, 0, 2);
    expect(s).toEqual([100, 110, 120]);
  });
  it('ambos USD con base USD: la serie no cambia', () => {
    const s = convertSeries([50, 55], 'USD', 'USD', [1.1, 1.2], 0, 1);
    expect(s).toEqual([50, 55]);
  });
  it('portfolioValue sobre serie convertida: efecto divisa refleja la rentabilidad esperada', () => {
    // activo USD constante en 100; EURUSD 1.00 -> 1.25 => en EUR cae -20% (100 -> 80)
    const eur = convertSeries([100, 100], 'USD', 'EUR', [1.00, 1.25], 0, 1);
    const pv = portfolioValue({ A: eur }, { A: 100 }, 0, 1, 10000);
    expect(pv[1] / pv[0] - 1).toBeCloseTo(-0.2, 6);
    for (const v of pv) { expect(Number.isFinite(v)).toBe(true); }
  });
});

describe('DCA (aportaciones periódicas)', () => {
  it('mercado siempre alcista: el pago único gana al DCA (mismo total)', () => {
    const pv = []; let v = 10000; for (let i = 0; i < 100; i++) { pv.push(v); v *= 1.01; }
    const total = 1200, months = 12, amount = total / months;
    const offs = []; for (let i = 0; i < months; i++) offs.push(i);
    const lump = pv.map(x => total * x / pv[0]);
    const dca = dcaValue(pv, offs, amount);
    expect(dca[dca.length - 1]).toBeGreaterThan(0);
    expect(lump[lump.length - 1]).toBeGreaterThan(dca[dca.length - 1]);   // único gana en mercado alcista
  });
  it('una sola aportación en t0 equivale al pago único', () => {
    const pv = [100, 150, 200];
    const dca = dcaValue(pv, [0], 100);          // 100 € invertidos en t0
    expect(dca[2]).toBeCloseTo(200, 6);          // 100 * 200/100
  });
  it('DCA compra barato tras una caída y supera al pago único', () => {
    // cae a la mitad y luego recupera: aportar en el suelo bate a invertir todo en el pico
    const pv = [100, 50, 100];
    const lumpEnd = 100 * pv[2] / pv[0];         // 100 al pico -> 100
    const dca = dcaValue(pv, [0, 1], 50);        // 50 en pico + 50 en suelo
    expect(dca[2]).toBeGreaterThan(lumpEnd);     // 50 + 100 = 150 > 100
    expect(dca[2]).toBeCloseTo(150, 6);
  });
  it('nunca NaN aunque haya ceros en la serie', () => {
    const dca = dcaValue([0, 100, 200], [0, 1], 50);
    for (const v of dca) expect(Number.isFinite(v)).toBe(true);
  });
});

describe('rentabilidad real (inflación)', () => {
  it('factor de inflación: 2 años al 8% = 1.1664', () => {
    expect(cumInflationFactor({ 2020: 8, 2021: 8 }, 2020, 0, 2021, 1)).toBeCloseTo(1.1664, 4);
  });
  it('medio año al 10% ~= 1.0488', () => {
    expect(cumInflationFactor({ 2020: 10 }, 2020, 0, 2020, 0.5)).toBeCloseTo(Math.sqrt(1.1), 4);
  });
  it('rentabilidad real: +10% nominal con 8% inflación -> ~+1.85%', () => {
    expect(realReturn(0.10, 1.08)).toBeCloseTo(0.0185, 4);
  });
  it('sin inflación (factor 1) la real == nominal', () => {
    expect(realReturn(0.25, 1)).toBeCloseTo(0.25, 10);
  });
  it('factor inválido -> devuelve la nominal, nunca NaN', () => {
    expect(realReturn(0.1, 0)).toBe(0.1);
    expect(Number.isNaN(realReturn(0.1, NaN))).toBe(false);
  });
  it('AUDIT H-02: año sin dato en el rango -> null (no asume 0% de inflación)', () => {
    expect(cumInflationFactor({ 2020: 8, 2022: 8 }, 2020, 0, 2022, 1)).toBe(null); // falta 2021
    expect(cumInflationFactor({ 2020: 8 }, 2019, 0, 2020, 1)).toBe(null);          // falta 2019
  });
});

describe('AUDIT H-11: mejor/peor año solo con años naturales completos', () => {
  it('sin ningún año completo -> best/worst null y hasFull false', () => {
    // 3 puntos dentro del mismo año: ningún año natural completo
    const y = yearly([100, 110, 120], [2024, 2024, 2024], [3, 6, 9]);
    expect(y.hasFull).toBe(false);
    expect(y.best.y).toBe(null); expect(y.worst.y).toBe(null);
  });
  it('con años completos -> hasFull true y no usa parciales', () => {
    const y = yearly([100, 120, 60, 66], [2020, 2021, 2022, 2023], [11, 11, 11, 11]);
    expect(y.hasFull).toBe(true);
    expect(y.best.y).toBe(2021); expect(y.worst.y).toBe(2022);
  });
});

// v2
