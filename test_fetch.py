# -*- coding: utf-8 -*-
"""
Tests de fetch_datos.py SIN llamadas reales a Yahoo (urlopen mockeado).
Ejecutar:  pytest -q  (desde la carpeta del proyecto)
"""
import io, json, sys, os, datetime as dt
import urllib.error
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import fetch_datos as F


# ---------- utilidades de mock ----------
class FakeResp(io.BytesIO):
    def __enter__(self): return self
    def __exit__(self, *a): return False


def chart_json(dates, closes, adj=True, currency="USD", volumes=None, gmtoffset=0, ts_shift=0):
    """ts_shift permite simular barras estampadas fuera de las 00:00 UTC (p.ej. FX de verano
    a las 23:00 UTC del día anterior: ts_shift=-3600 con gmtoffset=3600)."""
    ts = [int(dt.datetime.fromisoformat(d).replace(tzinfo=dt.timezone.utc).timestamp()) + ts_shift
          for d in dates]
    ind = {"quote": [{"close": closes, "volume": volumes or [1]*len(closes)}]}
    if adj:
        ind["adjclose"] = [{"adjclose": closes}]
    return {"chart": {"result": [{"timestamp": ts, "indicators": ind,
                                  "meta": {"currency": currency, "exchangeName": "NMS",
                                           "gmtoffset": gmtoffset}}]}}


def mk_urlopen(payload=None, raise_exc=None):
    def _fn(req, timeout=None):
        if raise_exc:
            raise raise_exc
        return FakeResp(json.dumps(payload).encode())
    return _fn


TODAY = dt.date(2026, 7, 10)


def days(n, end="2026-07-10"):
    """n días LABORABLES terminando en `end` (los mercados no cierran en fin de semana)."""
    d0 = dt.date.fromisoformat(end)
    out = []
    while len(out) < n:
        if d0.weekday() < 5:
            out.append(d0.isoformat())
        d0 -= dt.timedelta(days=1)
    return out[::-1]


# ---------- descargar() ----------
def test_descarga_correcta_adjusted(monkeypatch):
    ds = days(40); cl = [100 + i for i in range(40)]
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(chart_json(ds, cl, adj=True, currency="USD")))
    r = F.descargar("SPY")
    assert r["adjusted"] is True and r["currency"] == "USD"
    assert r["d"][0] == ds[0] and r["d"][-1] == ds[-1] and len(r["p"]) == 40


def test_sin_adjclose_usa_close(monkeypatch):
    ds = days(40); cl = [10.0]*40
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(chart_json(ds, cl, adj=False)))
    r = F.descargar("XX")
    assert r["adjusted"] is False


def test_precios_cero_y_negativos_filtrados(monkeypatch):
    ds = days(40); cl = [100.0]*40; cl[5] = 0; cl[6] = -3
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(chart_json(ds, cl)))
    r = F.descargar("XX")
    assert all(p > 0 for p in r["p"]) and len(r["p"]) == 38


def test_fechas_duplicadas_y_desordenadas(monkeypatch):
    ds = ["2026-01-05", "2026-01-02", "2026-01-05", "2026-01-03"] + days(36, "2026-03-01")
    cl = [10, 11, 12, 13] + [20.0]*36
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(chart_json(ds, cl)))
    r = F.descargar("XX")
    assert r["d"] == sorted(r["d"]) and len(set(r["d"])) == len(r["d"])


def test_sin_datos_devuelve_none(monkeypatch):
    monkeypatch.setattr(F.urllib.request, "urlopen",
                        mk_urlopen(payload={"chart": {"result": [{"timestamp": None, "indicators": {}}]}}))
    assert F.descargar("XX") is None


@pytest.mark.parametrize("code", [401, 404, 429, 500])
def test_errores_http_devuelven_none(monkeypatch, code):
    exc = urllib.error.HTTPError("u", code, "err", {}, None)
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(raise_exc=exc))
    monkeypatch.setattr(F.time, "sleep", lambda *_: None)  # sin esperas
    assert F.descargar("XX") is None


def test_historico_corto_none(monkeypatch):
    ds = days(10); cl = [1.0]*10
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(chart_json(ds, cl)))
    assert F.descargar("XX") is None


# ---------- construir_payload() ----------
def _meta_ticker(last="2026-07-10", n=100, adj=True, cur="USD", exch="NMS"):
    ds = days(n, last)
    return {"d": ds, "p": [100.0 + i*0.01 for i in range(n)], "adjusted": adj, "currency": cur,
            "exchange": exch, "first_date": ds[0], "last_date": ds[-1], "observation_count": n,
            "stale_days": F.stale_days(ds[-1], TODAY), "download_status": "ok", "warnings": []}


# ---------- §7: validación ESTRICTA de ETFs obligatorios ----------
def test_etf_sin_adjusted_sale(monkeypatch):
    monkeypatch.setattr(F, "ETFS", ["SPY"])
    with pytest.raises(SystemExit):
        F.construir_payload({"SPY": _meta_ticker(adj=False)}, {}, {}, [])


def test_etf_sin_moneda_sale(monkeypatch):
    monkeypatch.setattr(F, "ETFS", ["SPY"])
    with pytest.raises(SystemExit):
        F.construir_payload({"SPY": _meta_ticker(cur=None)}, {}, {}, [])


def test_etf_sin_exchange_sale(monkeypatch):
    monkeypatch.setattr(F, "ETFS", ["SPY"])
    with pytest.raises(SystemExit):
        F.construir_payload({"SPY": _meta_ticker(exch=None)}, {}, {}, [])


def test_precio_no_finito_sale(monkeypatch):
    monkeypatch.setattr(F, "ETFS", ["SPY"])
    t = _meta_ticker(); t["p"][10] = float("inf")
    with pytest.raises(SystemExit):
        F.construir_payload({"SPY": t}, {}, {}, [])


def test_compara_cambio_moneda_sale(tmp_path):
    prev = {"SPY": {"p": [1], "d": ["x"], "currency": "USD"}}
    salida = _write_prev(tmp_path, "2026-07-09", prev)
    payload = {"asof": "2026-07-10", "tickers": {"SPY": _meta_ticker(cur="EUR")}}
    with pytest.raises(SystemExit):
        F.comparar_con_anterior(salida, payload)


def test_compara_adjusted_true_a_false_sale(tmp_path):
    prev = {"SPY": {"p": [1], "d": ["x"], "adjusted": True}}
    salida = _write_prev(tmp_path, "2026-07-09", prev)
    payload = {"asof": "2026-07-10", "tickers": {"SPY": _meta_ticker(adj=False)}}
    with pytest.raises(SystemExit):
        F.comparar_con_anterior(salida, payload)


def test_payload_ok_con_frescura(monkeypatch):
    monkeypatch.setattr(F, "ETFS", ["SPY", "QQQ"])
    tickers = {"SPY": _meta_ticker(), "QQQ": _meta_ticker(),
               "FY_X": {"nombre": "F", "fondo": True, "download_status": "unavailable", "d": [], "p": []}}
    p = F.construir_payload(tickers, {}, {}, ["X"])
    assert p["updated_asset_count"] == 2 and p["unavailable_asset_count"] == 1
    assert p["latest_market_date"] == "2026-07-10" and p["common_asof"] == "2026-07-10"
    assert "rentabilidad total" in p["fuente"]


def test_payload_falta_obligatorio_sale(monkeypatch):
    monkeypatch.setattr(F, "ETFS", ["SPY", "QQQ"])
    with pytest.raises(SystemExit):
        F.construir_payload({"SPY": _meta_ticker()}, {}, {}, [])   # falta QQQ


def test_payload_precio_no_positivo_sale(monkeypatch):
    monkeypatch.setattr(F, "ETFS", ["SPY"])
    t = _meta_ticker(); t["p"][3] = 0
    with pytest.raises(SystemExit):
        F.construir_payload({"SPY": t}, {}, {}, [])


# ---------- H-01: fechado de barras en la zona horaria del mercado ----------
def test_fx_verano_no_se_fecha_un_dia_antes(monkeypatch):
    """FX de verano: Yahoo estampa a las 00:00 de Londres = 23:00 UTC del día ANTERIOR.
    Fechar en UTC corría la barra un día atrás (look-ahead). Con gmtoffset se corrige."""
    ds = days(40, "2026-07-10")
    cl = [1.10 + i * 0.001 for i in range(40)]
    monkeypatch.setattr(F.urllib.request, "urlopen",
                        mk_urlopen(chart_json(ds, cl, gmtoffset=3600, ts_shift=-3600)))
    r = F.descargar("EURUSD=X")
    assert r["d"] == ds                      # las fechas NO se desplazan
    assert all(dt.date.fromisoformat(f).weekday() < 5 for f in r["d"])


def test_barras_en_fin_de_semana_se_descartan(monkeypatch):
    """Una barra fechada en sábado/domingo no es un cierre de mercado: fuera."""
    ds = days(35, "2026-07-10") + ["2026-07-11", "2026-07-12"]   # sábado y domingo
    cl = [100.0] * 37
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(chart_json(ds, cl)))
    r = F.descargar("XX")
    assert "2026-07-11" not in r["d"] and "2026-07-12" not in r["d"]
    assert len(r["d"]) == 35


# ---------- H-07: cierre según hora de Nueva York (respeta DST) ----------
def _hay_zoneinfo():
    try:
        from zoneinfo import ZoneInfo
        ZoneInfo("America/New_York")
        return True
    except Exception:
        return False


@pytest.mark.skipif(not _hay_zoneinfo(), reason="zoneinfo/tzdata no disponible")
def test_verano_2030utc_ya_es_cierre():
    # 20:30 UTC en julio = 16:30 NY -> mercado CERRADO: la barra de hoy vale
    ahora = dt.datetime(2026, 7, 15, 20, 30, tzinfo=dt.timezone.utc)
    assert F.sesion_en_curso(ahora) == "9999-12-31"


@pytest.mark.skipif(not _hay_zoneinfo(), reason="zoneinfo/tzdata no disponible")
def test_invierno_2030utc_aun_abierto():
    # 20:30 UTC en enero = 15:30 NY -> mercado ABIERTO: fuera la barra de hoy
    ahora = dt.datetime(2026, 1, 15, 20, 30, tzinfo=dt.timezone.utc)
    assert F.sesion_en_curso(ahora) == "2026-01-15"


def test_sesion_en_curso_descarta_hoy_si_mercado_abierto():
    # 16:00 UTC = mercado de EE.UU. abierto -> la barra de hoy es intradía, se descarta
    ahora = dt.datetime(2026, 7, 15, 16, 0, tzinfo=dt.timezone.utc)
    assert F.sesion_en_curso(ahora) == "2026-07-15"


def test_sesion_en_curso_acepta_hoy_tras_el_cierre():
    # 22:10 UTC = ya cerró (es la hora del robot) -> no se descarta nada
    ahora = dt.datetime(2026, 7, 15, 22, 10, tzinfo=dt.timezone.utc)
    assert F.sesion_en_curso(ahora) == "9999-12-31"


def test_descarga_a_media_sesion_no_cuela_barra_intradia(monkeypatch):
    """Con el mercado abierto, el último cierre debe ser el de AYER, no el intradía de hoy."""
    ds = days(40, "2026-07-15")          # la última fecha es "hoy"
    cl = [100.0] * 39 + [999.0]          # barra de hoy, a medio hacer
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(chart_json(ds, cl)))
    monkeypatch.setattr(F, "sesion_en_curso", lambda ahora=None: "2026-07-15")
    r = F.descargar("SPY")
    assert r["d"][-1] == "2026-07-14"    # se quedó con el último cierre real
    assert 999.0 not in r["p"]           # el precio intradía no entró


def test_descarga_tras_el_cierre_si_incluye_hoy(monkeypatch):
    ds = days(40, "2026-07-15")
    cl = [100.0 + i for i in range(40)]
    monkeypatch.setattr(F.urllib.request, "urlopen", mk_urlopen(chart_json(ds, cl)))
    monkeypatch.setattr(F, "sesion_en_curso", lambda ahora=None: "9999-12-31")
    r = F.descargar("SPY")
    assert r["d"][-1] == "2026-07-15"    # ya cerrado: el cierre de hoy sí vale


def test_payload_incluye_fx(monkeypatch):
    # el histórico FX completo se guarda en payload["fx"] (separado de macro)
    monkeypatch.setattr(F, "ETFS", ["SPY"])
    fx = {"EURUSD": {"d": ["2020-01-01", "2020-01-02"], "p": [1.10, 1.12]}}
    p = F.construir_payload({"SPY": _meta_ticker()}, {}, {}, [], fx)
    assert p["fx"]["EURUSD"]["p"] == [1.10, 1.12]
    assert p["fx"]["EURUSD"]["d"][0] == "2020-01-01"


def test_payload_fx_por_defecto_vacio(monkeypatch):
    monkeypatch.setattr(F, "ETFS", ["SPY"])
    p = F.construir_payload({"SPY": _meta_ticker()}, {}, {}, [])
    assert p["fx"] == {}   # sin fx no rompe; queda dict vacío


def test_payload_close_no_afirma_dividendos(monkeypatch):
    # ETF obligatorio adjusted OK, pero un FONDO con close -> la fuente no debe afirmar dividendos
    monkeypatch.setattr(F, "ETFS", ["SPY"])
    fondo = _meta_ticker(adj=False); fondo["fondo"] = True
    p = F.construir_payload({"SPY": _meta_ticker(), "FY_X": fondo}, {}, {}, [])
    assert "rentabilidad total" not in p["fuente"]


# ---------- comparar_con_anterior() ----------
def _write_prev(tmp_path, asof, tickers):
    f = tmp_path / "datos.js"
    f.write_text("window.DATOS = " + json.dumps({"asof": asof, "tickers": tickers}) + ";", encoding="utf-8")
    return str(f)


def test_compara_asof_retrocede_sale(tmp_path):
    prev = {"SPY": {"p": [1], "d": ["x"]}}
    salida = _write_prev(tmp_path, "2026-07-10", prev)
    payload = {"asof": "2026-07-01", "tickers": {"SPY": _meta_ticker()}}
    with pytest.raises(SystemExit):
        F.comparar_con_anterior(salida, payload)


def test_compara_etf_desaparece_sale(tmp_path):
    prev = {"SPY": {"p": [1], "d": ["x"]}, "QQQ": {"p": [1], "d": ["x"]}}
    salida = _write_prev(tmp_path, "2026-07-10", prev)
    payload = {"asof": "2026-07-11", "tickers": {"SPY": _meta_ticker()}}  # falta QQQ
    with pytest.raises(SystemExit):
        F.comparar_con_anterior(salida, payload)


def test_compara_fondos_caen_mucho_sale(tmp_path):
    prev = {"FY_a": {"p": [1], "d": ["x"]}, "FY_b": {"p": [1], "d": ["x"]},
            "FY_c": {"p": [1], "d": ["x"]}, "FY_d": {"p": [1], "d": ["x"]}}
    salida = _write_prev(tmp_path, "2026-07-10", prev)
    payload = {"asof": "2026-07-11", "tickers": {"FY_a": _meta_ticker()}}  # 4 -> 1 (>30%)
    with pytest.raises(SystemExit):
        F.comparar_con_anterior(salida, payload)


def test_compara_ok_no_sale(tmp_path):
    prev = {"SPY": {"p": [1], "d": ["x"]}}
    salida = _write_prev(tmp_path, "2026-07-09", prev)
    payload = {"asof": "2026-07-10", "tickers": {"SPY": _meta_ticker()}}
    F.comparar_con_anterior(salida, payload)  # no lanza


# ---------- §6: no deben reaparecer fondos manuales ----------
def test_no_reaparecen_fondos_manuales():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prohibidas_texto = ["pegar", "subir hist", "vl histórico", "añade el tuyo", "fondo manual"]
    # el JS vive ahora en js/app.js (§5): se escanean HTML + los scripts propios
    fuentes = ["index.html", os.path.join("js", "app.js"), os.path.join("js", "finance.js")]
    combinado = ""
    for rel in fuentes:
        txt = open(os.path.join(base, rel), encoding="utf-8").read()
        low = txt.lower()
        combinado += low
        for p in prohibidas_texto:
            assert p not in low, f"texto prohibido reaparece en {rel}: {p!r}"
    # sin inputs de archivo ni textareas en la app
    assert "type=\"file\"" not in combinado and "type=file" not in combinado, "input file reaparece"
    assert "<textarea" not in combinado, "textarea reaparece"
    py = open(os.path.join(base, "fetch_datos.py"), encoding="utf-8").read().lower()
    for p in prohibidas_texto:
        assert p not in py, f"texto prohibido reaparece en fetch_datos.py: {p!r}"

# v2
