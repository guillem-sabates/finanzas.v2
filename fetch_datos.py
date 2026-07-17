#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_datos.py  ·  Descarga datos REALES de Yahoo Finance y genera 'datos.json'
================================================================================
Qué hace:
  - Baja el histórico diario de cierres AJUSTADOS (rentabilidad total, con
    dividendos reinvertidos) de todos los ETFs, el índice mundial y una
    selección de fondos famosos.
  - Escribe 'datos.json' (JSON PASIVO, no ejecutable) junto a este script.
  - La web lo carga por fetch y valida su esquema; si falta o no cumple,
    usa datos de ejemplo. Un JSON manipulado no puede ejecutar código.

NOVEDAD IMPORTANTE:
  Ya NO hace falta instalar nada (ni 'pip install yfinance').
  Usa solo Python estándar. Basta con:

        python fetch_datos.py           (en Windows)
        python3 fetch_datos.py          (en Mac, si 'python' no funciona)

Coste: 0 €. Usa el endpoint público de Yahoo Finance. Sin clave.

La ÚNICA forma de incorporar un fondo es a través de este pipeline validado:
  1) Busca su símbolo de Yahoo en https://finance.yahoo.com (por ISIN o nombre).
     Los fondos suelen tener símbolos tipo 0P0001XXXX.F  (.F = EUR/Frankfurt).
  2) Añádelo a la lista FONDOS de abajo:  (símbolo, "Nombre", "Banco", "tipo").
  3) Vuelve a ejecutar el script; las validaciones deben pasar antes de publicar.
La aplicación no admite incorporar fondos por su cuenta: la única vía es esta lista.
"""

import json
import math
import os
import sys
import time
import datetime as dt
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # datos.js SIEMPRE junto al script
# Activos obligatorios: si falta cualquiera, el workflow falla y NO se publica.
MANDATORY = ["SPY", "QQQ", "ACWI", "VT", "AGG"]
UA = {"User-Agent": "Mozilla/5.0"}
PERIOD1 = 0               # desde 1970: Yahoo devuelve el histórico COMPLETO de cada activo
                          # (SPY~1993, QQQ~1999, AGG~2003...); los fondos/ACWI/VT desde que existen.
CHART = ("https://query1.finance.yahoo.com/v8/finance/chart/{sym}"
         "?period1={p1}&period2=9999999999&interval=1d&events=div%2Csplit")

# ---- Universo de ETFs (los mismos que la plataforma) + índice mundial -------
ETFS = [
    # Índice mundial (comparar "contra las acciones del mundo")
    "ACWI", "VT",
    # Core · índices y renta fija
    "SPY", "QQQ", "IWM", "DIA", "VTI", "EFA", "EEM", "VGK", "EWJ", "FXI", "INDA", "EWZ",
    "AGG", "SHY", "IEF", "TLT", "LQD", "HYG", "TIP", "BNDX", "EMB",
    # Satélite · sectores y temáticos
    "XLK", "XLF", "XLV", "XLE", "XLI", "XLY", "XLP", "XLU", "XLB", "XLC", "XLRE",
    "SMH", "KRE", "XBI", "XOP", "XHB", "ITA", "ARKK", "BOTZ", "ICLN", "TAN", "LIT",
    "CIBR", "URA", "SKYY", "FINX", "GDX", "JETS", "DRIV", "BLOK", "WCLD", "IGV",
    "COPX", "REMX", "XME", "NLR",
    # Activos reales · materias primas, inmobiliario y cripto
    "GLD", "SLV", "DBC", "USO", "UNG", "DBA", "DBB", "VNQ", "IBIT", "ETHA",
]

# ---- Macro: tipos de interés, VIX y divisas (niveles, no rentabilidad) ------
# Se guardan aparte (payload["macro"]); NO entran en el panel de ETFs.
MACRO = [
    ("^VIX", "VIX"),        # índice de volatilidad
    ("^IRX", "T3M"),        # Treasury 3 meses (%)
    ("^FVX", "T5Y"),        # Treasury 5 años (%)
    ("^TNX", "T10Y"),       # Treasury 10 años (%)
    ("^TYX", "T30Y"),       # Treasury 30 años (%)
    ("EURUSD=X", "EURUSD"), # euro / dólar
    ("DX-Y.NYB", "DXY"),    # índice dólar
]

# ---- Fondos: (símbolo Yahoo, nombre, BANCO, tipo) ---------------------------
# BANCO agrupa el catálogo por entidad: "CaixaBank", "Santander", "BBVA" o
# "Independientes" (gestoras independientes / de autor). El "tipo" es la
# categoría corta que se muestra en cada fondo (Bolsa Europa, Renta fija, etc.).
# Para añadir un fondo por ISIN: búscalo en https://finance.yahoo.com y copia su
# símbolo 0P...  (o pásame el ISIN y lo resuelvo).
# Cada banco, ordenado de MENOS a MÁS riesgo (ese orden se respeta en la web).
FONDOS = [
    # ================= CaixaBank =================
    ("0P0001QM72.F", "CaixaBank Renta Fija Corto Plazo",    "CaixaBank", "Renta fija corto plazo"),
    ("0P00017HNP.F", "CaixaBank Destino 2030",              "CaixaBank", "Objetivo 2030"),
    ("0P00017HNR.F", "CaixaBank Destino 2040",              "CaixaBank", "Objetivo 2040"),
    ("0P00017HNT.F", "CaixaBank Destino 2050",              "CaixaBank", "Objetivo 2050"),
    ("0P0001ODL4.F", "CaixaBank Destino 2060",              "CaixaBank", "Objetivo 2060"),
    ("0P000018SN.F", "CaixaBank Bolsa Dividendo Europa",    "CaixaBank", "Bolsa · Dividendo Europa"),
    ("0P00006ETR.F", "CaixaBank Bolsa Gestión Europa",      "CaixaBank", "Bolsa Europa"),
    ("0P00000P6Y.F", "CaixaBank Bolsa Gestión España",      "CaixaBank", "Bolsa España"),
    ("0P0000XRHI.F", "CaixaBank Selección Tendencias",      "CaixaBank", "Temático · Tendencias"),
    ("0P00000P68.F", "CaixaBank Gestión Tendencias",        "CaixaBank", "Temático · Tendencias"),
    ("0P00000PJM.F", "CaixaBank Comunicación Mundial",      "CaixaBank", "Temático · Comunicación"),
    ("0P00000JMN.F", "CaixaBank Bolsa Selección Emergentes","CaixaBank", "Bolsa · Emergentes"),

    # ================= BBVA =================
    ("0P00000DAY.F", "BBVA Rentabilidad Ahorro Corto Plazo","BBVA", "Renta fija corto plazo"),
    ("0P0001CC4T.F", "BBVA Ahorro Cartera",                 "BBVA", "Mixto conservador"),
    ("0P0001OEO6.F", "BBVA Patrimonio Global Conservador",  "BBVA", "Mixto conservador"),
    ("0P00000V7V.F", "BBVA Gestión Conservadora",           "BBVA", "Perfil conservador"),
    ("0P00000PIM.F", "BBVA Gestión Moderada",               "BBVA", "Perfil moderado"),
    ("0P00018H0W.F", "BBVA Mi Objetivo 2031",               "BBVA", "Objetivo 2031"),
    ("0P00000L3B.F", "BBVA Gestión Decidida",               "BBVA", "Perfil decidido"),
    ("0P0001BF04.F", "Bindex Euro ESG Índice",              "BBVA", "Bolsa Europa (índice)"),
    ("0P00000PHR.F", "BBVA Bolsa Índice Euro",              "BBVA", "Bolsa Europa (índice)"),
    ("0P0001BF05.F", "Bindex España Índice",                "BBVA", "Bolsa España (índice)"),
    ("0P00000PIC.F", "BBVA Bolsa Plus",                     "BBVA", "Bolsa España"),
    ("0P00000PI5.F", "BBVA Quality Mejores Ideas",          "BBVA", "Bolsa · alta convicción"),
    ("0P0001C2DG.F", "Bindex USA Índice",                   "BBVA", "Bolsa EE.UU. (índice)"),
    ("0P00000V7Q.F", "BBVA Megatendencia Tecnología",       "BBVA", "Temático · Tecnología"),
    ("0P00000PH5.F", "BBVA Bolsa Emergentes MF",            "BBVA", "Bolsa · Emergentes"),

    # ================= Santander =================
    ("0P0001Q48V.F", "Santander Corto Plazo",               "Santander", "Renta fija corto plazo"),
    ("0P00016ZNJ.F", "Santander Rendimiento",               "Santander", "Renta fija corto plazo"),
    ("0P00000PHN.F", "Santander Sostenible Renta Fija Ahorro","Santander", "Renta fija"),
    ("0P0000RVDZ.F", "Santander PB Dynamic Portfolio",      "Santander", "Mixto"),
    ("0P0001I2CK.F", "Santander Mi Cartera Gestión Flexible 1","Santander", "Mixto flexible"),
    ("0P000155MY.F", "Santander Gestión Global Decidido",   "Santander", "Perfil decidido"),
    ("0P0001J731.F", "Santander Mi Cartera RV Europa",      "Santander", "Bolsa Europa"),
    ("0P00000CZO.F", "Santander Acciones Españolas",        "Santander", "Bolsa España"),
]

# Gestoras independientes: retiradas de momento a petición del usuario.
# Para reactivarlas, añade  + INDEPENDIENTES  a FONDOS (abajo, en main).
INDEPENDIENTES = [
    ("0P0001DFE8.F", "Horos Value Internacional",   "Independientes", "Value"),
    ("0P00019W2R.F", "Cobas Internacional",          "Independientes", "Value"),
    ("0P00016YQ5.F", "azValor Internacional",        "Independientes", "Value"),
    ("0P00000P2M.F", "Bestinver Internacional",      "Independientes", "Value"),
    ("0P0001572W.F", "Magallanes European Equity",   "Independientes", "Value"),
    ("0P00011MD7.F", "True Value",                    "Independientes", "Value"),
    ("0P0000RU7W.L", "Fundsmith Equity (GBP)",       "Independientes", "Growth"),
    ("0P0001IBYW.L", "Seilern World Growth (GBP)",   "Independientes", "Growth"),
    ("0P0000SBZI.F", "Renta 4 Nexus",                "Independientes", "Mixto"),
    ("0P00000TJ8.F", "Cartesio X",                    "Independientes", "Mixto"),
    ("0P00000TIV.F", "Cartesio Y",                    "Independientes", "Mixto"),
    ("0P00016DRZ.F", "Renta 4 Global",               "Independientes", "Mixto"),
    ("0P00000EUQ.F", "Sextant Grand Large",          "Independientes", "Mixto"),
    ("0P000011Z2.F", "Renta 4 Renta Fija",           "Independientes", "Renta fija"),
    ("0P00015PFG.F", "PIMCO GIS Income",             "Independientes", "Renta fija"),
    ("0P00009093.F", "Renta 4 Pegasus",              "Independientes", "Retorno absoluto"),
    ("0P00000RQC.F", "Vanguard Global Stock Index",  "Independientes", "Indexado"),
]


def sesion_en_curso(ahora=None):
    """Fecha (ISO) a partir de la cual NO se acepta cierre por estar la sesión abierta.

    Regla exacta: la bolsa de EE.UU. cierra a las 16:00 hora de Nueva York; hasta las
    16:15 NY la barra de HOY que devuelve Yahoo es intradía, no un cierre: se descarta.
    Usar la hora de Nueva York (zoneinfo) respeta el horario de verano/invierno (DST).
    Si zoneinfo no está disponible (Windows sin tzdata), se usa la regla conservadora
    de 21:00 UTC (nunca acepta una barra intradía; como mucho retrasa 1h en invierno).
    El robot corre a las 22:10 UTC, así que en producción nunca descarta nada.
    Devuelve una fecha "infinita" hacia el futuro cuando ya ha cerrado (no descarta nada).
    """
    ahora = ahora or dt.datetime.now(dt.timezone.utc)
    try:
        from zoneinfo import ZoneInfo
        ny = ahora.astimezone(ZoneInfo("America/New_York"))
        if (ny.hour, ny.minute) >= (16, 15):
            return "9999-12-31"
        return ny.strftime("%Y-%m-%d")
    except Exception:
        if ahora.hour >= 21:
            return "9999-12-31"
        return ahora.strftime("%Y-%m-%d")


def descargar(simbolo):
    """Devuelve dict {d, p, adjusted, currency, exchange} o None si falla."""
    url = CHART.format(sym=urllib.parse.quote(simbolo), p1=PERIOD1)
    for intento in range(3):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.load(r)
            res = d["chart"]["result"][0]
            ts = res.get("timestamp")
            if not ts:
                return None
            ind = res["indicators"]
            meta = res.get("meta", {}) or {}
            adjusted = bool(ind.get("adjclose") and ind["adjclose"][0].get("adjclose"))
            serie = ind["adjclose"][0]["adjclose"] if adjusted else ind["quote"][0]["close"]
            # --- Fechado en la ZONA HORARIA DEL MERCADO (no en UTC) ---
            # Yahoo estampa las barras diarias a las 00:00 hora local del mercado.
            # En FX (Europe/London) la medianoche de VERANO es 23:00 UTC del día anterior:
            # fechar en UTC corría toda barra de verano un día atrás (look-ahead de 1 día
            # al convertir divisas) y generaba fechas en domingo. Se usa la zona horaria
            # del mercado (histórica, con DST); si zoneinfo no está disponible, el
            # gmtoffset actual que reporta Yahoo; y solo como último recurso, UTC.
            tzinfo = None
            tzname = meta.get("exchangeTimezoneName") or meta.get("timezone")
            if tzname:
                try:
                    from zoneinfo import ZoneInfo
                    tzinfo = ZoneInfo(tzname)
                except Exception:
                    tzinfo = None
            gmtoff = meta.get("gmtoffset") if isinstance(meta.get("gmtoffset"), int) else 0
            fechas, precios = [], []
            for t, v in zip(ts, serie):
                if v is None:
                    continue
                if tzinfo is not None:
                    fecha_dt = dt.datetime.fromtimestamp(t, tzinfo)
                else:
                    fecha_dt = dt.datetime.fromtimestamp(t + gmtoff, dt.timezone.utc)
                if fecha_dt.weekday() >= 5:    # una barra en sábado/domingo no es un cierre
                    continue
                iso = fecha_dt.strftime("%Y-%m-%d")
                pv = round(float(v), 4)
                if pv <= 0:                # descarta ceros/negativos anómalos
                    continue
                fechas.append(iso)
                precios.append(pv)
            # dedup por fecha (última) y orden ascendente
            m = {}
            for f, p in zip(fechas, precios):
                m[f] = p
            # Descarta la SESIÓN EN CURSO: si se descarga con el mercado abierto, Yahoo
            # devuelve la barra de hoy a medio hacer (precio intradía, NO un cierre).
            # Colarla haría que el panel mostrase "último cierre" con datos que aún se mueven.
            for f in [f for f in m if f >= sesion_en_curso()]:
                del m[f]
            fechas = sorted(m)
            precios = [m[f] for f in fechas]
            if len(precios) < 30:
                return None
            return {"d": fechas, "p": precios, "adjusted": adjusted,
                    "currency": meta.get("currency"), "exchange": meta.get("exchangeName")}
        except Exception as e:
            print(f"   reintento {simbolo}: {e}")
            time.sleep(1.5)
    return None


def dist_accum(simbolo, sesiones=25):
    """Días de distribución (cae >=0.2% con más volumen) y de acumulación
    (sube >=0.2% con más volumen) en las últimas 'sesiones'. Usa cierre y volumen."""
    url = CHART.format(sym=urllib.parse.quote(simbolo), p1=PERIOD1)
    for intento in range(3):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.load(r)
            q = d["chart"]["result"][0]["indicators"]["quote"][0]
            close, vol = q.get("close"), q.get("volume")
            pares = [(c, v) for c, v in zip(close, vol) if c is not None and v]
            dist = acum = 0
            ventana = pares[-(sesiones + 1):]
            for k in range(1, len(ventana)):
                c0, v0 = ventana[k - 1]
                c1, v1 = ventana[k]
                ret = c1 / c0 - 1
                if v1 > v0:
                    if ret <= -0.002:
                        dist += 1
                    elif ret >= 0.002:
                        acum += 1
            return dist, acum
        except Exception as e:
            print(f"   reintento panel {simbolo}: {e}")
            time.sleep(1.5)
    return None


def panel_stats():
    """Datos del panel (presión de mercado) para S&P 500 y NASDAQ."""
    out = {}
    for sym, pref in (("SPY", "sp"), ("QQQ", "ndx")):
        r = dist_accum(sym)
        if r:
            out[pref + "Dist"], out[pref + "Accum"] = r
    return out


def stale_days(last_iso, hoy):
    return (hoy - dt.date.fromisoformat(last_iso)).days


def construir_payload(tickers, panel, macro, fallidos, fx=None):
    """Valida el universo, calcula frescura y devuelve el payload (o sys.exit)."""
    universo = list(dict.fromkeys(ETFS))
    con_serie = {k: v for k, v in tickers.items() if v.get("p")}

    # (2.1) Todos los ETFs son OBLIGATORIOS (panel/gráficas/presets/benchmarks/catálogo)
    faltan = [m for m in universo if m not in con_serie]
    if faltan:
        sys.exit(f"\nFALLO: faltan ETFs obligatorios {faltan}. NO se publica; se conserva el anterior.")
    # coherencia (todos los activos con serie)
    for k, v in con_serie.items():
        if len(v["p"]) != len(v["d"]):
            sys.exit(f"\nFALLO: {k} tiene longitudes d/p inconsistentes. No se publica.")
        if any((not math.isfinite(p)) or p <= 0 for p in v["p"]):
            sys.exit(f"\nFALLO: {k} tiene precios no finitos o <= 0. No se publica.")
        if v["d"] != sorted(v["d"]) or len(set(v["d"])) != len(v["d"]):
            sys.exit(f"\nFALLO: {k} tiene fechas desordenadas o duplicadas. No se publica.")

    # (§7) Requisitos ESTRICTOS para los ETFs obligatorios
    for k in universo:
        v = con_serie[k]
        if v.get("adjusted") is not True:
            sys.exit(f"\nFALLO: ETF obligatorio {k} sin adjusted close (rentabilidad total). No se publica.")
        if not v.get("currency"):
            sys.exit(f"\nFALLO: ETF obligatorio {k} sin moneda. No se publica.")
        if not v.get("exchange"):
            sys.exit(f"\nFALLO: ETF obligatorio {k} sin exchange. No se publica.")
        if v["observation_count"] < 30:
            sys.exit(f"\nFALLO: ETF obligatorio {k} con <30 observaciones. No se publica.")
        if v["stale_days"] > 7:
            sys.exit(f"\nFALLO: ETF obligatorio {k} demasiado obsoleto ({v['stale_days']}d). No se publica.")

    last_dates = [v["last_date"] for v in con_serie.values()]
    first_dates = [v["first_date"] for v in con_serie.values()]
    todos_adj = all(v.get("adjusted") for v in con_serie.values())
    return {
        "asof": max(last_dates),
        "latest_market_date": max(last_dates),
        "common_asof": min(last_dates),
        "oldest_asset_date": min(first_dates),
        "updated_asset_count": len(con_serie),
        "stale_asset_count": sum(1 for v in con_serie.values() if v["stale_days"] > 5),
        "unavailable_asset_count": sum(1 for v in tickers.values() if v.get("download_status") == "unavailable"),
        "generado": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "fuente": ("Yahoo Finance · cierres ajustados (rentabilidad total, dividendos reinvertidos)"
                   if todos_adj else "Yahoo Finance · cierres ajustados salvo indicado por activo"),
        "panel": panel, "macro": macro, "fx": fx or {}, "tickers": tickers, "fallidos": fallidos,
    }


def comparar_con_anterior(salida, payload):
    """Rechaza (sys.exit) si el nuevo archivo tiene anomalías frente al anterior."""
    if not os.path.exists(salida):
        return
    try:
        raw = open(salida, encoding="utf-8").read().strip()
        if raw.startswith("window.DATOS"):          # compat. con formato antiguo .js
            raw = raw[raw.index("{"):raw.rstrip().rstrip(";").rindex("}") + 1]
        prev = json.loads(raw)
    except Exception as e:
        print("Aviso: no se pudo leer el datos.json anterior:", e)
        return
    now = {k: v for k, v in payload["tickers"].items() if v.get("p")}
    prev_tk = prev.get("tickers", {})
    perdidos = [k for k in prev_tk if not k.startswith("FY_") and prev_tk[k].get("p") and k not in now]
    if perdidos:
        sys.exit(f"\nFALLO: desaparecen ETFs presentes antes {perdidos}. Se conserva el anterior.")
    prev_f = sum(1 for k, v in prev_tk.items() if k.startswith("FY_") and v.get("p"))
    now_f = sum(1 for k in now if k.startswith("FY_"))
    if prev_f and now_f < prev_f * 0.7:
        sys.exit(f"\nFALLO: los fondos con datos caen de {prev_f} a {now_f} (>30%). Se conserva el anterior.")
    if prev.get("asof") and payload["asof"] < prev["asof"]:
        sys.exit(f"\nFALLO: la fecha {payload['asof']} retrocede frente a {prev['asof']}. Se conserva el anterior.")
    # (§7) Regresiones por activo frente al anterior
    for k, pv in prev_tk.items():
        nv = now.get(k)
        if not (pv.get("p") and nv):
            continue
        if pv.get("currency") and nv.get("currency") and pv["currency"] != nv["currency"]:
            sys.exit(f"\nFALLO: {k} cambia de moneda {pv['currency']}->{nv['currency']}. Se conserva el anterior.")
        if pv.get("exchange") and nv.get("exchange") and pv["exchange"] != nv["exchange"]:
            sys.exit(f"\nFALLO: {k} cambia de exchange. Se conserva el anterior.")
        if pv.get("adjusted") is True and nv.get("adjusted") is not True:
            sys.exit(f"\nFALLO: {k} pasa de adjusted=True a False. Se conserva el anterior.")
        if pv.get("observation_count") and nv.get("observation_count") and nv["observation_count"] < pv["observation_count"] * 0.8:
            sys.exit(f"\nFALLO: {k} pierde histórico ({pv['observation_count']}->{nv['observation_count']}). Se conserva el anterior.")


def main():
    universo = list(dict.fromkeys(ETFS))
    tickers = {}
    fallidos = []
    total = len(universo) + len(FONDOS)
    i = 0
    hoy = dt.datetime.now(dt.timezone.utc).date()

    for tk in universo:
        i += 1
        print(f"[{i}/{total}] {tk} ...", end=" ", flush=True)
        r = descargar(tk)
        if r:
            sd = stale_days(r["d"][-1], hoy)
            tickers[tk] = {"d": r["d"], "p": r["p"], "adjusted": r["adjusted"], "currency": r["currency"], "exchange": r["exchange"],
                           "first_date": r["d"][0], "last_date": r["d"][-1], "observation_count": len(r["p"]),
                           "stale_days": sd, "download_status": "ok",
                           "warnings": ([f"obsoleto_{sd}d"] if sd > 5 else [])}
            print(f"ok ({len(r['p'])}d {r['currency']} {'adj' if r['adjusted'] else 'CLOSE'} stale{sd})")
        else:
            fallidos.append(tk); print("SIN DATOS")
        time.sleep(0.25)

    for sim, nombre, banco, tipo in FONDOS:
        i += 1
        key = "FY_" + sim
        print(f"[{i}/{total}] fondo {nombre} ...", end=" ", flush=True)
        r = descargar(sim)
        if r:
            sd = stale_days(r["d"][-1], hoy)
            tickers[key] = {"d": r["d"], "p": r["p"], "nombre": nombre, "fondo": True,
                            "banco": banco, "tipo": tipo, "adjusted": r["adjusted"], "currency": r["currency"], "exchange": r["exchange"],
                            "first_date": r["d"][0], "last_date": r["d"][-1], "observation_count": len(r["p"]),
                            "stale_days": sd, "download_status": "ok",
                            "warnings": ([f"obsoleto_{sd}d"] if sd > 8 else [])}
            print(f"ok ({len(r['p'])}d {r['currency']} stale{sd})")
        else:
            fallidos.append(sim)
            # Fondo opcional caído: conserva metadata, SIN serie inventada, marcado no disponible
            tickers[key] = {"nombre": nombre, "fondo": True, "banco": banco, "tipo": tipo,
                            "download_status": "unavailable", "warnings": ["sin_datos"], "d": [], "p": []}
            print("NO DISPONIBLE (metadata conservada, sin serie)")
        time.sleep(0.25)

    print("panel (presion de mercado) ...", end=" ", flush=True)
    panel = panel_stats()
    print("ok" if panel else "sin datos")

    print("macro (tipos, VIX, divisas) ...", end=" ", flush=True)
    macro = {}
    fx = {}
    for sym, key in MACRO:
        r = descargar(sym)
        if r:
            # macro = serie corta para las TARJETAS; fx = histórico COMPLETO para conversión.
            macro[key] = {"d": r["d"][-1300:], "p": r["p"][-1300:]}
            if key == "EURUSD":
                fx["EURUSD"] = {"d": r["d"], "p": r["p"]}
        time.sleep(0.2)
    print(f"ok ({len(macro)}/{len(MACRO)})")

    payload = construir_payload(tickers, panel, macro, fallidos, fx)

    salida = os.path.join(BASE_DIR, "datos.json")   # §5: JSON PASIVO (no ejecutable)
    comparar_con_anterior(salida, payload)   # rechaza anomalías (conserva el anterior)

    # ---- Escritura ATÓMICA (temp -> validar -> reemplazo) ----
    tmp = salida + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    chk = json.loads(open(tmp, encoding="utf-8").read())   # debe ser JSON válido
    assert all(m in chk["tickers"] and chk["tickers"][m].get("p") for m in universo), "obligatorios en temporal"
    os.replace(tmp, salida)

    print("\n" + "=" * 62)
    print(f"OK · datos.json · {payload['updated_asset_count']} con datos · "
          f"{payload['unavailable_asset_count']} no disponibles · cierre {payload['common_asof']}")
    if fallidos:
        print("No disponibles:", ", ".join(fallidos))
    print("=" * 62)


if __name__ == "__main__":
    main()

# v2
