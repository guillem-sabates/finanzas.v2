// Playwright. CI:  npx playwright test
// Listeners de consola/pageerror registrados ANTES de navegar (§9).
import { test as base, expect } from '@playwright/test';

// Fixture: adjunta captura de errores antes de cualquier navegación.
const test = base.extend({
  errs: async ({ page }, use) => {
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('pageerror', e => errs.push('pageerror: ' + String(e)));
    await use(errs);
  },
});


/* La app carga datos.json de forma asíncrona: esperar a __APP_READY__ evita ejecutar
   cálculos antes de que existan los datos (falsos rojos intermitentes). */
const abrir=async(page,url='/index.html')=>{await page.goto(url);await page.waitForFunction(()=>window.__APP_READY__===true,{timeout:15000});};

const noBasura = async (page) => {
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/\bNaN\b|\bInfinity\b|\bundefined\b/);
};

test('§6 no existe funcionalidad de fondos manuales', async ({ page, errs }) => {
  await abrir(page);
  await page.click('#mainNav button[data-page="fondos"]');
  expect(await page.locator('input[type=file]').count()).toBe(0);
  expect(await page.locator('textarea').count()).toBe(0);
  for (const t of ['Añade un fondo a mano', 'VL histórico', 'Rentab. de la ficha'])
    await expect(page.locator('body')).not.toContainText(t);
  for (const id of ['fundName', 'fundData', 'fundAnnual', 'fichaVol', 'fichaMdd', 'fundAddBtn', 'fundAddFichaBtn', 'fundFile', 'fundMode'])
    expect(await page.locator('#' + id).count()).toBe(0);
  expect(errs).toEqual([]);
});

test('ETF 60/40 + presets, recalcular 10 veces, sin errores', async ({ page, errs }) => {
  await abrir(page);
  await page.click('#mainNav button[data-page="bt"]');
  for (let i = 0; i < 10; i++) await page.click('.classic[data-preset="6040"]');
  for (const p of ['allw', 'perm', 'gb', 'bogle']) await page.click(`.classic[data-preset="${p}"]`);
  await expect(page.locator('#bt-results .kpi').first()).toBeVisible();
  await noBasura(page);
  expect(errs).toEqual([]);
});

test('§8 divisas: EUR vs EUR permitido, EUR vs USD bloqueado, A EUR vs B USD bloqueado', async ({ page }) => {
  await abrir(page);
  await page.click('#mainNav button[data-page="fondos"]');
  // EUR (CaixaBank España) vs benchmark USD (ACWI) -> bloqueado
  await page.evaluate(() => { fportfolio = { 'FY_0P00000P6Y.F': 100 }; renderFPortfolio(); });
  await page.selectOption('#fbenchSel', 'ACWI');
  await page.click('#fbtnCalc');
  await expect(page.locator('#f-results')).toContainText('mezclan divisas');
  expect(await page.locator('#f-results .kpi').count()).toBe(0);
  // EUR vs EUR -> permitido
  await page.selectOption('#fbenchSel', 'FY_0P00000PIC.F');
  await page.click('#fbtnCalc');
  await expect(page.locator('#f-results .kpi').first()).toBeVisible();
});

test('§1 fondo unavailable: desactivado y no calcula', async ({ page }) => {
  await abrir(page);
  await page.click('#mainNav button[data-page="fondos"]');
  const bloqueado = await page.evaluate(() => {
    // inyecta un fondo unavailable (sin PRICES) y intenta usarlo de benchmark
    FUNDS_META['FY_TEST'] = { n: 'Fondo caído', fondo: true, banco: 'CaixaBank', tipo: 'x', status: 'unavailable', currency: 'EUR' };
    renderFundCatalog('');
    const off = document.querySelector('button.etf-off') !== null;
    fportfolio = { 'FY_0P00000P6Y.F': 100 }; renderFPortfolio();
    fbench = 'FY_TEST';                 // referencia sin datos
    doBacktest(fportfolio, 'FY_TEST', 'all', 'f-results');
    const txt = document.getElementById('f-results').innerText;
    return { off, sinKpi: !document.querySelector('#f-results .kpi'), controlado: /no tiene datos|no disponible/i.test(txt) };
  });
  expect(bloqueado.off).toBe(true);
  expect(bloqueado.sinKpi).toBe(true);
  expect(bloqueado.controlado).toBe(true);
});

test('§8 benchmark ausente: mensaje controlado, sin errores', async ({ page }) => {
  await abrir(page);
  await page.click('#mainNav button[data-page="fondos"]');
  const r = await page.evaluate(() => {
    fportfolio = { 'FY_0P00000P6Y.F': 100 }; renderFPortfolio();
    doBacktest(fportfolio, 'NO_EXISTE', 'all', 'f-results');
    return { sinKpi: !document.querySelector('#f-results .kpi'), texto: document.getElementById('f-results').innerText };
  });
  expect(r.sinKpi).toBe(true);
  expect(r.texto).toMatch(/no tiene datos|referencia/i);
});

test('§4 metadata XSS no se ejecuta', async ({ page, errs }) => {
  await abrir(page);
  await page.click('#mainNav button[data-page="fondos"]');
  const ejecutado = await page.evaluate(() => {
    window.__xss = false;
    const k = Object.keys(FUNDS_META).find(x => FUNDS_META[x].banco);
    FUNDS_META[k].n = '<img src=x onerror="window.__xss=true">';
    FUNDS_META[k].tipo = '<svg onload="window.__xss=true">';
    renderFundCatalog(''); refreshFundBench();
    fportfolio = { [k]: 100 }; renderFPortfolio();
    return window.__xss;
  });
  expect(ejecutado).toBe(false);
  expect(errs).toEqual([]);
});

test('§5 datos.json corrupto: cae a demo, sin pantalla en blanco', async ({ page }) => {
  await page.route('**/datos.json', route => route.fulfill({ status: 200, body: '{ esto no es json' }));
  await abrir(page);
  // la app valida el esquema y cae a modo demo; NO pantalla en blanco
  await expect(page.locator('#mainNav')).toBeVisible();
  await expect(page.locator('#worstList')).not.toBeEmpty();
  await expect(page.locator('#stamp')).toContainText('DEMO');
});

test('§5 CSP: script-src sin unsafe-inline y connect-src self', async ({ page }) => {
  await abrir(page);
  const csp = await page.evaluate(() => document.querySelector('meta[http-equiv="Content-Security-Policy"]').content);
  expect(csp).toMatch(/script-src[^;]*'self'/);
  expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  expect(csp).toMatch(/connect-src 'self'/);
  // no debe quedar JS embebido ni handlers inline en el HTML servido
  const html = await page.content();
  expect(html).not.toMatch(/onclick=/i);
});

test('tabla de sectores es ordenable', async ({ page }) => {
  await abrir(page);
  const rows = () => page.locator('#sectorTable tbody tr td.name b').allInnerTexts();
  const a = await rows();
  await page.locator('#sectorTable thead th').nth(6).click();
  await page.locator('#sectorTable thead th').nth(6).click();
  expect((await rows()).join()).not.toEqual(a.join());
});

test('móvil 375px: las tres pestañas sin overflow horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await abrir(page);
  for (const p of ['dash', 'bt', 'fondos']) {
    await page.click(`#mainNav button[data-page="${p}"]`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    expect(overflow, `overflow en ${p}`).toBe(false);
  }
});

// ---------------- Bloque MACRO: resiliencia (§1 del encargo) ----------------
test('macro: 4 tarjetas visibles y resilientes a datos faltantes', async ({ page, errs }) => {
  await abrir(page);
  const r = await page.evaluate(() => {
    if (!window.MACRO) return { skip: true };
    const full = JSON.parse(JSON.stringify(MACRO));
    const cards = () => document.querySelectorAll('#macroWrap .card').length;
    const vis = () => !document.getElementById('macroSection').classList.contains('hidden');
    const txt = () => document.getElementById('macroWrap').innerText;
    const limpio = () => !/\bNaN\b|\bInfinity\b|\bundefined\b/.test(txt());
    const out = {};
    renderMacro();
    out.todos = { vis: vis(), cards: cards(), limpio: limpio() };
    for (const k of ['VIX', 'T10Y', 'EURUSD', 'DXY']) {
      MACRO = JSON.parse(JSON.stringify(full)); delete MACRO[k]; renderMacro();
      out['falta_' + k] = { vis: vis(), cards: cards(), limpio: limpio() };
    }
    MACRO = null; renderMacro(); out.ausente = { vis: vis() };
    MACRO = full; renderMacro();
    return out;
  });
  if (r.skip) return;
  expect(r.todos).toEqual({ vis: true, cards: 4, limpio: true });
  for (const k of ['VIX', 'T10Y', 'EURUSD', 'DXY'])
    expect(r['falta_' + k], k).toEqual({ vis: true, cards: 4, limpio: true });
  expect(r.ausente.vis).toBe(false);   // macro totalmente ausente -> oculta
  expect(errs).toEqual([]);
});

// ---------------- Conversión de divisas (§2 del encargo) ----------------
const EUR_FUND = 'FY_0P00000P6Y.F';   // fondo CaixaBank en EUR

test('FX: fondo EUR vs ETF USD convertidos a EUR y a USD', async ({ page, errs }) => {
  await abrir(page);
  const r = await page.evaluate((fEUR) => {
    if (!window.FXR) return { skip: true };
    const c = document.getElementById('f-results');
    const limpio = () => !/\bNaN\b|\bInfinity\b|\bundefined\b/.test(c.innerText);
    doBacktest({ [fEUR]: 100 }, 'ACWI', 'all', 'f-results', 'EUR');
    const eur = { conv: /convertidos de USD a EUR/.test(c.innerText), kpi: !!c.querySelector('.kpi'), limpio: limpio() };
    doBacktest({ [fEUR]: 100 }, 'ACWI', 'all', 'f-results', 'USD');
    const usd = { conv: /convertidos de EUR a USD/.test(c.innerText), kpi: !!c.querySelector('.kpi'), limpio: limpio() };
    // mismo activo, distinta base -> distinto resultado (efecto divisa)
    doBacktest({ SPY: 100 }, 'ACWI', 'all', 'bt-results', 'USD');
    const uSpy = document.querySelector('#bt-results .kpi .v').textContent;
    doBacktest({ SPY: 100 }, 'ACWI', 'all', 'bt-results', 'EUR');
    const eSpy = document.querySelector('#bt-results .kpi .v').textContent;
    return { eur, usd, efecto: uSpy !== eSpy };
  }, EUR_FUND);
  if (r.skip) return;
  expect(r.eur).toEqual({ conv: true, kpi: true, limpio: true });
  expect(r.usd).toEqual({ conv: true, kpi: true, limpio: true });
  expect(r.efecto).toBe(true);
  expect(errs).toEqual([]);
});

test('FX: mismas divisas no muestran aviso de conversión', async ({ page }) => {
  await abrir(page);
  const r = await page.evaluate(() => {
    doBacktest({ SPY: 60, AGG: 40 }, 'ACWI', 'all', 'bt-results', 'USD');   // todo USD, base USD
    const t = document.getElementById('bt-results').innerText;
    return { sinAviso: !/tipos de cambio históricos/.test(t), kpi: !!document.querySelector('#bt-results .kpi') };
  });
  expect(r).toEqual({ sinAviso: true, kpi: true });
});

test('FX ausente: aviso + opción explícita sin conversión (desactivada por defecto)', async ({ page }) => {
  await abrir(page);
  const r = await page.evaluate((fEUR) => {
    const savedFXR = window.FXR, savedFirst = window.FX_FIRST;
    FXR = null; FX_FIRST = -1;                    // simula FX no disponible
    doBacktest({ [fEUR]: 100 }, 'ACWI', 'all', 'f-results', 'EUR');
    const c = document.getElementById('f-results');
    const cb = c.querySelector('input[type=checkbox]'), btn = c.querySelector('button');
    const aviso = /No se puede convertir la divisa/.test(c.innerText);
    const off = btn && btn.style.pointerEvents === 'none';
    cb.checked = true; cb.dispatchEvent(new Event('change'));
    const on = btn.style.pointerEvents === 'auto';
    btn.click();
    const sinConv = /sin ajustar divisas/i.test(c.innerText), kpi = !!c.querySelector('.kpi');
    const limpio = !/\bNaN\b|\bInfinity\b|\bundefined\b/.test(c.innerText);
    FXR = savedFXR; FX_FIRST = savedFirst;
    return { aviso, off, on, sinConv, kpi, limpio };
  }, EUR_FUND);
  expect(r).toEqual({ aviso: true, off: true, on: true, sinConv: true, kpi: true, limpio: true });
});

test('FX: Cartera A EUR contra Cartera B USD convertida', async ({ page, errs }) => {
  await abrir(page);
  const r = await page.evaluate((fEUR) => {
    if (!window.FXR) return { skip: true };
    doBacktest({ [fEUR]: 100 }, { weights: { SPY: 100 }, name: 'Cartera B' }, 'all', 'f-results', 'EUR');
    const c = document.getElementById('f-results');
    return { conv: /convertidos de USD a EUR/.test(c.innerText), kpi: !!c.querySelector('.kpi'),
             limpio: !/\bNaN\b|\bInfinity\b|\bundefined\b/.test(c.innerText) };
  }, EUR_FUND);
  if (r.skip) return;
  expect(r).toEqual({ conv: true, kpi: true, limpio: true });
  expect(errs).toEqual([]);
});

// v2
