/* app.js — lógica de la aplicación, externalizada desde index.html (§5).
   Se carga como script clásico tras js/finance.js y datos.js.
   Sin JS inline en el HTML => la CSP puede prohibir 'unsafe-inline' en script-src. */
/* ===================== 1) MOTOR DE DATOS ===================== */
const U={
 SPY:{n:"S&P 500",g:"C",cat:"Índices",ret:.115,vol:.16,lM:.94},QQQ:{n:"Nasdaq 100",g:"C",cat:"Índices",ret:.16,vol:.20,lM:.90},
 ACWI:{n:"Mundo (MSCI ACWI)",g:"C",cat:"Índices",ret:.09,vol:.15,lM:.93},VT:{n:"Mundo total (FTSE)",g:"C",cat:"Índices",ret:.095,vol:.155,lM:.95},
 IWM:{n:"Russell 2000",g:"C",cat:"Índices",ret:.08,vol:.21,lM:.82},DIA:{n:"Dow 30",g:"C",cat:"Índices",ret:.10,vol:.15,lM:.90},
 VTI:{n:"Total EE.UU.",g:"C",cat:"Índices",ret:.115,vol:.16,lM:.94},EFA:{n:"Desarroll. exUS",g:"C",cat:"Índices",ret:.055,vol:.16,lM:.83},
 EEM:{n:"Emergentes",g:"C",cat:"Índices",ret:.035,vol:.19,lM:.72},VGK:{n:"Europa",g:"C",cat:"Índices",ret:.06,vol:.17,lM:.80},
 EWJ:{n:"Japón",g:"C",cat:"Índices",ret:.06,vol:.14,lM:.66},FXI:{n:"China",g:"C",cat:"Índices",ret:.02,vol:.24,lM:.55},
 INDA:{n:"India",g:"C",cat:"Índices",ret:.075,vol:.19,lM:.60},EWZ:{n:"Brasil",g:"C",cat:"Índices",ret:.02,vol:.30,lM:.55},
 AGG:{n:"Bono agregado",g:"B",cat:"Activos",ret:.02,vol:.045,lM:.05,lB:.75},SHY:{n:"Treasuries 1-3Y",g:"B",cat:"Activos",ret:.012,vol:.015,lB:.55},
 IEF:{n:"Treasuries 7-10Y",g:"B",cat:"Activos",ret:.02,vol:.075,lM:-.1,lB:.85},TLT:{n:"Treasuries 20Y",g:"B",cat:"Activos",ret:.015,vol:.16,lM:-.15,lB:.9},
 LQD:{n:"Crédito IG",g:"B",cat:"Activos",ret:.03,vol:.085,lM:.25,lB:.7},HYG:{n:"High Yield",g:"B",cat:"Activos",ret:.042,vol:.09,lM:.55,lB:.4},
 TIP:{n:"Ligados inflación",g:"B",cat:"Activos",ret:.025,vol:.06,lM:.15,lB:.7},BNDX:{n:"Bonos internac.",g:"B",cat:"Activos",ret:.02,vol:.05,lM:.1,lB:.7},
 EMB:{n:"Bonos emergentes",g:"B",cat:"Activos",ret:.035,vol:.10,lM:.45,lB:.45},
 XLK:{n:"Tecnología",g:"S",cat:"Industrias",ret:.185,vol:.20,lM:.90},XLF:{n:"Financieras",g:"S",cat:"Industrias",ret:.10,vol:.20,lM:.86},
 XLV:{n:"Salud",g:"S",cat:"Industrias",ret:.11,vol:.14,lM:.72},XLE:{n:"Energía",g:"S",cat:"Industrias",ret:.06,vol:.28,lM:.60,lG:.35},
 XLI:{n:"Industria",g:"S",cat:"Industrias",ret:.10,vol:.18,lM:.88},XLY:{n:"Cons. discrec.",g:"S",cat:"Industrias",ret:.12,vol:.20,lM:.87},
 XLP:{n:"Cons. básico",g:"S",cat:"Industrias",ret:.08,vol:.12,lM:.62},XLU:{n:"Utilities",g:"S",cat:"Industrias",ret:.09,vol:.16,lM:.45,lB:.35},
 XLB:{n:"Materiales",g:"S",cat:"Industrias",ret:.08,vol:.19,lM:.80,lG:.2},XLC:{n:"Comunicación",g:"S",cat:"Industrias",ret:.10,vol:.20,lM:.85},
 XLRE:{n:"Inmobiliario",g:"S",cat:"Industrias",ret:.06,vol:.20,lM:.65,lB:.3},SMH:{n:"Semiconductores",g:"T",cat:"Temáticas",ret:.22,vol:.28,lM:.85},
 KRE:{n:"Bancos regionales",g:"S",cat:"Industrias",ret:.06,vol:.28,lM:.78},XBI:{n:"Biotech",g:"S",cat:"Industrias",ret:.08,vol:.28,lM:.62},
 XOP:{n:"Petróleo E&P",g:"T",cat:"Temáticas",ret:.0,vol:.40,lM:.55,lG:.4},XHB:{n:"Construcción",g:"S",cat:"Industrias",ret:.13,vol:.25,lM:.82},
 ITA:{n:"Defensa",g:"T",cat:"Temáticas",ret:.11,vol:.20,lM:.78},ARKK:{n:"Innovación",g:"T",cat:"Temáticas",ret:.05,vol:.45,lM:.78,lK:.15},
 BOTZ:{n:"Robótica / IA",g:"T",cat:"Temáticas",ret:.08,vol:.25,lM:.82},ICLN:{n:"Energía limpia",g:"T",cat:"Temáticas",ret:.03,vol:.30,lM:.72},
 TAN:{n:"Solar",g:"T",cat:"Temáticas",ret:.05,vol:.40,lM:.70},LIT:{n:"Litio",g:"T",cat:"Temáticas",ret:.08,vol:.30,lM:.72,lG:.2},
 CIBR:{n:"Ciberseguridad",g:"T",cat:"Temáticas",ret:.13,vol:.24,lM:.83},URA:{n:"Uranio",g:"T",cat:"Temáticas",ret:.05,vol:.40,lM:.55,lG:.3},
 SKYY:{n:"Cloud",g:"T",cat:"Temáticas",ret:.13,vol:.24,lM:.86},FINX:{n:"Fintech",g:"T",cat:"Temáticas",ret:.08,vol:.28,lM:.82},
 GDX:{n:"Mineras oro",g:"T",cat:"Temáticas",ret:.02,vol:.35,lM:.35,lG:.55},JETS:{n:"Aerolíneas",g:"T",cat:"Temáticas",ret:.0,vol:.35,lM:.68},
 DRIV:{n:"Coches eléctricos",g:"T",cat:"Temáticas",ret:.07,vol:.25,lM:.82},BLOK:{n:"Blockchain",g:"T",cat:"Temáticas",ret:.10,vol:.45,lM:.55,lK:.55},
 WCLD:{n:"Cloud / SaaS",g:"T",cat:"Temáticas",ret:.10,vol:.30,lM:.82},IGV:{n:"Software",g:"T",cat:"Temáticas",ret:.13,vol:.24,lM:.86},
 COPX:{n:"Mineras cobre",g:"T",cat:"Temáticas",ret:.05,vol:.35,lM:.55,lG:.4},REMX:{n:"Tierras raras",g:"T",cat:"Temáticas",ret:.03,vol:.35,lM:.5,lG:.35},
 XME:{n:"Metales y minería",g:"S",cat:"Industrias",ret:.06,vol:.30,lM:.6,lG:.35},NLR:{n:"Nuclear",g:"T",cat:"Temáticas",ret:.09,vol:.24,lM:.6,lG:.2},
 GLD:{n:"Oro",g:"R",cat:"Activos",ret:.075,vol:.15,lG:.85},SLV:{n:"Plata",g:"R",cat:"Activos",ret:.04,vol:.28,lG:.65,lM:.15},
 DBC:{n:"Materias primas",g:"R",cat:"Activos",ret:.01,vol:.18,lG:.55,lM:.2},USO:{n:"Petróleo",g:"R",cat:"Activos",ret:-.08,vol:.40,lG:.5,lM:.2},
 UNG:{n:"Gas natural",g:"R",cat:"Activos",ret:-.25,vol:.55,lG:.35},DBA:{n:"Agricultura",g:"R",cat:"Activos",ret:.02,vol:.15,lG:.5},
 DBB:{n:"Metales base",g:"R",cat:"Activos",ret:.04,vol:.20,lG:.5,lM:.3},VNQ:{n:"Inmobiliario",g:"R",cat:"Activos",ret:.06,vol:.20,lM:.65,lB:.3},
 IBIT:{n:"Bitcoin",g:"X",cat:"Activos",ret:.55,vol:.65,lK:.85,lM:.2},ETHA:{n:"Ethereum",g:"X",cat:"Activos",ret:.45,vol:.80,lK:.8,lM:.2}
};
/* Fondos famosos precargados. En modo real (datos.js) se usan sus VL reales;
   en modo demo se generan curvas modeladas para que el catálogo no quede vacío.
   La clave coincide con la de datos.js: "FY_"+símbolo de Yahoo. */
const FUND_UNIVERSE={
 /* ===== CaixaBank (de menos a más riesgo) ===== */
 "FY_0P0001QM72.F":{n:"CaixaBank Renta Fija Corto Plazo",banco:"CaixaBank",tipo:"Renta fija corto plazo",ret:.015,vol:.015,lB:.3},
 "FY_0P00017HNP.F":{n:"CaixaBank Destino 2030",banco:"CaixaBank",tipo:"Objetivo 2030",ret:.04,vol:.07,lM:.45,lB:.4},
 "FY_0P00017HNR.F":{n:"CaixaBank Destino 2040",banco:"CaixaBank",tipo:"Objetivo 2040",ret:.05,vol:.09,lM:.55,lB:.35},
 "FY_0P00017HNT.F":{n:"CaixaBank Destino 2050",banco:"CaixaBank",tipo:"Objetivo 2050",ret:.06,vol:.12,lM:.68,lB:.25},
 "FY_0P0001ODL4.F":{n:"CaixaBank Destino 2060",banco:"CaixaBank",tipo:"Objetivo 2060",ret:.065,vol:.13,lM:.72,lB:.2},
 "FY_0P000018SN.F":{n:"CaixaBank Bolsa Dividendo Europa",banco:"CaixaBank",tipo:"Bolsa · Dividendo Europa",ret:.06,vol:.15,lM:.78},
 "FY_0P00006ETR.F":{n:"CaixaBank Bolsa Gestión Europa",banco:"CaixaBank",tipo:"Bolsa Europa",ret:.06,vol:.16,lM:.8},
 "FY_0P00000P6Y.F":{n:"CaixaBank Bolsa Gestión España",banco:"CaixaBank",tipo:"Bolsa España",ret:.05,vol:.18,lM:.75},
 "FY_0P0000XRHI.F":{n:"CaixaBank Selección Tendencias",banco:"CaixaBank",tipo:"Temático · Tendencias",ret:.07,vol:.15,lM:.78},
 "FY_0P00000P68.F":{n:"CaixaBank Gestión Tendencias",banco:"CaixaBank",tipo:"Temático · Tendencias",ret:.07,vol:.16,lM:.8},
 "FY_0P00000PJM.F":{n:"CaixaBank Comunicación Mundial",banco:"CaixaBank",tipo:"Temático · Comunicación",ret:.09,vol:.18,lM:.85},
 "FY_0P00000JMN.F":{n:"CaixaBank Bolsa Selección Emergentes",banco:"CaixaBank",tipo:"Bolsa · Emergentes",ret:.04,vol:.18,lM:.7},
 /* ===== BBVA (de menos a más riesgo) ===== */
 "FY_0P00000DAY.F":{n:"BBVA Rentabilidad Ahorro Corto Plazo",banco:"BBVA",tipo:"Renta fija corto plazo",ret:.015,vol:.015,lB:.3},
 "FY_0P0001CC4T.F":{n:"BBVA Ahorro Cartera",banco:"BBVA",tipo:"Mixto conservador",ret:.03,vol:.05,lM:.3,lB:.5},
 "FY_0P0001OEO6.F":{n:"BBVA Patrimonio Global Conservador",banco:"BBVA",tipo:"Mixto conservador",ret:.03,vol:.05,lM:.3,lB:.5},
 "FY_0P00000V7V.F":{n:"BBVA Gestión Conservadora",banco:"BBVA",tipo:"Perfil conservador",ret:.03,vol:.05,lM:.32,lB:.5},
 "FY_0P00000PIM.F":{n:"BBVA Gestión Moderada",banco:"BBVA",tipo:"Perfil moderado",ret:.045,vol:.08,lM:.5,lB:.4},
 "FY_0P00018H0W.F":{n:"BBVA Mi Objetivo 2031",banco:"BBVA",tipo:"Objetivo 2031",ret:.045,vol:.08,lM:.5,lB:.38},
 "FY_0P00000L3B.F":{n:"BBVA Gestión Decidida",banco:"BBVA",tipo:"Perfil decidido",ret:.06,vol:.12,lM:.72,lB:.2},
 "FY_0P0001BF04.F":{n:"Bindex Euro ESG Índice",banco:"BBVA",tipo:"Bolsa Europa (índice)",ret:.06,vol:.16,lM:.85},
 "FY_0P00000PHR.F":{n:"BBVA Bolsa Índice Euro",banco:"BBVA",tipo:"Bolsa Europa (índice)",ret:.06,vol:.16,lM:.85},
 "FY_0P0001BF05.F":{n:"Bindex España Índice",banco:"BBVA",tipo:"Bolsa España (índice)",ret:.05,vol:.18,lM:.8},
 "FY_0P00000PIC.F":{n:"BBVA Bolsa Plus",banco:"BBVA",tipo:"Bolsa España",ret:.05,vol:.18,lM:.75},
 "FY_0P00000PI5.F":{n:"BBVA Quality Mejores Ideas",banco:"BBVA",tipo:"Bolsa · alta convicción",ret:.09,vol:.18,lM:.85},
 "FY_0P0001C2DG.F":{n:"Bindex USA Índice",banco:"BBVA",tipo:"Bolsa EE.UU. (índice)",ret:.11,vol:.16,lM:.95},
 "FY_0P00000V7Q.F":{n:"BBVA Megatendencia Tecnología",banco:"BBVA",tipo:"Temático · Tecnología",ret:.14,vol:.22,lM:.9},
 "FY_0P00000PH5.F":{n:"BBVA Bolsa Emergentes MF",banco:"BBVA",tipo:"Bolsa · Emergentes",ret:.04,vol:.18,lM:.7},
 /* ===== Santander (de menos a más riesgo) ===== */
 "FY_0P0001Q48V.F":{n:"Santander Corto Plazo",banco:"Santander",tipo:"Renta fija corto plazo",ret:.015,vol:.015,lB:.3},
 "FY_0P00016ZNJ.F":{n:"Santander Rendimiento",banco:"Santander",tipo:"Renta fija corto plazo",ret:.015,vol:.02,lB:.35},
 "FY_0P00000PHN.F":{n:"Santander Sostenible Renta Fija Ahorro",banco:"Santander",tipo:"Renta fija",ret:.02,vol:.04,lB:.7},
 "FY_0P0000RVDZ.F":{n:"Santander PB Dynamic Portfolio",banco:"Santander",tipo:"Mixto",ret:.045,vol:.08,lM:.5,lB:.4},
 "FY_0P0001I2CK.F":{n:"Santander Mi Cartera Gestión Flexible 1",banco:"Santander",tipo:"Mixto flexible",ret:.05,vol:.10,lM:.6,lB:.25},
 "FY_0P000155MY.F":{n:"Santander Gestión Global Decidido",banco:"Santander",tipo:"Perfil decidido",ret:.06,vol:.12,lM:.72,lB:.2},
 "FY_0P0001J731.F":{n:"Santander Mi Cartera RV Europa",banco:"Santander",tipo:"Bolsa Europa",ret:.06,vol:.16,lM:.8},
 "FY_0P00000CZO.F":{n:"Santander Acciones Españolas",banco:"Santander",tipo:"Bolsa España",ret:.05,vol:.18,lM:.75}
 /* Independientes retirados de momento (Cobas, Horos, Fundsmith, etc.). Guardados en fetch_datos.py (INDEPENDIENTES). */
};
let DATES=[],N=0,PRICES={},INCEPTION={},LASTREAL={},CUR={},FUNDS_META={},PANEL=null,MACRO=null,DATA_MODE="modelo",DATA_ASOF="2026-06-29",DATA_GEN="",DATA_SRC="datos modelados (demo)";
/* RAWP[tk] = serie de cierres REALES del activo (solo sus propias sesiones, sin rellenar).
   PRICES está alineado al calendario común y rellena huecos, lo que falsearía las
   variaciones (saldrían 0,0% los días que ese activo no cotizó).
   ASOF_DS = ÚNICA fecha de referencia del panel: la última sesión con cierre real para
   (casi) todos los ETFs. Todo el tablón mira ese mismo día: nunca se mezclan fechas.
   DIDX = fecha ISO -> índice del calendario global (para alinear FX por fecha). */
let RAWP={},RAWD={},ASOF_DS=null,DIDX={};
/* FX: histórico EURUSD alineado a DATES para conversión de divisas fecha a fecha. */
let FX=null,FXR=null,FX_FIRST=-1,FX_LAST=-1;
let baseBt="USD",baseF="EUR";   // moneda base por defecto: ETFs=USD, fondos=EUR
const CUR_SYM={USD:'$',EUR:'€',GBP:'£',GBp:'£',CHF:'CHF ',JPY:'¥'};
/* Inflación anual media (%) para la rentabilidad REAL, según la moneda base.
   EUR = IPCA zona euro (Eurostat, disponible desde 1997) · USD = CPI EE.UU. (BLS).
   Aproximadas, para ilustración. Cubren todo el histórico de precios (USD desde 1993).
   Si el periodo pedido empieza ANTES de la cobertura -> no se muestra "real" (N/D),
   nunca se asume 0% de inflación. Para años posteriores al último dato se usa la
   última tasa conocida y se marca como aproximación (≈). */
const INFL={
  EUR:{1997:1.7,1998:1.2,1999:1.1,2000:2.1,2001:2.4,2002:2.3,2003:2.1,2004:2.2,
       2005:2.2,2006:2.2,2007:2.1,2008:3.3,2009:0.3,2010:1.6,2011:2.7,2012:2.5,2013:1.4,2014:0.4,2015:0.2,2016:0.2,2017:1.5,2018:1.8,2019:1.2,2020:0.3,2021:2.6,2022:8.4,2023:5.4,2024:2.4,2025:2.2},
  USD:{1993:3.0,1994:2.6,1995:2.8,1996:3.0,1997:2.3,1998:1.6,1999:2.2,2000:3.4,2001:2.8,2002:1.6,2003:2.3,2004:2.7,
       2005:3.4,2006:3.2,2007:2.8,2008:3.8,2009:-0.4,2010:1.6,2011:3.2,2012:2.1,2013:1.5,2014:1.6,2015:0.1,2016:1.3,2017:2.1,2018:2.4,2019:1.8,2020:1.2,2021:4.7,2022:8.0,2023:4.1,2024:2.9,2025:2.9}
};
/* Tabla de inflación EXTENDIDA para un rango [sY..eY]: null si el rango empieza antes
   de la cobertura; años futuros rellenados con la última tasa conocida (aprox=true). */
function inflTabRango(base,sY,eY){
  const tab=INFL[base];if(!tab)return null;
  const ys=Object.keys(tab).map(Number),yMin=Math.min(...ys),yMax=Math.max(...ys);
  if(sY<yMin)return null;
  const ext={...tab};let aprox=false;
  for(let y=yMax+1;y<=eY;y++){ext[y]=tab[yMax];aprox=true;}
  return{tab:ext,aprox};
}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fdate=s=>{if(!s)return'';const p=s.slice(0,10).split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:s;};
const nameOf=tk=>FUNDS_META[tk]?FUNDS_META[tk].n:(U[tk]?U[tk].n:tk);
/* Código corto tipo ticker para fondos (en scatter y matriz de correlación) */
const COD={
 "FY_0P0001QM72.F":"CX RFCP","FY_0P00017HNP.F":"CX D30","FY_0P00017HNR.F":"CX D40","FY_0P00017HNT.F":"CX D50","FY_0P0001ODL4.F":"CX D60",
 "FY_0P000018SN.F":"CX DivEu","FY_0P00006ETR.F":"CX RVEu","FY_0P00000P6Y.F":"CX RVEs","FY_0P0000XRHI.F":"CX SelT","FY_0P00000P68.F":"CX GesT",
 "FY_0P00000PJM.F":"CX Comun","FY_0P00000JMN.F":"CX Emerg",
 "FY_0P00000DAY.F":"BBVA CP","FY_0P0001CC4T.F":"BBVA AhCa","FY_0P0001OEO6.F":"BBVA PatC","FY_0P00000V7V.F":"BBVA Cons","FY_0P00000PIM.F":"BBVA Mod",
 "FY_0P00018H0W.F":"BBVA O31","FY_0P00000L3B.F":"BBVA Dec","FY_0P0001BF04.F":"BDX EuESG","FY_0P00000PHR.F":"BBVA Euro","FY_0P0001BF05.F":"BDX Esp",
 "FY_0P00000PIC.F":"BBVA Plus","FY_0P00000PI5.F":"BBVA QMI","FY_0P0001C2DG.F":"BDX USA","FY_0P00000V7Q.F":"BBVA Tec","FY_0P00000PH5.F":"BBVA Emer",
 "FY_0P0001Q48V.F":"SAN CP","FY_0P00016ZNJ.F":"SAN Rend","FY_0P00000PHN.F":"SAN RFAh","FY_0P0000RVDZ.F":"SAN Dyn","FY_0P0001I2CK.F":"SAN Flex",
 "FY_0P000155MY.F":"SAN Dec","FY_0P0001J731.F":"SAN RVEu","FY_0P00000CZO.F":"SAN RVEs"
};
const shortCode=k=>U[k]?k:(COD[k]||((FUNDS_META[k]&&FUNDS_META[k].n)||k).replace(/^(CaixaBank|BBVA|Santander|Bindex)\s+/i,'').slice(0,8));

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildModeled(){
  const rand=mulberry32(20260629);const gauss=()=>{let u=0,v=0;while(!u)u=rand();while(!v)v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  const d=[],cur=new Date(Date.UTC(2013,6,1)),end=new Date(Date.UTC(2026,5,29));
  while(cur<=end){const w=cur.getUTCDay();if(w!==0&&w!==6)d.push(new Date(cur));cur.setUTCDate(cur.getUTCDate()+1);}
  DATES=d;N=d.length;
  const M=new Float64Array(N),B=new Float64Array(N),G=new Float64Array(N),K=new Float64Array(N);let vs=1;
  for(let t=0;t<N;t++){vs=0.97*vs+0.03+Math.max(0,gauss())*0.02;M[t]=gauss()*vs;B[t]=gauss();G[t]=gauss();K[t]=gauss()*vs;}
  for(const[tk,a]of Object.entries(U)){
    const lM=a.lM||0,lB=a.lB||0,lG=a.lG||0,lK=a.lK||0,sys=lM*lM+lB*lB+lG*lG+lK*lK,idio=Math.sqrt(Math.max(.02,1-sys));
    const dV=a.vol/Math.sqrt(252),dMu=Math.log(1+a.ret)/252+.5*dV*dV,p=new Float64Array(N);p[0]=100;
    for(let t=1;t<N;t++){let r=dMu+dV*(lM*M[t]+lB*B[t]+lG*G[t]+lK*K[t]+idio*gauss());if(r<-.9)r=-.9;p[t]=p[t-1]*(1+r);}
    PRICES[tk]=p;RAWP[tk]=p;INCEPTION[tk]=0;LASTREAL[tk]=N-1;CUR[tk]='USD';
  }
  for(const[tk,a]of Object.entries(FUND_UNIVERSE)){
    const lM=a.lM||0,lB=a.lB||0,lG=a.lG||0,lK=a.lK||0,sys=lM*lM+lB*lB+lG*lG+lK*lK,idio=Math.sqrt(Math.max(.02,1-sys));
    const dV=a.vol/Math.sqrt(252),dMu=Math.log(1+a.ret)/252+.5*dV*dV,p=new Float64Array(N);p[0]=100;
    for(let t=1;t<N;t++){let r=dMu+dV*(lM*M[t]+lB*B[t]+lG*G[t]+lK*K[t]+idio*gauss());if(r<-.9)r=-.9;p[t]=p[t-1]*(1+r);}
    PRICES[tk]=p;RAWP[tk]=p;INCEPTION[tk]=0;LASTREAL[tk]=N-1;CUR[tk]='EUR';FUNDS_META[tk]={n:a.n,fondo:true,banco:a.banco,tipo:a.tipo};
  }
  ASOF_DS=N?isoOf(DATES[N-1]):null;   /* demo: todas las fechas son "reales" */
  const isoAll=DATES.map(isoOf);DIDX={};isoAll.forEach((s,i)=>DIDX[s]=i);
  for(const tk in RAWP)if(!RAWD[tk])RAWD[tk]=isoAll;
  DATA_MODE="modelo";DATA_ASOF="2026-06-29";DATA_SRC="datos modelados (demo)";
}
function buildReal(D){
  const set=new Set();for(const tk in D.tickers)for(const s of D.tickers[tk].d)set.add(s);
  const sorted=[...set].sort();DATES=sorted.map(s=>new Date(s+"T00:00:00Z"));N=DATES.length;
  const idx={};sorted.forEach((s,i)=>idx[s]=i);
  DIDX=idx;   /* fecha -> índice global (correlaciones y FX por fecha) */
  for(const tk in D.tickers){
    const t=D.tickers[tk];
    const disponible=Array.isArray(t.p)&&t.p.length>0&&t.download_status!=='unavailable';
    if(t.fondo)FUNDS_META[tk]={n:t.nombre||tk,fondo:true,
      banco:t.banco||(FUND_UNIVERSE[tk]&&FUND_UNIVERSE[tk].banco)||'Otros',
      tipo:t.tipo||(FUND_UNIVERSE[tk]&&FUND_UNIVERSE[tk].tipo)||'',
      status:disponible?'ok':'unavailable',last_date:t.last_date||null,currency:t.currency||null};
    if(!disponible)continue;   /* §1: un activo sin precios reales NO entra en PRICES */
    const arr=new Array(N).fill(null);
    for(let k=0;k<t.d.length;k++)arr[idx[t.d[k]]]=t.p[k];
    let first=-1,last=null,lastReal=-1;for(let i=0;i<N;i++){if(arr[i]!=null){if(first<0)first=i;last=arr[i];lastReal=i;}else if(first>=0)arr[i]=last;}
    PRICES[tk]=arr;RAWP[tk]=t.p;RAWD[tk]=t.d;   /* serie cruda: solo sesiones reales de este activo */
    INCEPTION[tk]=first<0?0:first;LASTREAL[tk]=lastReal<0?N-1:lastReal;CUR[tk]=t.currency||null;
  }
  ASOF_DS=calcAsofDS();          /* fecha única de referencia del tablón */
  if(D.panel)PANEL=D.panel;
  if(D.macro)MACRO=D.macro;
  /* FX EURUSD alineado a DATES: relleno interno por festivos, SIN extender antes de su
     primera ni después de su última fecha real (§2). */
  FX=null;FXR=null;FX_FIRST=-1;FX_LAST=-1;
  const fxsrc=D.fx&&D.fx.EURUSD;
  if(fxsrc&&Array.isArray(fxsrc.d)&&fxsrc.d.length){
    FX=fxsrc;
    const arr=new Array(N).fill(null);
    for(let k=0;k<fxsrc.d.length;k++){const gi=idx[fxsrc.d[k]];if(gi!=null){const v=fxsrc.p[k];if(typeof v==='number'&&isFinite(v)&&v>0)arr[gi]=v;}}
    let first=-1,last=null,lastReal=-1;
    for(let i=0;i<N;i++){if(arr[i]!=null){if(first<0)first=i;last=arr[i];lastReal=i;}else if(first>=0)arr[i]=last;}
    for(let i=lastReal+1;i<N;i++)arr[i]=null;   // no extender tras la última fecha FX real
    FXR=arr;FX_FIRST=first;FX_LAST=lastReal;
  }
  DATA_MODE="real";DATA_ASOF=D.asof;DATA_GEN=D.generado||"";DATA_SRC=D.fuente||"Yahoo Finance";
}
/* §5: los datos llegan como JSON PASIVO (datos.json), nunca como código ejecutable.
   window.DATOS lo rellena cargarDatos() tras validar el esquema; si falla -> modo demo. */
function bootData(){
  try{
    if(window.DATOS&&window.DATOS.tickers&&Object.keys(window.DATOS.tickers).length){buildReal(window.DATOS);}
    else{buildModeled();}
  }catch(e){
    console.error('datos.json inválido o corrupto; usando datos de ejemplo.',e);
    DATES=[];N=0;PRICES={};INCEPTION={};LASTREAL={};FUNDS_META={};PANEL=null;MACRO=null;
    buildModeled();
  }
}

/* banners */
function renderBanners(){
  const real=DATA_MODE==="real";
  const st=document.getElementById('stamp');st.className='stamp '+(real?'real':'demo');
  st.textContent=(real?'DATOS REALES · ':'DATOS DEMO · ')+(real?fdate(DATA_ASOF):DATA_ASOF);
  const txt=real
    ? `<b>✔ Datos reales.</b>&nbsp;Fuente: ${esc(DATA_SRC)}. <b>Último cierre de mercado: ${fdate(DATA_ASOF)}</b>${DATA_GEN?` · descarga automática de datos: <b>${fdate(DATA_GEN)}</b>`:''}. Se actualiza solo cada día laborable.`
    : `<b>⚠ Modo demo (datos modelados).</b>&nbsp;Las cifras son realistas pero NO reales. Para datos reales y exactos ejecuta <b>fetch_datos.py</b> y recarga esta página.`;
  ['banner','banner2'].forEach(id=>{const b=document.getElementById(id);if(!b)return;b.className='databanner '+(real?'real':'demo');b.innerHTML=txt;});
}

/* ===================== 2) HELPERS CÁLCULO ===================== */
function iOf(d){let lo=0,hi=N-1;const tt=d.getTime();if(tt<=DATES[0].getTime())return 0;while(lo<hi){const m=(lo+hi+1)>>1;if(DATES[m].getTime()<=tt)lo=m;else hi=m-1;}return lo;}
function startIndex(plazo){const e=DATES[N-1];if(plazo==='all')return 0;if(plazo==='ytd')return iOf(new Date(Date.UTC(e.getUTCFullYear(),0,1)));const y=parseInt(plazo,10);return iOf(new Date(Date.UTC(e.getUTCFullYear()-y,e.getUTCMonth(),e.getUTCDate())));}
const val=(tk,i)=>{const p=PRICES[tk];return p?p[i]:null;};
const isoOf=d=>d.toISOString().slice(0,10);
/* Índice de una fecha dentro de la serie CRUDA del activo (búsqueda binaria). -1 = no cotizó. */
function rawIndexOf(tk,ds){
  const d=RAWD[tk];if(!d||!d.length)return -1;
  let lo=0,hi=d.length-1;
  while(lo<=hi){const m=(lo+hi)>>1;if(d[m]===ds)return m;if(d[m]<ds)lo=m+1;else hi=m-1;}
  return -1;
}
/* Fecha de referencia del panel: la última sesión con cierre REAL para >=95% de los ETFs.
   Descarta sesiones a medio publicar y garantiza que todo el tablón habla del MISMO día. */
function calcAsofDS(){
  const panel=Object.keys(RAWD).filter(tk=>U[tk]);
  if(panel.length){
    const need=Math.ceil(panel.length*0.95);
    for(let i=N-1;i>=0&&i>N-25;i--){
      const ds=isoOf(DATES[i]);let c=0;
      for(const tk of panel)if(rawIndexOf(tk,ds)>=0)c++;
      if(c>=need)return ds;
    }
  }
  return N?isoOf(DATES[N-1]):null;
}
/* Variación de un activo entre la fecha de referencia y `days` sesiones REALES SUYAS antes.
   - Usa la serie cruda: nunca sale 0,0% por un día que ese activo no cotizó.
   - Ancla en ASOF_DS: si el activo no cotizó ese día, devuelve null (N/D) en vez de
     colar el movimiento de otra fecha junto al de los demás. */
function change(tk,days){
  const p=RAWP[tk],d=RAWD[tk];if(!p||p.length<2)return null;
  const last=(d&&d.length&&ASOF_DS)?rawIndexOf(tk,ASOF_DS):p.length-1;
  if(last<1)return null;
  const b=last-days;if(b<0)return null;
  const a=p[last],c=p[b];
  if(a==null||c==null||!(c>0)||!isFinite(a)||!isFinite(c))return null;
  return a/c-1;
}
/* Primitivas del motor: ÚNICA FUENTE (js/finance.js). El navegador las recibe en `FIN`
   (script clásico cargado antes). Aquí solo se les da el nombre local que usa el motor,
   de modo que lo que corre la app == lo que prueba Vitest. */
const mean=FIN.mean, std=FIN.pstd, corr=FIN.corr, maxDD=FIN.maxDD;
function dailyRets(tk,s,e){const p=PRICES[tk],r=[];for(let t=s+1;t<=e;t++)if(p[t]!=null&&p[t-1]!=null)r.push(p[t]/p[t-1]-1);return r;}
function ddSeries(v){let pk=v[0];return v.map(x=>{if(x>pk)pk=x;return(x/pk-1)*100;});}

/* ===================== 3) NAVEGACIÓN ===================== */
const pages={dash:'page-dash',bt:'page-bt',fondos:'page-fondos'};
document.querySelectorAll('#mainNav button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#mainNav button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  Object.values(pages).forEach(id=>document.getElementById(id).classList.add('hidden'));
  document.getElementById(pages[b.dataset.page]).classList.remove('hidden');window.scrollTo(0,0);
});

/* ===================== 4) PANEL ===================== */
const COLORS=["#5b8def","#b08a3e","#b08a3e","#7d5a3a","#e26d6d","#3fa564","#8a6bcc","#d08a3a","#4a90c2","#b95c8f"];
function colorFor(tk){let h=0;for(const c of tk)h=(h*31+c.charCodeAt(0))>>>0;return COLORS[h%COLORS.length];}
const catTag=cat=>({Índices:"ÍNDICES",Activos:"ACTIVOS",Industrias:"INDUSTRIAS",Temáticas:"TEMÁTICAS"}[cat]||"");
let curCat="Todos",curFreq="Semanal";
const freqDays=()=>curFreq==="Diaria"?1:curFreq==="Mensual"?21:5;
const panelTickers=()=>Object.keys(PRICES).filter(tk=>U[tk]&&(curCat==="Todos"||U[tk].cat===curCat));

function renderWorstBest(){
  const days=freqDays();
  const rows=panelTickers().map(tk=>({tk,c:change(tk,days)})).filter(r=>r.c!=null).sort((a,b)=>a.c-b.c);
  const worst=rows.slice(0,10),best=rows.slice(-10).reverse();
  const draw=(el,arr)=>{el.innerHTML=arr.map(r=>{const u=r.c>=0,a=U[r.tk],c3=change(r.tk,63);
    return `<div class="tick"><div class="ico" style="background:${colorFor(r.tk)}">${esc(r.tk.slice(0,2))}</div>
      <div class="body"><div class="t1"><span class="sym">${esc(r.tk)}</span>${a.cat?`<span class="tag">${catTag(a.cat)}</span>`:''}</div><div class="name">${esc(a.n)}</div></div>
      <div><div class="chg ${u?'up':'dn'}">${u?'+':''}${(r.c*100).toFixed(1)}%</div><div class="vol">${c3!=null?'3M '+(c3>=0?'+':'')+(c3*100).toFixed(0)+'%':''}</div></div></div>`;}).join('');};
  draw(document.getElementById('worstList'),worst);draw(document.getElementById('bestList'),best);
  /* "Diaria" = la última sesión REAL de cada activo; se muestra con su fecha para que
     quede claro a qué cierre corresponde (nunca queda el tablón en blanco/0,0%). */
  const fl=curFreq==='Diaria'?('último cierre'+(ASOF_DS?' · '+fdate(ASOF_DS):'')):curFreq.toLowerCase();
  document.getElementById('worstFreq').textContent=fl;document.getElementById('bestFreq').textContent=fl;
}
let flowChart;
function renderFlow(){
  const days=freqDays();const rows=panelTickers().map(tk=>({tk,c:change(tk,days)})).filter(r=>r.c!=null).map(r=>({tk:r.tk,c:r.c*100})).sort((a,b)=>a.c-b.c);
  const bg=rows.map(r=>{const g=U[r.tk].g;if(r.c<0)return g==='B'?'#c99b6b':g==='R'?'#b08a3e':'#7fa9d6';return g==='B'?'#8fb98f':g==='R'?'#d0a94a':'#7d5a3a';});
  if(flowChart)flowChart.destroy();
  flowChart=new Chart(document.getElementById('flowChart'),{type:'bar',data:{labels:rows.map(r=>r.tk),datasets:[{data:rows.map(r=>r.c),backgroundColor:bg,borderRadius:2,categoryPercentage:.85,barPercentage:.9}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${rows[c.dataIndex].tk}  ${c.raw>=0?'+':''}${c.raw.toFixed(1)}%`}}},scales:{x:{ticks:{display:false},grid:{display:false}},y:{grid:{color:'#f0f0f0'},ticks:{callback:v=>v+'%',font:{size:10}}}}}});
}
function renderRadar(){
  const t=panelTickers().map(tk=>({tk,w:change(tk,5),m:change(tk,21)})).filter(o=>o.w!=null&&o.m!=null).map(o=>({tk:o.tk,w:o.w*100,accel:o.w*100-o.m*100/4.2}));
  const byW=[...t].sort((a,b)=>b.w-a.w),byA=[...t].sort((a,b)=>b.accel-a.accel);
  const chip=(o,ty)=>`<div class="chip ${ty==='g'?'g':ty==='r'?'r':''}"><b>${o.tk}</b><small>${ty==='rs'?'RS '+Math.max(1,Math.min(99,Math.round(50+o.w*3))):ty==='g'?'ACEL':'FRENA'}</small></div>`;
  document.getElementById('strongest').innerHTML=byW.slice(0,5).map(o=>chip(o,'rs')).join('');
  document.getElementById('weakest').innerHTML=byW.slice(-5).reverse().map(o=>chip(o,'rs')).join('');
  document.getElementById('gaining').innerHTML=byA.slice(0,5).map(o=>chip(o,'g')).join('');
  document.getElementById('losing').innerHTML=byA.slice(-5).reverse().map(o=>chip(o,'r')).join('');
}
function aboveMA(days){const all=Object.keys(PRICES).filter(tk=>U[tk]);let ok=0,tot=0;for(const tk of all){if((INCEPTION[tk]||0)>N-1-days)continue;const p=PRICES[tk];let m=0,c=0;for(let i=N-days;i<N;i++){if(p[i]!=null){m+=p[i];c++;}}if(c<days*0.6)continue;m/=c;tot++;if(p[N-1]>m)ok++;}return tot?Math.round(ok/tot*100):0;}
function trendTxt(tk){const p=PRICES[tk];let m=0,c=0;for(let i=Math.max(0,N-250);i<N;i++)if(p[i]!=null){m+=p[i];c++;}m/=c;return p[N-1]>m?'<span class="up">▲ sobre</span>':'<span class="dn">▼ bajo</span>';}
function renderBreadth(){
  const all=Object.keys(PRICES).filter(tk=>U[tk]);
  const ma50=aboveMA(50),ma200=aboveMA(200);
  /* change(tk,1) = variación en la sesión de referencia (ASOF_DS), no "hoy": se rotula
     con su fecha para que no haya duda de a qué día corresponde el sesgo. */
  const bw=document.getElementById('biasWhen');
  if(bw)bw.textContent=ASOF_DS?fdate(ASOF_DS):'una sola sesión';
  const chg=all.map(tk=>change(tk,1)).filter(v=>v!=null);
  /* Sin datos en la sesión de referencia -> 0 neutro, nunca NaN (división por 0). */
  const pos=chg.length?Math.round(chg.filter(v=>v>0).length/chg.length*100):0;
  const set=(id,v)=>{document.getElementById(id).textContent=v+'%';document.getElementById(id+'bar').style.width=v+'%';};
  set('ma50',ma50);set('ma200',ma200);set('postoday',pos);
  const up=chg.filter(v=>v>0).length,dn=chg.length-up;document.getElementById('advdec').textContent=up+'/'+dn;
  document.getElementById('newHi').textContent=all.filter(tk=>{const p=PRICES[tk];if((INCEPTION[tk]||0)>N-63)return false;let mx=0;for(let i=N-63;i<N;i++)if(p[i]!=null)mx=Math.max(mx,p[i]);return p[N-1]>=mx*.999;}).length;
  document.getElementById('newLo').textContent=all.filter(tk=>{const p=PRICES[tk];if((INCEPTION[tk]||0)>N-63)return false;let mn=1e18;for(let i=N-63;i<N;i++)if(p[i]!=null)mn=Math.min(mn,p[i]);return p[N-1]<=mn*1.001;}).length;
  document.getElementById('riskPct').textContent=pos+'%';
  document.getElementById('riskState').textContent=pos>60?'Alcista':pos>45?'Mixto':'Bajista';
  document.getElementById('pulseTxt').textContent=pos>60?'Tendencia con fuerza':pos>45?'Tendencia bajo presión':'Tendencia débil';
  if(PRICES.SPY)document.getElementById('spTrend').innerHTML=trendTxt('SPY');
  if(PRICES.QQQ)document.getElementById('ndxTrend').innerHTML=trendTxt('QQQ');
}
function renderFactorMap(){
  const proxy={GRANDE:{VALUE:'IWM',CORE:'SPY',GROWTH:'QQQ'},MEDIA:{VALUE:'XLF',CORE:'DIA',GROWTH:'XLK'},PEQUEÑA:{VALUE:'KRE',CORE:'IWM',GROWTH:'XBI'}};
  let h=`<div class="h"></div><div class="h">VALUE</div><div class="h">CORE</div><div class="h">GROWTH</div>`;
  for(const size of['GRANDE','MEDIA','PEQUEÑA']){h+=`<div class="h">${size}</div>`;
    for(const st of['VALUE','CORE','GROWTH']){const tk=proxy[size][st];const c=change(tk,5);if(c==null){h+=`<div class="cell" style="background:#f4f4f4"><b>–</b><small>${tk}</small></div>`;continue;}const cc=c*100,up=cc>=0;
      h+=`<div class="cell" style="background:${up?'var(--green-soft)':'var(--red-soft)'}"><b class="${up?'up':'dn'}">${up?'+':''}${cc.toFixed(1)}%</b><small>${tk}</small></div>`;}}
  document.getElementById('factorMap').innerHTML=h;
}
let assetChart,themeChart,curPeriod="YTD";
const ASSET_SET={SPY:'#1f2d3d',QQQ:'#e8590c',IWM:'#1c7ed6',VGK:'#2f9e44',EEM:'#d6336c',EWJ:'#7048e8',AGG:'#0ca678',GLD:'#b08a3e',SLV:'#868e96',IBIT:'#e64980',TLT:'#1098ad',DBC:'#a9754f',VNQ:'#5c940d'};
const THEME_SET={SMH:'#1f2d3d',BOTZ:'#e8590c',XLK:'#1c7ed6',SKYY:'#2f9e44',CIBR:'#d6336c',FINX:'#7048e8',BLOK:'#0ca678',ARKK:'#b08a3e',XBI:'#868e96',XLV:'#e64980',XLE:'#1098ad',ICLN:'#5c940d',TAN:'#f08c00',URA:'#a9754f',GDX:'#ae3ec9',ITA:'#364fc7'};
let assetActive=new Set(['SPY','QQQ','AGG','GLD','IBIT']),themeActive=new Set(['SMH','ARKK','XLK','CIBR','XLE']);
function periodStart(){const e=DATES[N-1];let s;if(curPeriod==='1M')s=iOf(new Date(Date.UTC(e.getUTCFullYear(),e.getUTCMonth()-1,e.getUTCDate())));else if(curPeriod==='3M')s=iOf(new Date(Date.UTC(e.getUTCFullYear(),e.getUTCMonth()-3,e.getUTCDate())));else if(curPeriod==='YTD')s=iOf(new Date(Date.UTC(e.getUTCFullYear(),0,1)));else if(curPeriod==='3A')s=iOf(new Date(Date.UTC(e.getUTCFullYear()-3,e.getUTCMonth(),e.getUTCDate())));else s=iOf(new Date(Date.UTC(e.getUTCFullYear()-1,e.getUTCMonth(),e.getUTCDate())));return s;}
function base100(tk,s){const p=PRICES[tk],out=[];let base=null;for(let t=s;t<N;t++){if(p[t]==null){out.push(null);continue;}if(base==null)base=p[t];out.push(p[t]/base*100);}return out;}
function stepLabels(s){const M=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];const o=[];for(let t=s;t<N;t++){const d=DATES[t];o.push(`${M[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`);}return o;}
function drawLine(cid,active,setMap,ref){
  const s=periodStart(),labels=stepLabels(s);
  const ds=[...active].filter(tk=>PRICES[tk]).map(tk=>({label:tk,data:base100(tk,s),borderColor:setMap[tk]||colorFor(tk),borderWidth:(tk==='SPY'||tk==='SMH')?2:1.4,pointRadius:0,tension:.15,spanGaps:true}));
  if(ref)ref.destroy();
  return new Chart(document.getElementById(cid),{type:'line',data:{labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.raw?c.raw.toFixed(1):'–'}`}}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:7,font:{size:10},color:'#a3968a'}},y:{grid:{color:'#efece5'},ticks:{font:{size:10},color:'#a3968a'}}}}});
}
function renderToggles(elId,setMap,active,redraw){
  document.getElementById(elId).innerHTML=Object.keys(setMap).filter(tk=>PRICES[tk]).map(tk=>`<div class="tg ${active.has(tk)?'on':''}" data-tk="${tk}"><span class="d" style="background:${setMap[tk]}"></span>${nameOf(tk)}</div>`).join('');
  document.getElementById(elId).querySelectorAll('.tg').forEach(el=>el.onclick=()=>{const tk=el.dataset.tk;active.has(tk)?active.delete(tk):active.add(tk);redraw();});
}
function redrawAsset(){assetChart=drawLine('assetChart',assetActive,ASSET_SET,assetChart);renderToggles('assetToggles',ASSET_SET,assetActive,redrawAsset);}
function redrawTheme(){themeChart=drawLine('themeChart',themeActive,THEME_SET,themeChart);renderToggles('themeToggles',THEME_SET,themeActive,redrawTheme);}
let sectorSort={k:'fuerza',dir:-1};
function renderSectorTable(){
  const secs=[['XLK','Tecnología'],['XLE','Energía'],['XLB','Materiales'],['XLI','Industria'],['XLRE','Inmobiliario'],['XLU','Utilities'],['XLV','Salud'],['XLP','Cons. básico'],['XLF','Financieras'],['XLY','Cons. discrec.'],['XLC','Comunicación']].filter(([tk])=>PRICES[tk]);
  const y0=iOf(new Date(Date.UTC(DATES[N-1].getUTCFullYear(),0,1)));
  /* Sin `||0`: un dato ausente debe salir como N/D, nunca como un falso +0,0%.
     %1D usa la MISMA sesión de referencia (ASOF_DS) que el resto del panel. */
  const pct=v=>v==null?null:v*100;
  const rows=secs.map(([tk,n])=>{
    const p=PRICES[tk],base=(p[y0]!=null&&p[y0]>0)?p[y0]:null,last=(p[N-1]!=null&&isFinite(p[N-1]))?p[N-1]:null;
    return{tk,n,last,d1:pct(change(tk,1)),d5:pct(change(tk,5)),d21:pct(change(tk,21)),
      ytd:(base!=null&&last!=null)?(last/base-1)*100:null};   /* evita dividir por null -> Infinity */
  });
  const ys=rows.map(r=>r.ytd).filter(v=>v!=null&&isFinite(v));
  const mn=ys.length?Math.min(...ys):0,mx=ys.length?Math.max(...ys):0;
  rows.forEach(r=>r.fuerza=(r.ytd==null)?null:(mx>mn?Math.round((r.ytd-mn)/(mx-mn)*100):50));
  const sk=sectorSort.k;
  rows.sort(sk==='tk'
    ?(a,b)=>(''+a.tk).localeCompare(''+b.tk)*sectorSort.dir
    :(a,b)=>{const x=a[sk],y=b[sk];if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return -1;return (x-y)*sectorSort.dir;});
  const nd='<td style="color:var(--muted)">N/D</td>';
  /* Evita el feo "-0.0%": una variación que redondea a cero se muestra neutra como "0.0%". */
  const cell=v=>{if(v==null||!isFinite(v))return nd;const r=Math.abs(v)<0.05?0:v;
    return `<td class="${r>=0?'up':'dn'}">${r>0?'+':''}${r.toFixed(1)}%</td>`;};
  const fc=f=>`hsl(140,${35+f*.3}%,${72-f*.25}%)`;
  document.querySelector('#sectorTable tbody').innerHTML=rows.map(r=>`<tr><td class="name"><b style="font-family:var(--mono)">${r.tk}</b> · ${r.n}</td>${r.fuerza==null?nd:`<td><span class="rs" style="background:${fc(r.fuerza)}">${r.fuerza}</span></td>`}${r.last==null?nd:`<td>${r.last.toFixed(2)}</td>`}${cell(r.d1)}${cell(r.d5)}${cell(r.d21)}${cell(r.ytd)}</tr>`).join('');
  const sw=document.getElementById('secWhen');
  if(sw)sw.textContent=ASOF_DS?`%1D = cierre del ${fdate(ASOF_DS)} · `:'';
  const cols=[['tk','Sector'],['fuerza','Fuerza'],['last','Último'],['d1','%1D'],['d5','%1S'],['d21','%1M'],['ytd','YTD']];
  document.querySelectorAll('#sectorTable thead th').forEach((th,i)=>{const[k,lab]=cols[i];th.style.cursor='pointer';th.innerHTML=lab+(sectorSort.k===k?(sectorSort.dir<0?' ▾':' ▴'):'');
    th.onclick=()=>{if(sectorSort.k===k)sectorSort.dir*=-1;else{sectorSort.k=k;sectorSort.dir=k==='tk'?1:-1;}renderSectorTable();};});
}
function distAccum(tk){/* respaldo por precio (modo demo, sin volumen) */
  const p=PRICES[tk];if(!p)return{dist:0,acc:0};let dist=0,acc=0;
  for(let t=Math.max(1,N-25);t<N;t++){if(p[t]==null||p[t-1]==null)continue;const r=p[t]/p[t-1]-1;if(r<=-0.002)dist++;else if(r>=0.002)acc++;}
  return{dist,acc};
}
function renderPanelStats(){
  let sp,ndx;
  if(PANEL){sp={dist:PANEL.spDist,acc:PANEL.spAccum};ndx={dist:PANEL.ndxDist,acc:PANEL.ndxAccum};}
  else{sp=distAccum('SPY');ndx=distAccum('QQQ');}
  const set=(id,o)=>{document.getElementById(id).textContent=o.dist;document.getElementById(id+'Sub').textContent=o.acc+' de acumulación · 25 sesiones';};
  set('spDist',sp);set('ndxDist',ndx);
}
function mLast(k){const m=MACRO&&MACRO[k];return m?m.p[m.p.length-1]:null;}
function mAgo(k,n){const m=MACRO&&MACRO[k];if(!m)return null;const i=m.p.length-1-n;return i>=0?m.p[i]:m.p[0];}
function mPct(k,win){const m=MACRO&&MACRO[k];if(!m)return null;const a=m.p.slice(-win),cur=a[a.length-1];let b=0;a.forEach(x=>{if(x<cur)b++;});return Math.round(b/a.length*100);}
function renderMacro(){
  const sec=document.getElementById('macroSection');
  const has=k=>MACRO&&MACRO[k]&&Array.isArray(MACRO[k].p)&&MACRO[k].p.length>0;
  /* La sección se muestra si existe AL MENOS UN indicador; si no, se oculta. */
  const anyInd=['T3M','T5Y','T10Y','T30Y','VIX','EURUSD','DXY'].some(has);
  if(!anyInd){sec.classList.add('hidden');return;}
  sec.classList.remove('hidden');
  const num=v=>(v==null||typeof v!=='number'||!isFinite(v));   // true = no disponible
  const f=(v,d)=>num(v)?'N/D':v.toFixed(d);
  const clamp=x=>Math.max(0,Math.min(100,x));
  const chgP=(c,p)=>{if(num(c)||num(p)||p===0)return'';const v=(c/p-1)*100;return`${v>=0?'+':''}${v.toFixed(1)}%`;};
  const t3=mLast('T3M'),t5=mLast('T5Y'),t10=mLast('T10Y'),t30=mLast('T30Y');
  const spread=(num(t10)||num(t3))?null:t10-t3;
  const vix=mLast('VIX'),vixPct=mPct('VIX',252);
  const eur=mLast('EURUSD'),eurA=mAgo('EURUSD',21),dxy=mLast('DXY'),dxyA=mAgo('DXY',21);

  /* --- Tarjeta 1: Treasuries (independiente) --- */
  const ys=[t3,t5,t10,t30];
  const valid=ys.map((y,i)=>({y,i})).filter(o=>!num(o.y));
  let curve='';
  if(valid.length>=2){
    const vv=valid.map(o=>o.y),mn=Math.min(...vv),mx=Math.max(...vv),rng=(mx-mn)||1,xs=[6,38,68,94];
    const yy=y=>(28-(y-mn)/rng*22).toFixed(1);
    curve=`<svg viewBox="0 0 100 32" preserveAspectRatio="none" style="width:100%;height:42px;margin-top:6px"><polyline points="${valid.map(o=>xs[o.i]+','+yy(o.y)).join(' ')}" fill="none" stroke="var(--navy)" stroke-width="1.4"/>${valid.map(o=>`<circle cx="${xs[o.i]}" cy="${yy(o.y)}" r="1.7" fill="var(--navy)"/>`).join('')}</svg>`;
  }
  const spreadTag=spread==null?`<span class="macro-tag">Spread 10A-3M N/D</span>`
    :`<span class="macro-tag ${spread<0?'r':'g'}">Spread 10A-3M ${spread>=0?'+':''}${spread.toFixed(2)} pp · ${spread<0?'curva invertida ⚠':'curva normal'}</span>`;
  const cardTipos=`<div class="card"><div class="section-title" style="font-size:16px">Tipos EE.UU. <span>Treasuries</span></div>
    <div class="macro-big">${f(t10,2)}${num(t10)?'':'<small>%</small>'}<small> a 10 años</small></div>${curve}
    <div class="macro-sub" style="font-family:var(--mono);color:var(--ink)">3M ${f(t3,2)} · 5A ${f(t5,2)} · 10A ${f(t10,2)} · 30A ${f(t30,2)}</div>
    <div style="margin-top:9px">${spreadTag}</div></div>`;

  /* --- Tarjeta 2: VIX (independiente) --- */
  let vixBody;
  if(num(vix)){
    vixBody=`<div class="macro-big">N/D</div><div class="macro-sub">Sin datos de VIX ahora mismo.</div>`;
  }else{
    let vixL,vixC,vixCol;
    if(vix<15){vixL='Calma';vixC='g';vixCol='var(--green)';}else if(vix<20){vixL='Normal';vixC='';vixCol='var(--ink)';}
    else if(vix<30){vixL='Tensión';vixC='a';vixCol='var(--amber)';}else{vixL='Pánico';vixC='r';vixCol='var(--red)';}
    const pctTxt=num(vixPct)?'N/D':`percentil ${vixPct}</b> · ${vixPct<33?'zona baja':vixPct<67?'zona media':'zona alta'}`;
    vixBody=`<div class="macro-big" style="color:${vixCol}">${vix.toFixed(1)}</div>
    <span class="macro-tag ${vixC}">${vixL}</span>
    <div class="macro-sub">Frente a su propio último año: <b>${pctTxt}. Recuerda: más VIX = más miedo.</div>`;
  }
  const cardVix=`<div class="card"><div class="section-title" style="font-size:16px">VIX <span>volatilidad</span></div>${vixBody}</div>`;

  /* --- Tarjeta 3: Divisas (independiente) --- */
  const eurCh=chgP(eur,eurA),dxyCh=chgP(dxy,dxyA);
  const cardDiv=`<div class="card"><div class="section-title" style="font-size:16px">Divisas <span>var. 1 mes</span></div>
    <div class="macro-row"><span>EUR / USD</span><span><b>${f(eur,3)}</b> ${eurCh?`<span class="${eur>=eurA?'up':'dn'}" style="font-size:11px">${eurCh}</span>`:''}</span></div>
    <div class="macro-row" style="border-bottom:0"><span>Dólar (DXY)</span><span><b>${f(dxy,1)}</b> ${dxyCh?`<span class="${dxy>=dxyA?'up':'dn'}" style="font-size:11px">${dxyCh}</span>`:''}</span></div>
    <div class="macro-sub">Un dólar fuerte (DXY↑) suele restar a bolsas y materias primas.</div></div>`;

  /* --- Tarjeta 4: Termómetro (re-pondera solo los componentes disponibles) --- */
  const comps=[];
  const breadth200=aboveMA(200);
  const hayPrecios=Object.keys(PRICES).some(tk=>U[tk]);
  if(hayPrecios&&isFinite(breadth200))comps.push({w:.35,v:clamp(breadth200)});
  if(!num(vix))comps.push({w:.30,v:clamp((35-vix)/(35-12)*100)});
  if(spread!=null)comps.push({w:.15,v:clamp((spread+1)/3.5*100)});
  const hyg=PRICES.HYG;
  if(hyg){let m=0,c=0;for(let i=Math.max(0,N-50);i<N;i++)if(hyg[i]!=null){m+=hyg[i];c++;}if(c){m/=c;comps.push({w:.20,v:clamp(50+(hyg[N-1]/m-1)*1200)});}}
  let cardTermo;
  if(!comps.length){
    cardTermo=`<div class="card"><div class="section-title" style="font-size:16px">Termómetro macro <span>medio plazo</span></div>
      <div class="macro-big">N/D</div><div class="macro-sub">Datos insuficientes para calcular el régimen. Combina amplitud, VIX, curva de tipos y crédito.</div></div>`;
  }else{
    const wsum=comps.reduce((a,c)=>a+c.w,0);
    const score=Math.round(comps.reduce((a,c)=>a+c.w*c.v,0)/wsum);
    const reg=score>60?'Risk-on':score>=45?'Neutral':'Risk-off',regCol=score>60?'var(--green)':score>=45?'var(--gold)':'var(--red)';
    const amp=(hayPrecios&&isFinite(breadth200))?`amplitud (${breadth200}% sobre media 200), `:'';
    cardTermo=`<div class="card"><div class="section-title" style="font-size:16px">Termómetro macro <span>medio plazo</span></div>
      <div class="macro-big" style="color:${regCol}">${reg}</div>
      <div class="gaugebar"><i style="left:${score}%"></i></div>
      <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin-top:3px"><span>◄ Defensivo · risk-off</span><span>Riesgo · risk-on ►</span></div>
      <div class="macro-sub">Score <b>${score}/100</b>. Régimen de fondo (semanas/meses), no el día de hoy. Combina ${amp}VIX, curva de tipos y crédito.</div></div>`;
  }

  document.getElementById('macroWrap').innerHTML=cardTipos+cardVix+cardDiv+cardTermo;
}
function renderDashboard(){renderWorstBest();renderFlow();renderRadar();renderBreadth();renderPanelStats();renderMacro();renderFactorMap();renderSectorTable();redrawAsset();redrawTheme();}
document.getElementById('segCat').querySelectorAll('button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#segCat button').forEach(x=>x.classList.remove('on'));b.classList.add('on');curCat=b.dataset.cat;renderWorstBest();renderFlow();renderRadar();});
document.getElementById('segFreq').querySelectorAll('button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#segFreq button').forEach(x=>x.classList.remove('on'));b.classList.add('on');curFreq=b.dataset.f;renderWorstBest();renderFlow();renderRadar();});
document.getElementById('segPeriod').querySelectorAll('button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#segPeriod button').forEach(x=>x.classList.remove('on'));b.classList.add('on');curPeriod=b.dataset.p;redrawAsset();redrawTheme();});

/* ===================== 5) MOTOR BACKTEST (compartido) ===================== */
/* Registro de gráficos: cada recálculo creaba instancias nuevas de Chart.js sin
   destruir las anteriores (canvas reemplazado por innerHTML -> instancias huérfanas
   acumulándose en memoria). Se destruye la previa del mismo id antes de crear. */
const CHARTS={};
function mkChart(id,cfg){
  const el=document.getElementById(id);if(!el)return null;
  if(CHARTS[id]){try{CHARTS[id].destroy();}catch(_){/* canvas ya retirado */}}
  return CHARTS[id]=new Chart(el,cfg);
}
/* Aviso cuando no se puede convertir la divisa (falta FX o solape insuficiente).
   Ofrece cambiar de base/plazo y, como ÚLTIMO recurso, comparar sin conversión
   (checkbox desactivado por defecto → botón bloqueado hasta marcarlo). */
function fxBackWarning(res,motivo,base,convItems,weights,benchSpec,plazo,containerId){
  const otros=base==='EUR'?'USD':'EUR';
  const causa=motivo==='falta'
    ? 'No hay serie de tipos de cambio (EUR/USD) disponible para convertir.'
    : 'El histórico de tipos de cambio no cubre suficientemente el periodo común de estos activos.';
  res.innerHTML='';
  const card=document.createElement('div');card.className='card';
  const h=document.createElement('div');h.className='hint';
  h.innerHTML=`<b>No se puede convertir la divisa ahora mismo.</b><br>${esc(causa)}<br>Opciones: cambia la <b>moneda base</b> a ${esc(otros)}, reduce el <b>plazo</b>, o compara sin conversión (orientativo).`;
  card.appendChild(h);
  const lab=document.createElement('label');lab.style.cssText='display:flex;align-items:center;gap:8px;margin-top:12px;font-size:13px';
  const cb=document.createElement('input');cb.type='checkbox';
  lab.appendChild(cb);lab.appendChild(document.createTextNode('Comparar sin conversión — resultado orientativo'));
  card.appendChild(lab);
  const btn=document.createElement('button');btn.textContent='Calcular sin conversión';
  btn.style.cssText='margin-top:10px;opacity:.5;pointer-events:none;border:1px solid #ccc;border-radius:9px;padding:8px 14px;background:#fff';
  cb.addEventListener('change',()=>{const on=cb.checked;btn.style.opacity=on?'1':'.5';btn.style.pointerEvents=on?'auto':'none';});
  btn.addEventListener('click',()=>doBacktest(weights,benchSpec,plazo,containerId,base,true));
  card.appendChild(btn);
  res.appendChild(card);
  res.scrollIntoView({behavior:'smooth',block:'start'});
}
function doBacktest(weights, benchSpec, plazo, containerId, baseCur, allowNoConv){
  /* Un activo con peso 0% no participa: no debe recortar el periodo común ni
     aparecer en correlaciones/gráficos (seleccionado sin peso todavía). */
  const keys=Object.keys(weights).filter(k=>PRICES[k]&&(weights[k]||0)>0);
  const res=document.getElementById(containerId);
  if(!keys.length){res.innerHTML='<div class="card"><div class="hint">Añade al menos un activo y pulsa Calcular.</div></div>';return;}
  const sumW=keys.reduce((a,k)=>a+(weights[k]||0),0);
  if(Math.abs(sumW-100)>0.5){res.innerHTML=`<div class="card"><div class="hint">Los pesos de tu cartera deben sumar <b>100%</b> para poder calcular. Ahora mismo suman <b>${sumW.toFixed(0)}%</b>. Ajústalos a mano o pulsa <b>"Repartir igual"</b>.</div></div>`;res.scrollIntoView({behavior:'smooth',block:'start'});return;}
  const totW=sumW||1,w={};keys.forEach(k=>w[k]=(weights[k]||0)/totW);
  /* Referencia: un ticker (índice/fondo) o una cartera completa {weights,name} */
  const benchIsPf=benchSpec&&typeof benchSpec==='object';
  let benchKeys,bw={},bl;
  if(benchIsPf){
    benchKeys=Object.keys(benchSpec.weights).filter(k=>PRICES[k]&&(benchSpec.weights[k]||0)>0);
    if(!benchKeys.length){res.innerHTML='<div class="card"><div class="hint">Añade al menos un fondo a la <b>Cartera B</b> para comparar.</div></div>';return;}
    const sB=benchKeys.reduce((a,k)=>a+(benchSpec.weights[k]||0),0);
    if(Math.abs(sB-100)>0.5){res.innerHTML=`<div class="card"><div class="hint">La <b>Cartera B</b> debe sumar <b>100%</b> (ahora suma <b>${sB.toFixed(0)}%</b>).</div></div>`;res.scrollIntoView({behavior:'smooth',block:'start'});return;}
    benchKeys.forEach(k=>bw[k]=(benchSpec.weights[k]||0)/sB);
    bl=benchSpec.name||'Cartera B';
  }else{
    if(!PRICES[benchSpec]){res.innerHTML='<div class="card"><div class="hint">La referencia seleccionada no tiene datos disponibles. Elige otra en «Comparar contra».</div></div>';return;}
    benchKeys=[benchSpec];bl=nameOf(benchSpec);
  }
  /* ---- Divisas ---- falta moneda = bloquea; distinta a la base = conversión histórica ---- */
  const involved=[...keys,...benchKeys];
  const allAssets=involved.map(k=>({k,cur:CUR[k]||null,n:nameOf(k)}));
  const sinMoneda=allAssets.filter(a=>!a.cur);
  if(sinMoneda.length){
    res.innerHTML=`<div class="card"><div class="hint"><b>No se puede calcular porque falta la moneda de:</b> ${sinMoneda.map(a=>esc(a.n)).join(', ')}.<br>Sin la divisa del instrumento no es seguro comparar. Quítalo o usa otro con moneda conocida.</div></div>`;
    res.scrollIntoView({behavior:'smooth',block:'start'});return;
  }
  const base=(baseCur==='EUR'||baseCur==='USD')?baseCur:(containerId==='f-results'?baseF:baseBt);
  const SUPPORTED=['EUR','USD'];
  const noSop=allAssets.filter(a=>!SUPPORTED.includes(a.cur)&&a.cur!==base);
  if(noSop.length){
    const monedas=[...new Set(noSop.map(a=>a.cur))].join(', ');
    res.innerHTML=`<div class="card"><div class="hint"><b>No hay conversión de divisa configurada para: ${esc(monedas)}.</b><br>De momento solo se convierten EUR y USD. ${noSop.map(a=>esc(a.n)).join(', ')} quedaría sin convertir; no se calcula para no inventar el tipo de cambio.</div></div>`;
    res.scrollIntoView({behavior:'smooth',block:'start'});return;
  }
  const convItems=allAssets.filter(a=>a.cur!==base);
  const needConv=convItems.length>0 && !allowNoConv;
  const inc=Math.max(...involved.map(k=>INCEPTION[k]||0));
  /* fin del backtest = última fecha REAL común (no se extiende con forward-fill) */
  let e=Math.min(N-1,...involved.map(k=>LASTREAL[k]==null?N-1:LASTREAL[k]));
  if(needConv){
    if(!FXR||FX_FIRST<0){fxBackWarning(res,'falta',base,convItems,weights,benchSpec,plazo,containerId);return;}
    e=Math.min(e,FX_LAST);                       /* no usar FX más allá de su última fecha real */
  }
  if(e<20){res.innerHTML='<div class="card"><div class="hint">No hay suficiente histórico común para calcular.</div></div>';return;}
  const eD0=DATES[e];
  const startForPlazo=()=>{if(plazo==='all')return 0;if(plazo==='ytd')return iOf(new Date(Date.UTC(eD0.getUTCFullYear(),0,1)));const y=parseInt(plazo,10);return iOf(new Date(Date.UTC(eD0.getUTCFullYear()-y,eD0.getUTCMonth(),eD0.getUTCDate())));};
  let s=Math.max(startForPlazo(),inc);
  if(needConv)s=Math.max(s,FX_FIRST);            /* no usar FX antes de su primera fecha real */
  if(e-s<20){
    if(needConv){fxBackWarning(res,'solape',base,convItems,weights,benchSpec,plazo,containerId);return;}
    res.innerHTML='<div class="card"><div class="hint">No hay suficiente histórico común para este plazo o los activos no se solapan en el tiempo. Prueba un plazo más corto o revisa las fechas de los datos.</div></div>';return;
  }
  const years=(DATES[e].getTime()-DATES[s].getTime())/(365.25*864e5);
  /* Precios convertidos a la moneda base, FECHA A FECHA (o sin convertir si allowNoConv). */
  const PX={};
  for(const k of involved){
    const c=CUR[k],src=PRICES[k],out=new Array(N).fill(null);
    for(let t=s;t<=e;t++){out[t]=(allowNoConv||c===base)?src[t]:FIN.fxConvert(src[t],c,base,FXR?FXR[t]:null);}
    PX[k]=out;
  }
  const dr2=(k,a,b)=>{const p=PX[k],r=[];for(let t=a+1;t<=b;t++)if(p[t]!=null&&p[t-1]!=null)r.push(p[t]/p[t-1]-1);return r;};
  const psym=allowNoConv&&convItems.length?'':(CUR_SYM[base]||'');
  /* Aviso de conversión / advertencia sin conversión (se insertan sobre los resultados). */
  let convNotice='';
  if(needConv){
    const byC={};convItems.forEach(a=>{(byC[a.cur]=byC[a.cur]||[]).push(shortCode(a.k));});
    const frases=Object.keys(byC).map(c=>`${byC[c].join(', ')} convertidos de ${c} a ${base} mediante EUR/USD histórico`);
    convNotice=`<div class="card" style="background:#f5efe2;border-color:#e0d2b4;margin-bottom:10px"><div class="hint" style="color:#5a4632">Resultados expresados en <b>${esc(base)}</b> utilizando tipos de cambio históricos. Las rentabilidades incluyen el efecto de la divisa. No se incluyen comisiones de cambio ni cobertura de moneda.<br>${esc(frases.join('. '))}.</div></div>`;
  }
  if(allowNoConv&&convItems.length){
    const monedas=[...new Set(involved.map(k=>CUR[k]))].join(', ');
    convNotice=`<div class="card" style="background:#f7ece8;border-color:#e6cfc7;margin-bottom:10px"><div class="hint" style="color:#7e2a2a"><b>⚠ Comparación sin ajustar divisas. Los resultados no son directamente comparables.</b><br>Cada activo se muestra en su propia moneda (${esc(monedas)}). Es solo orientativo.</div></div>`;
  }
  /* Series y métricas calculadas por el MISMO módulo que prueba Vitest (js/finance.js). */
  const pvArr=FIN.portfolioValue(PX,w,s,e,10000);
  const bArr=benchIsPf?FIN.portfolioValue(PX,bw,s,e,10000):FIN.portfolioValue(PX,{[benchSpec]:1},s,e,10000);
  /* Anualización según las sesiones REALES del periodo: el calendario común (unión de
     ETFs y fondos) no tiene exactamente 252 filas/año, y asumirlo sesga vol/Sharpe. */
  const pery=(pvArr.length-1)/years;
  const M=FIN.metrics(pvArr,years,pery),B=FIN.metrics(bArr,years,pery);
  const totalRet=M.totalRet,cagr=M.cagr,vol=M.vol,mdd=M.mdd,sharpe=M.sharpe,sortino=M.sortino;
  const bTotal=B.totalRet,bCagr=B.cagr,bVol=B.vol,bMdd=B.mdd,bSharpe=B.sharpe,bSortino=B.sortino;
  /* Mejor/peor año NATURAL desde la serie real de la cartera (buy&hold, pesos derivan) */
  const yrs=[],mos=[];for(let t=s;t<=e;t++){yrs.push(DATES[t].getUTCFullYear());mos.push(DATES[t].getUTCMonth());}
  const Y=FIN.yearly(pvArr,yrs,mos),best=Y.best,worst=Y.worst;
  const fmtP=v=>(v>=0?'+':'')+(v*100).toFixed(1)+'<small>%</small>',cls=v=>v>=0?'up':'dn';
  const mL=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],sD=DATES[s],eD=DATES[e];
  const per=`${mL[sD.getUTCMonth()]} ${sD.getUTCFullYear()} → ${mL[eD.getUTCMonth()]} ${eD.getUTCFullYear()} (${years.toFixed(1)} años)`;
  /* Rentabilidad REAL (descontando inflación de la moneda base, prorrateada por año).
     Si la tabla no cubre el inicio del periodo -> no se muestra (N/D), jamás se asume 0%.
     Si extrapola el año en curso con la última tasa conocida -> se marca con ≈. */
  const yearFrac=d=>{const y=d.getUTCFullYear();const a=Date.UTC(y,0,1),b=Date.UTC(y+1,0,1);return (d.getTime()-a)/(b-a);};
  const rngInf=inflTabRango(base,sD.getUTCFullYear(),eD.getUTCFullYear());
  let realTotal=null,realCagr=null,realAprox=false;
  if(rngInf){
    const infF=FIN.cumInflationFactor(rngInf.tab,sD.getUTCFullYear(),yearFrac(sD),eD.getUTCFullYear(),yearFrac(eD));
    if(infF!=null&&isFinite(infF)&&infF>0){
      realTotal=FIN.realReturn(totalRet,infF);
      realCagr=years>0?Math.pow(1+realTotal,1/years)-1:0;
      realAprox=rngInf.aprox;
    }
  }
  res.innerHTML=`${convNotice}<div class="period-note">Periodo analizado: <b>${mL[sD.getUTCMonth()]} ${sD.getUTCFullYear()} → ${mL[eD.getUTCMonth()]} ${eD.getUTCFullYear()}</b> (${years.toFixed(1)} años). <span style="color:var(--muted)">Rentabilidad <b>total</b> (con dividendos reinvertidos): saldrá <b>mayor</b> que la de «solo precio» que suele mostrar Google o TradingView.</span></div>
  <div class="kpis">
    <div class="kpi"><div class="lbl">Rentab. total</div><div class="v ${cls(totalRet)}">${fmtP(totalRet)}</div><div class="s">${psym}${Math.round(pvArr[pvArr.length-1]).toLocaleString('es')}${realTotal!=null?` · real ${realAprox?'≈':''}${fmtP(realTotal)}`:''}</div></div>
    <div class="kpi"><div class="lbl">CAGR (anual)</div><div class="v ${cls(cagr)}">${fmtP(cagr)}</div><div class="s">${realCagr!=null?`real ${realAprox?'≈':''}${fmtP(realCagr)}/año`:'compuesto'}</div></div>
    <div class="kpi"><div class="lbl">Volatilidad</div><div class="v">${(vol*100).toFixed(1)}<small>%</small></div><div class="s">anualizada</div></div>
    <div class="kpi"><div class="lbl">Máx. caída</div><div class="v dn">${(mdd*100).toFixed(1)}<small>%</small></div><div class="s">pico a valle</div></div>
    <div class="kpi"><div class="lbl">Sharpe</div><div class="v ${sharpe>=1?'up':''}">${sharpe.toFixed(2)}</div><div class="s">rentab./riesgo</div></div>
    <div class="kpi"><div class="lbl">Sortino</div><div class="v ${sortino>=1?'up':''}">${sortino.toFixed(2)}</div><div class="s">riesgo a la baja</div></div>
    <div class="kpi"><div class="lbl">Mejor año</div><div class="v ${best.y==null?'':'up'}">${best.y==null?'N/D':fmtP(best.r)}</div><div class="s">${best.y==null?'sin año natural completo':best.y}</div></div>
    <div class="kpi"><div class="lbl">Peor año</div><div class="v ${worst.y==null?'':cls(worst.r)}">${worst.y==null?'N/D':fmtP(worst.r)}</div><div class="s">${worst.y==null?'sin año natural completo':worst.y}</div></div>
  </div>
  <div class="bench-ficha"><div class="bf-t">Comparado contra: <b>${esc(bl)}</b> <span style="color:var(--muted);font-size:11.5px">· mismo periodo</span></div>
    <div class="bf-m"><span><i>Rentab.</i>${fmtP(bTotal)}</span><span><i>CAGR</i>${fmtP(bCagr)}</span><span><i>Volat.</i>${(bVol*100).toFixed(1)}%</span><span><i>Máx.caída</i>${(bMdd*100).toFixed(1)}%</span><span><i>Sharpe</i>${bSharpe.toFixed(2)}</span><span><i>Sortino</i>${bSortino.toFixed(2)}</span></div></div>
  <div class="xbar" id="${containerId}_xbar" style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 6px"></div>
  <div id="${containerId}_xout"></div>
  <div class="card chart-card"><div class="section-title" style="font-size:20px">Crecimiento de ${psym||''}10.000 <span>${per}</span></div>
    <div class="legend"><span class="k"><i style="background:#6b2233"></i>Tu cartera</span><span class="k"><i style="background:#b9ad9c"></i>${esc(bl)}</span></div>
    <div class="canvas-h tall"><canvas id="${containerId}_g"></canvas></div></div>
  <div class="card chart-card"><div class="section-title" style="font-size:20px">Caídas desde máximos <span>cuánto estabas por debajo de tu mejor momento</span></div>
    <div class="legend"><span class="k"><i style="background:#a63a3a"></i>Cartera (${(mdd*100).toFixed(0)}%)</span><span class="k"><i style="background:#bbb"></i>${esc(bl)} (${(maxDD(bArr)*100).toFixed(0)}%)</span></div>
    <div class="canvas-h" style="height:220px"><canvas id="${containerId}_d"></canvas></div></div>
  <div class="two">
    <div class="card"><div class="section-title" style="font-size:20px">Rentabilidad vs riesgo <span>anualizado · periodo común</span></div>
      <div class="canvas-h" style="height:360px"><canvas id="${containerId}_s"></canvas></div>
      <div class="hint">Arriba-izquierda es lo ideal: <b>más rentabilidad con menos riesgo</b>. El cuadrado azul es tu cartera.</div></div>
    <div class="card"><div class="section-title" style="font-size:20px">Correlación entre activos <span>retornos diarios · periodo común</span></div>
      <div class="corrwrap" id="${containerId}_c" style="margin-top:12px"></div>
      <div class="hint">Cerca de <b>+1</b> (azul): se mueven igual. Cerca de <b>0</b>: poca relación lineal (no implica independencia). Negativo (rojo): se mueven al revés — eso diversifica.</div></div>
  </div>
  <div class="foot" style="margin-top:20px">Rentabilidad total con dividendos reinvertidos · compra y mantén, sin rebalanceo · Sharpe/Sortino con tipo sin riesgo 0 · anualizado con las sesiones reales del periodo (~${Math.round(pery)}/año) · no incluye comisiones, impuestos ni costes de cambio. <b>Rentabilidad pasada no garantiza resultados futuros.</b></div>`;

  const labels=[];for(let t=s;t<=e;t++)labels.push(t);
  const yTick=v=>DATES[s+v]?DATES[s+v].getUTCFullYear():'';
  mkChart(containerId+'_g',{type:'line',data:{labels,datasets:[{label:'Tu cartera',data:pvArr,borderColor:'#6b2233',borderWidth:1.8,pointRadius:0,tension:.1},{label:bl,data:bArr,borderColor:'#b9ad9c',borderWidth:1.5,pointRadius:0,tension:.1}]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${psym}${Math.round(c.raw).toLocaleString('es')}`}}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:8,font:{size:10},color:'#a3968a',callback:yTick}},y:{grid:{color:'#efece5'},ticks:{font:{size:10},color:'#a3968a',callback:v=>(v/1000).toFixed(0)+'k'}}}}});
  mkChart(containerId+'_d',{type:'line',data:{labels,datasets:[{label:'Cartera',data:ddSeries(pvArr),borderColor:'#a63a3a',backgroundColor:'rgba(166,58,58,.10)',fill:true,borderWidth:1.3,pointRadius:0},{label:bl,data:ddSeries(bArr),borderColor:'#b9ad9c',borderWidth:1,pointRadius:0,fill:false}]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.raw.toFixed(1)}%`}}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:8,font:{size:10},color:'#a3968a',callback:yTick}},y:{grid:{color:'#efece5'},ticks:{font:{size:10},color:'#a3968a',callback:v=>v.toFixed(0)+'%'}}}}});

  const pts=keys.map(k=>{const r=dr2(k,s,e);return{x:std(r)*Math.sqrt(pery)*100,y:(Math.pow(PX[k][e]/PX[k][s],1/years)-1)*100,label:shortCode(k),full:nameOf(k),color:colorFor(k)};});
  const benchShort=benchIsPf?'Cartera B':shortCode(benchSpec);
  const bpt={x:bVol*100,y:bCagr*100,label:benchShort,full:bl};
  const ppt={x:vol*100,y:cagr*100,full:'Tu cartera'};
  /* Rango de ejes: si todos los puntos casi coinciden (p.ej. dos fondos monetarios), el eje
     colapsaría a un solo valor. Se garantiza una amplitud mínima legible y algo de margen. */
  const rango=(vals,minSpan,piso)=>{
    const ok=vals.filter(v=>isFinite(v));if(!ok.length)return{min:undefined,max:undefined};
    let lo=Math.min(...ok),hi=Math.max(...ok);const span=hi-lo;
    if(span<minSpan){const c=(lo+hi)/2;lo=c-minSpan/2;hi=c+minSpan/2;}else{lo-=span*0.15;hi+=span*0.15;}
    if(piso!=null)lo=Math.max(piso,lo);
    return{min:+lo.toFixed(4),max:+hi.toFixed(4)};
  };
  const rx=rango([...pts.map(p=>p.x),bpt.x,ppt.x],1,0),ry=rango([...pts.map(p=>p.y),bpt.y,ppt.y],1,null);
  const scPlugin={id:'sc',afterDatasetsDraw(ch){const c=ch.ctx;c.font='11px "Source Sans 3", sans-serif';c.fillStyle='#4a4038';ch.getDatasetMeta(0).data.forEach((m,i)=>c.fillText(' '+pts[i].label,m.x+6,m.y+3));const bm=ch.getDatasetMeta(1).data[0];if(bm)c.fillText(' '+benchShort,bm.x+7,bm.y+3);}};
  mkChart(containerId+'_s',{type:'scatter',data:{datasets:[{data:pts,pointBackgroundColor:pts.map(p=>p.color),pointRadius:6},{data:[bpt],pointBackgroundColor:'#8a7d6d',pointRadius:7,borderColor:'#000',borderWidth:2},{data:[ppt],pointBackgroundColor:'#6b2233',pointRadius:8,pointStyle:'rect'}]},plugins:[scPlugin],options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const d=c.raw;return`${d.full||d.label||'Tu cartera'}: ${d.y.toFixed(1)}% / vol ${d.x.toFixed(1)}%`}}}},scales:{x:{min:rx.min,max:rx.max,title:{display:true,text:'Volatilidad anual →',font:{size:11}},grid:{color:'#efece5'},ticks:{maxTicksLimit:7,callback:v=>(+v).toFixed(2)+'%',font:{size:10}}},y:{min:ry.min,max:ry.max,grid:{color:'#efece5'},ticks:{maxTicksLimit:7,callback:v=>(+v).toFixed(2)+'%',font:{size:10}}}}}});

  /* Correlación SOLO sobre fechas comunes REALES de cada par (sesiones en que ambos
     cotizaron), en la moneda base. El método anterior usaba el calendario relleno y
     recortaba por longitud, lo que podía desalinear fechas y diluir la correlación
     con retornos 0% ficticios de días no cotizados. */
  const priceMap=k=>{
    const m=new Map(),d=RAWD[k]||[],p=RAWP[k]||[];
    for(let i=0;i<d.length;i++){
      const gi=DIDX[d[i]];if(gi==null||gi<s||gi>e)continue;
      let v=p[i];
      if(!allowNoConv&&CUR[k]!==base)v=FIN.fxConvert(v,CUR[k],base,FXR?FXR[gi]:null);
      if(v!=null&&isFinite(v)&&v>0)m.set(d[i],v);
    }
    return m;
  };
  const maps=keys.map(priceMap);
  const corrComun=(i,j)=>{
    const A=maps[i],B=maps[j];if(!A.size||!B.size)return null;
    const [ch,gr]=A.size<=B.size?[A,B]:[B,A];
    const fechas=[];for(const ds of ch.keys())if(gr.has(ds))fechas.push(ds);
    if(fechas.length<3)return null;
    const ra=[],rb=[];
    for(let t=1;t<fechas.length;t++){
      ra.push(A.get(fechas[t])/A.get(fechas[t-1])-1);
      rb.push(B.get(fechas[t])/B.get(fechas[t-1])-1);
    }
    return corr(ra,rb);
  };
  const heat=v=>v<0?`rgba(166,58,58,${Math.min(.35,Math.abs(v)*.6)})`:`rgba(107,34,51,${0.12+v*0.6})`;
  let ct='<table class="corr"><tr><th></th>'+keys.map(k=>`<th title="${esc(nameOf(k))}">${esc(shortCode(k))}</th>`).join('')+'</tr>';
  keys.forEach((k,i)=>{ct+=`<tr><th title="${esc(nameOf(k))}">${esc(shortCode(k))}</th>`;keys.forEach((k2,j)=>{const c=i===j?1:corrComun(i,j);const nd=(c==null||!isFinite(c));ct+=`<td><div class="cc" style="background:${i===j?'#6b2233':(nd?'#efe7d8':heat(c))};color:${nd?'#a3968a':(i===j||c>.5?'#fff':'#3d3227')}">${nd?'N/D':c.toFixed(2)}</div></td>`;});ct+='</tr>';});
  document.getElementById(containerId+'_c').innerHTML=ct+'</table>';
  buildExtras(containerId,{keys,w,benchIsPf,benchKeys,bw,benchSpec,bl,base,s,e,years,pvArr,bArr,psym});
  res.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ============ Extras: DCA (aportaciones) y test de estrés (crisis) ============ */
/* Offsets (relativos a s) del primer día de cotización de cada mes, hasta `months`. */
function monthOffsets(s,e,months){
  const offs=[];let pm=-1,py=-1;
  for(let t=s;t<=e&&offs.length<months;t++){const d=DATES[t],m=d.getUTCMonth(),y=d.getUTCFullYear();if(m!==pm||y!==py){offs.push(t-s);pm=m;py=y;}}
  return offs;
}
/* Valor de cartera (con conversión de divisa) en una ventana [a..b] de índices globales. */
function pvVentana(weights,base,a,b){
  const px={};for(const k of Object.keys(weights)){const arr=new Array(N).fill(null);for(let t=a;t<=b;t++){const c=CUR[k];arr[t]=(c===base)?PRICES[k][t]:FIN.fxConvert(PRICES[k][t],c,base,FXR?FXR[t]:null);}px[k]=arr;}
  return FIN.portfolioValue(px,weights,a,b,10000);
}
/* Cabecera de panel con botón de cerrar (✕). */
function panelHead(title){return `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
  <div class="section-title" style="font-size:18px">${title}</div>
  <button class="xclose" title="Cerrar" aria-label="Cerrar">✕</button>
</div>`;}
function wireClose(out,close){const x=out.querySelector('.xclose');if(x)x.addEventListener('click',close);}
function buildExtras(containerId,ctx){
  ensureExtraCSS();
  const bar=document.getElementById(containerId+'_xbar'),out=document.getElementById(containerId+'_xout');
  if(!bar||!out)return;
  const mkBtn=txt=>{const b=document.createElement('button');b.className='xbtn';b.textContent=txt;return b;};
  const bDca=mkBtn('DCA · aportaciones'),bStr=mkBtn('Crisis · test de estrés'),bInf=mkBtn('Inflación · valor real');
  bar.appendChild(bDca);bar.appendChild(bStr);bar.appendChild(bInf);
  let shown=null;
  /* El estado activo se marca con la clase .on (el :hover vive en CSS, así el botón
     no se queda blanco al retirar el cursor). */
  const setActive=w=>[[bDca,'dca'],[bStr,'stress'],[bInf,'infl']].forEach(([b,k])=>b.classList.toggle('on',w===k));
  const close=()=>{out.innerHTML='';shown=null;setActive(null);};
  const toggle=(which,render)=>{if(shown===which){close();return;}out.innerHTML='';render(out,ctx,containerId,close);shown=which;setActive(which);out.scrollIntoView({behavior:'smooth',block:'nearest'});};
  bDca.addEventListener('click',()=>toggle('dca',renderDCA));
  bStr.addEventListener('click',()=>toggle('stress',renderStress));
  bInf.addEventListener('click',()=>toggle('infl',renderInflation));
}
/* ---- DCA: pago único vs aportación mensual (mismo total invertido) ---- */
function renderDCA(out,ctx,containerId,close){
  ensureExtraCSS();
  const {base,s,e,pvArr,psym}=ctx;
  const sym=psym||CUR_SYM[base]||'';
  const y0=DATES[s].getUTCFullYear(),yN=DATES[e].getUTCFullYear();
  /* Años de arranque posibles: desde el inicio del backtest hasta dejar ~1 año de recorrido. */
  const anios=[];for(let y=y0;y<=yN-1;y++)anios.push(y);
  if(!anios.length)anios.push(y0);
  const inp='padding:6px 9px;border:1px solid var(--line);border-radius:8px;font-family:inherit;font-size:13px;background:#fff';
  out.innerHTML=`<div class="card" style="margin:4px 0 8px">
    ${panelHead('Pago único vs aportaciones periódicas (DCA)')}
    <div class="hint" style="margin-top:2px">Simulación sobre <b>tu cartera</b>: compara dos formas de invertir <b>el mismo dinero</b> en ella. La referencia comparada no interviene aquí.</div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;margin-top:12px">
      <label style="display:flex;flex-direction:column;gap:5px"><span class="lbl" style="font-size:10px;letter-spacing:1px;color:var(--muted);font-weight:700;text-transform:uppercase">Importe total</span>
        <input id="${containerId}_dcaTot" type="number" value="10000" min="100" step="100" style="${inp};width:110px"></label>
      <label style="display:flex;flex-direction:column;gap:5px"><span class="lbl" style="font-size:10px;letter-spacing:1px;color:var(--muted);font-weight:700;text-transform:uppercase">Duración DCA</span>
        <select id="${containerId}_dcaYr" style="${inp};width:100px">${[1,2,3,5,10].map(v=>`<option value="${v}"${v===3?' selected':''}>${v} ${v===1?'año':'años'}</option>`).join('')}</select></label>
      <label style="display:flex;flex-direction:column;gap:5px"><span class="lbl" style="font-size:10px;letter-spacing:1px;color:var(--muted);font-weight:700;text-transform:uppercase">Empezar en</span>
        <select id="${containerId}_dcaFrom" style="${inp};width:100px">${anios.map(y=>`<option value="${y}">${y}</option>`).join('')}</select></label>
      <button id="${containerId}_dcaGo" class="xbtn on" style="padding:8px 16px">Calcular</button>
    </div>
    <div id="${containerId}_dcaBody" style="margin-top:14px"></div>
  </div>`;
  const calc=()=>{
    const total=Math.max(100,+document.getElementById(containerId+'_dcaTot').value||10000);
    const yr=Math.max(1,Math.min(20,+document.getElementById(containerId+'_dcaYr').value||3));
    const desde=+document.getElementById(containerId+'_dcaFrom').value||y0;
    const months=Math.round(yr*12);
    const body=document.getElementById(containerId+'_dcaBody');
    /* Rebasamos la serie al año elegido: ambas estrategias arrancan ahí. */
    let off=0;for(let i=0;i<pvArr.length;i++){if(DATES[s+i].getUTCFullYear()>=desde){off=i;break;}}
    const pvSub=pvArr.slice(off),sSub=s+off;
    if(pvSub.length<40||!(pvSub[0]>0)){body.innerHTML='<div class="hint">No queda suficiente recorrido desde ese año. Elige un año anterior.</div>';return;}
    const offs=monthOffsets(sSub,e,months),amount=total/months;
    /* Si desde el año elegido no caben todas las aportaciones, NO se calcula: compararía
       una cartera con todo invertido contra otra a medio aportar (parecería una pérdida). */
    if(offs.length<months){
      const maxAnios=Math.floor(offs.length/12);
      body.innerHTML=`<div class="hint" style="background:#fdf6e6;border:1px solid #f0e2b8;border-radius:10px;padding:12px">
        <b>No se puede calcular:</b> empezando en <b>${desde}</b> solo caben <b>${offs.length} meses</b> de aportaciones
        hasta el final del histórico (${DATES[e].getUTCFullYear()}), pero has pedido <b>${months}</b>.<br>
        Compararlas sería engañoso: el DCA aún no habría terminado de invertir.
        Elige una <b>duración de ${maxAnios>=1?'como máximo '+maxAnios+(maxAnios===1?' año':' años'):'menos años'}</b> o un <b>año de inicio anterior</b>.</div>`;
      return;
    }
    const lump=pvSub.map(v=>total*v/pvSub[0]);
    const dca=FIN.dcaValue(pvSub,offs,amount);
    /* Curva DCA CON el efectivo pendiente (al 0%): quien hace DCA tiene el total desde
       el día 1 y lo va invirtiendo; ocultar el efectivo infravaloraba la curva al inicio. */
    /* Escalera de aportaciones: cuánto dinero llevas metido en cada momento. Visual para
       el cliente: los escalones grises son el dinero entrando; la línea dorada, su valor. */
    const aportado=new Array(dca.length);let ptr=0;
    for(let t=0;t<dca.length;t++){while(ptr<offs.length&&offs[ptr]<=t)ptr++;aportado[t]=amount*ptr;}
    const invDca=amount*offs.length,lumpEnd=lump[lump.length-1],dcaEnd=dca[dca.length-1];
    const fmt=v=>sym+Math.round(v).toLocaleString('es');
    const retL=lumpEnd/total-1,retD=dcaEnd/invDca-1;
    const dif0=lumpEnd-dcaEnd,dif=Math.abs(dif0);
    const empate=dif<Math.max(total*0.002,1);       /* diferencia <0,2%: empate práctico */
    const ganaUnico=dif0>0;
    const pocos=offs.length<months;
    const mL=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const per=`${mL[DATES[sSub].getUTCMonth()]} ${DATES[sSub].getUTCFullYear()} → ${mL[DATES[e].getUTCMonth()]} ${DATES[e].getUTCFullYear()}`;
    body.innerHTML=`<div class="period-note" style="margin-bottom:12px">Simulación desde <b>${per}</b> · mismo dinero invertido en ambas: <b>${fmt(total)}</b>.</div>
    <div class="kpis" style="grid-template-columns:repeat(2,1fr);gap:14px;margin:0">
      <div class="kpi" style="${ganaUnico?'border-color:#d9c9b2;background:#fcf9f2':''}"><div class="lbl">Pago único · ${fmt(total)} de golpe</div><div class="v ${retL>=0?'up':'dn'}">${fmt(lumpEnd)}</div><div class="s">rentab. simple ${(retL>=0?'+':'')+(retL*100).toFixed(1)}%${(!empate&&ganaUnico)?' · <b>gana</b>':''}</div></div>
      <div class="kpi" style="${!ganaUnico?'border-color:#cfdfd5;background:#f5faf6':''}"><div class="lbl">DCA · ${fmt(amount)} al mes × ${offs.length}</div><div class="v ${retD>=0?'up':'dn'}">${fmt(dcaEnd)}</div><div class="s">rentab. simple ${(retD>=0?'+':'')+(retD*100).toFixed(1)}%${(!empate&&!ganaUnico)?' · <b>gana</b>':''}</div></div>
    </div>
    <div class="canvas-h" style="height:250px;margin-top:14px"><canvas id="${containerId}_dcaC"></canvas></div>
    <div class="hint" style="margin-top:12px">${empate?`Empezando en <b>${desde}</b> ambas estrategias <b>prácticamente empatan</b> (diferencia ${fmt(dif)}).`:`Empezando en <b>${desde}</b> habría ganado <b>${ganaUnico?'el pago único':'el DCA'}</b> por ${fmt(dif)}.`} La <b>escalera punteada</b> es el dinero que llevas aportado (un escalón por mes); la <b>línea dorada</b>, lo que vale en cada momento — si va por encima de la escalera, ganas. Rentabilidad <b>simple</b> sobre el total aportado, sin comisiones. ${pocos?'<b>Aviso:</b> desde ese año no caben todas las aportaciones; se han hecho '+offs.length+'. ':''}Prueba a cambiar <b>«Empezar en»</b>: si arrancas justo antes de una caída el DCA suele ganar, y si arrancas en un mercado alcista suele ganar el pago único. El DCA <b>reduce el riesgo de entrar en mal momento</b>, pero <b>no garantiza más rentabilidad</b>. <b>Rentabilidad pasada no garantiza resultados futuros.</b></div>`;
    const labels=lump.map((_,i)=>i);
    const yTick=v=>DATES[sSub+v]?DATES[sSub+v].getUTCFullYear():'';
    mkChart(containerId+'_dcaC',{type:'line',data:{labels,datasets:[
      {label:'Pago único',data:lump,borderColor:'#6b2233',borderWidth:1.8,pointRadius:0,tension:.1},
      {label:'DCA · valor de lo invertido',data:dca,borderColor:'#b08a3e',borderWidth:1.8,pointRadius:0,tension:.1},
      {label:'DCA · dinero aportado',data:aportado,borderColor:'#a8998a',borderWidth:1.4,borderDash:[4,3],pointRadius:0,stepped:true}
    ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:true,labels:{font:{size:11},usePointStyle:true,pointStyle:'line'}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${sym}${Math.round(c.raw).toLocaleString('es')}`}}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:8,font:{size:10},color:'#a3968a',callback:yTick}},y:{grid:{color:'#efece5'},ticks:{font:{size:10},color:'#a3968a',callback:v=>(v/1000).toFixed(0)+'k'}}}}});
  };
  document.getElementById(containerId+'_dcaGo').addEventListener('click',calc);
  ['_dcaYr','_dcaFrom'].forEach(id=>document.getElementById(containerId+id).addEventListener('change',calc));
  calc();
  wireClose(out,close);
}
/* ---- Estrés: comportamiento en crisis (caída + recuperación) ---- */
const CRISES=[
  {n:'Crisis financiera 2008',a:'2007-10-09',b:'2009-03-09'},
  {n:'COVID-19',a:'2020-02-19',b:'2020-03-23'},
  {n:'Inflación y tipos 2022',a:'2022-01-03',b:'2022-10-12'}
];
function crisisFila(weights,base,cr){
  const t0=Date.parse(cr.a+'T00:00:00Z');
  if(DATES[0].getTime()>t0)return null;                          // los datos empiezan después
  const keys=Object.keys(weights);
  const cs=iOf(new Date(cr.a+'T00:00:00Z'));
  if(keys.some(k=>(INCEPTION[k]||0)>cs))return null;             // algún activo aún no existía
  const ce=iOf(new Date(cr.b+'T00:00:00Z'));
  const rec=Math.min(N-1,ce+1200,...keys.map(k=>LASTREAL[k]==null?N-1:LASTREAL[k]));
  const pv=pvVentana(weights,base,cs,rec);
  if(!pv.length||!(pv[0]>0))return null;
  const crashLen=ce-cs;
  const mdd=FIN.maxDD(pv.slice(0,crashLen+1));                   // peor caída dentro del tramo
  let trough=0;for(let i=1;i<=crashLen;i++)if(pv[i]<pv[trough])trough=i;
  let recIdx=-1;for(let i=trough;i<pv.length;i++)if(pv[i]>=pv[0]){recIdx=i;break;}
  const meses=recIdx<0?null:Math.round((DATES[cs+recIdx].getTime()-DATES[cs].getTime())/(30.44*864e5));
  return {mdd,meses,recuperado:recIdx>=0};
}
function crisisRango(cr){const mL=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];const A=new Date(cr.a+'T00:00:00Z'),B=new Date(cr.b+'T00:00:00Z');return `${mL[A.getUTCMonth()]} ${A.getUTCFullYear()} – ${mL[B.getUTCMonth()]} ${B.getUTCFullYear()}`;}
/* Inyecta una sola vez el CSS de los extras (botones y tarjetas de crisis).
   Reutiliza el lenguaje visual existente: .kpi/.lbl/.v/.s, .bar, .macro-tag. */
function ensureExtraCSS(){
  if(document.getElementById('extraCSS'))return;
  const st=document.createElement('style');st.id='extraCSS';
  st.textContent=`
  .xbtn{border:1px solid var(--line);background:#fff;border-radius:9px;padding:8px 14px;font-size:12.5px;
        font-weight:600;color:var(--ink);cursor:pointer;transition:background .15s,color .15s,border-color .15s}
  .xbtn:hover{background:#f2f2f0}
  .xbtn.on{background:var(--navy);color:#fff;border-color:var(--navy)}
  .xbtn.on:hover{background:var(--navy2)}
  .xclose{border:1px solid var(--line);background:#fff;border-radius:8px;width:30px;height:30px;font-size:14px;
          line-height:1;color:var(--muted);cursor:pointer;flex-shrink:0;transition:.15s}
  .xclose:hover{background:#f2f2f0;color:var(--ink)}
  .crisis-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(238px,1fr));gap:14px;margin-top:14px}
  .cc .cc-when{font-size:10px;color:#b4b8c2;font-weight:600;letter-spacing:.4px;margin-top:4px}
  .cc .v.dn{color:var(--red)} .cc .v.ok{color:var(--green)}
  .cc-cmp{margin-top:14px;display:flex;flex-direction:column;gap:9px}
  .cc-row{display:grid;grid-template-columns:74px 1fr 46px;align-items:center;gap:9px;font-size:10.5px;color:var(--muted)}
  .cc-row .n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cc-row b{font-family:var(--mono);font-size:10.5px;color:var(--ink);text-align:right}
  .cc-foot{margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
  .cc.off{background:#fafafa;border-style:dashed}
  .cc.off .empty{font-size:11.5px;color:var(--muted);margin-top:16px;line-height:1.45}`;
  document.head.appendChild(st);
}
function renderStress(out,ctx,containerId,close){
  ensureExtraCSS();
  const {w,base,benchIsPf,benchSpec,bl}=ctx;
  const benchW=benchIsPf?ctx.bw:{[benchSpec]:1};
  const pc=v=>'−'+(Math.abs(v)*100).toFixed(1)+'<small>%</small>';
  let cards='',hay=false;
  CRISES.forEach(cr=>{
    const a=crisisFila(w,base,cr),b=crisisFila(benchW,base,cr);
    if(!a){
      cards+=`<div class="kpi cc off">
        <div class="lbl">${esc(cr.n)}</div><div class="cc-when">${crisisRango(cr)}</div>
        <div class="empty">Sin datos: tus activos son posteriores a esta crisis.</div></div>`;
      return;
    }
    hay=true;
    const leve=a.mdd>-0.03;
    /* Barras a escala común (la peor de las dos = 100%) para que se comparen de un vistazo. */
    const peor=Math.max(Math.abs(a.mdd),b?Math.abs(b.mdd):0)||1;
    const wA=Math.max(3,Math.abs(a.mdd)/peor*100),wB=b?Math.max(3,Math.abs(b.mdd)/peor*100):0;
    const rec=leve?'Apenas se resintió':(a.recuperado?`Recuperó en ${a.meses} ${a.meses===1?'mes':'meses'}`:'Aún no había recuperado');
    cards+=`<div class="kpi cc">
      <div class="lbl">${esc(cr.n)}</div>
      <div class="cc-when">${crisisRango(cr)}</div>
      <div class="v ${leve?'ok':'dn'}">${pc(a.mdd)}</div>
      <div class="s">peor caída de tu cartera</div>
      <div class="cc-cmp">
        <div class="cc-row"><span class="n">Tu cartera</span><div class="bar"><i style="width:${wA}%;background:var(--red)"></i></div><b>${pc(a.mdd)}</b></div>
        <div class="cc-row"><span class="n" title="${esc(bl)}">${esc(bl)}</span><div class="bar"><i style="width:${wB}%;background:#c9ccd4"></i></div><b>${b?pc(b.mdd):'N/D'}</b></div>
      </div>
      <div class="cc-foot"><span class="macro-tag ${leve||a.recuperado?'g':'a'}">${rec}</span></div>
    </div>`;
  });
  out.innerHTML=`<div class="card" style="margin:4px 0 8px">
    ${panelHead('Cómo se comportó en las grandes crisis')}
    <div class="crisis-grid">${cards}</div>
    <div class="hint" style="margin-top:14px">La cifra grande es la <b>peor caída</b> que sufrió tu cartera en cada crisis; las barras la comparan con la referencia a la misma escala. Abajo, cuánto tardó en <b>volver a su nivel previo</b>. ${hay?'':'Ninguna de estas crisis cae dentro del histórico de tus activos. '}Mide la <b>resistencia</b>, no predice. <b>Rentabilidad pasada no garantiza resultados futuros.</b></div>
  </div>`;
  wireClose(out,close);
}
/* ---- Inflación: valor nominal vs valor real de la cartera ---- */
function renderInflation(out,ctx,containerId,close){
  const {base,s,e,pvArr,psym}=ctx;
  const sym=psym||CUR_SYM[base]||'';
  const sD=DATES[s],eD=DATES[e];
  const yearFrac=d=>{const y=d.getUTCFullYear();const a=Date.UTC(y,0,1),b=Date.UTC(y+1,0,1);return (d.getTime()-a)/(b-a);};
  /* Cobertura estricta: sin datos de inflación que cubran TODO el periodo -> se dice,
     no se calcula a medias asumiendo 0% en los años sin dato. */
  const rng=inflTabRango(base,sD.getUTCFullYear(),eD.getUTCFullYear());
  if(!rng){out.innerHTML=`<div class="card" style="margin:4px 0 8px">${panelHead('Efecto de la inflación')}<div class="hint" style="margin-top:8px">No hay datos de inflación en ${esc(base)} que cubran todo este periodo (empieza en ${sD.getUTCFullYear()}). Reduce el plazo para ver el efecto de la inflación.</div></div>`;wireClose(out,close);return;}
  const inflTab=rng.tab;
  const sY=sD.getUTCFullYear(),sF=yearFrac(sD);
  const real=pvArr.map((v,i)=>{const d=DATES[s+i];const f=FIN.cumInflationFactor(inflTab,sY,sF,d.getUTCFullYear(),yearFrac(d));return (f!=null&&f>0)?v/f:v;});
  const nomEnd=pvArr[pvArr.length-1],realEnd=real[real.length-1],ini=pvArr[0];
  const nomRet=nomEnd/ini-1,realRet=realEnd/ini-1;
  const fmt=v=>sym+Math.round(v).toLocaleString('es');
  const gana=realRet>=0;
  const veredicto=gana
    ? `Tu dinero <b>ganó poder de compra</b>: descontada la inflación, sigues por encima de lo invertido.`
    : `La <b>inflación se comió toda la rentabilidad</b> y parte del capital: en poder de compra real, acabas por debajo de lo invertido.`;
  out.innerHTML=`<div class="card" style="margin:4px 0 8px">
    ${panelHead('Efecto de la inflación · valor nominal vs real')}
    <div class="kpis" style="grid-template-columns:repeat(2,1fr);gap:12px;margin-top:8px">
      <div class="kpi"><div class="lbl">Valor nominal</div><div class="v ${nomRet>=0?'up':'dn'}">${fmt(nomEnd)}</div><div class="s">rentab. ${(nomRet>=0?'+':'')+(nomRet*100).toFixed(1)}%</div></div>
      <div class="kpi"><div class="lbl">Valor real · poder de compra de ${sD.getUTCFullYear()}</div><div class="v ${realRet>=0?'up':'dn'}">${fmt(realEnd)}</div><div class="s">rentab. real ${(realRet>=0?'+':'')+(realRet*100).toFixed(1)}%</div></div>
    </div>
    <div class="canvas-h" style="height:260px;margin-top:10px"><canvas id="${containerId}_inflC"></canvas></div>
    <div class="hint" style="margin-top:10px">${veredicto} La línea gris es tu cartera <b>real</b> (descontada la inflación ${base==='EUR'?'de la zona euro':'de EE.UU.'}); la distancia entre ambas es lo que <b>resta la inflación</b>. Inflación = medias anuales oficiales (Eurostat/BLS), aproximadas. <b>Rentabilidad pasada no garantiza resultados futuros.</b></div>
  </div>`;
  const labels=pvArr.map((_,i)=>i);
  const yTick=v=>DATES[s+v]?DATES[s+v].getUTCFullYear():'';
  mkChart(containerId+'_inflC',{type:'line',data:{labels,datasets:[
    {label:'Nominal',data:pvArr,borderColor:'#6b2233',borderWidth:1.8,pointRadius:0,tension:.1},
    {label:'Real (descontada inflación)',data:real,borderColor:'#b08a3e',borderWidth:1.8,borderDash:[5,3],pointRadius:0,tension:.1}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:true,labels:{font:{size:11}}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${sym}${Math.round(c.raw).toLocaleString('es')}`}}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:8,font:{size:10},color:'#a3968a',callback:yTick}},y:{grid:{color:'#efece5'},ticks:{font:{size:10},color:'#a3968a',callback:v=>(v/1000).toFixed(0)+'k'}}}}});
  wireClose(out,close);
}

/* ===================== 6) BACKTEST ETFs (UI) ===================== */
const GROUPS=[
  {key:'C',label:'CORE · ÍNDICES Y RENTA FIJA',color:'#6b2233',tk:['SPY','QQQ','ACWI','VT','IWM','DIA','VTI','EFA','EEM','VGK','EWJ','FXI','INDA','EWZ','AGG','SHY','IEF','TLT','LQD','HYG','TIP','BNDX','EMB']},
  {key:'S',label:'SATÉLITE · SECTORES Y TEMÁTICOS',color:'#7d5a3a',tk:['XLK','XLF','XLV','XLE','XLI','XLY','XLP','XLU','XLB','XLC','SMH','KRE','XBI','XOP','XHB','ITA','ARKK','BOTZ','ICLN','TAN','LIT','CIBR','URA','SKYY','FINX','GDX','JETS','DRIV','BLOK','WCLD','IGV','COPX','REMX','XME','NLR']},
  {key:'R',label:'ACTIVOS REALES · MATERIAS PRIMAS, INMOBILIARIO Y CRIPTO',color:'#b08a3e',tk:['GLD','SLV','DBC','USO','UNG','DBA','DBB','VNQ','XLRE','IBIT','ETHA']}
];
let portfolio={},benchmark='ACWI',plazo='all';
function buildCatalog(filter=''){
  const f=filter.trim().toLowerCase(),wrap=document.getElementById('etfCatalog');wrap.innerHTML='';
  GROUPS.forEach(g=>{
    const items=g.tk.filter(tk=>PRICES[tk]&&(!f||tk.toLowerCase().includes(f)||U[tk].n.toLowerCase().includes(f)));
    if(!items.length)return;
    const lbl=document.createElement('div');lbl.className='grouplbl';lbl.innerHTML=`<span class="sq" style="background:${g.color}"></span>${g.label}`;wrap.appendChild(lbl);
    const grid=document.createElement('div');grid.className='etf-grid';
    items.forEach(tk=>{const b=document.createElement('button');b.className='etf'+(portfolio[tk]!=null?' sel':'');b.title=U[tk].n;
      b.innerHTML=`<b>${tk}</b> <span>${U[tk].n}</span><span class="i">ⓘ</span>`;
      b.onclick=()=>{if(portfolio[tk]!=null)delete portfolio[tk];else portfolio[tk]=0;renderPortfolio();buildCatalog(document.getElementById('etfSearch').value);};
      grid.appendChild(b);});
    wrap.appendChild(grid);
  });
}
document.getElementById('etfSearch').oninput=e=>buildCatalog(e.target.value);
function renderPortfolio(){
  const keys=Object.keys(portfolio);document.getElementById('pfCount').textContent=keys.length+(keys.length===1?' activo':' activos');
  const rows=document.getElementById('pfRows');
  rows.innerHTML=keys.map(tk=>`<div class="pf-row"><span class="d" style="background:${colorFor(tk)}"></span><span class="s">${tk}</span><span class="n">${U[tk].n}</span><input type="number" min="0" value="${portfolio[tk]}" data-tk="${tk}"><span style="color:var(--muted)">%</span><button class="x" data-x="${tk}">×</button></div>`).join('')||'<div class="hint">Añade ETFs desde el catálogo.</div>';
  rows.querySelectorAll('input').forEach(i=>i.oninput=()=>{portfolio[i.dataset.tk]=Math.max(0,parseFloat(i.value)||0);updSum('pfSum',portfolio);});
  rows.querySelectorAll('.x').forEach(x=>x.onclick=()=>{delete portfolio[x.dataset.x];renderPortfolio();buildCatalog(document.getElementById('etfSearch').value);});
  updSum('pfSum',portfolio);
}
function updSum(id,obj){const s=Object.values(obj).reduce((a,b)=>a+b,0);const el=document.getElementById(id);const ok=Math.abs(s-100)<.5;el.textContent=s.toFixed(0)+'%';el.style.color=ok?'var(--green)':'var(--red)';el.classList.toggle('bad',!ok&&Object.keys(obj).length>0);const rows=document.getElementById(id.replace('Sum','Rows'));if(rows)rows.classList.toggle('badsum',!ok&&Object.keys(obj).length>0);}
document.getElementById('btnEqual').onclick=()=>{const k=Object.keys(portfolio);if(!k.length)return;const w=Math.round(100/k.length);k.forEach((tk,i)=>portfolio[tk]=i===k.length-1?100-w*(k.length-1):w);renderPortfolio();};
document.getElementById('btnClear').onclick=()=>{portfolio={};renderPortfolio();buildCatalog(document.getElementById('etfSearch').value);document.getElementById('bt-results').innerHTML='';};
document.getElementById('benchSel').onchange=e=>benchmark=e.target.value;
document.getElementById('plazo').querySelectorAll('button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#plazo button').forEach(x=>x.classList.remove('on'));b.classList.add('on');plazo=b.dataset.y;});
document.getElementById('btnCalc').onclick=()=>doBacktest(portfolio,benchmark,plazo,'bt-results',baseBt);
{const sb=document.getElementById('baseSelBt');if(sb){baseBt=sb.value;sb.onchange=e=>{baseBt=e.target.value;doBacktest(portfolio,benchmark,plazo,'bt-results',baseBt);};}}

/* carteras clásicas + info */
const PRESETS={6040:{SPY:60,AGG:40},allw:{SPY:30,TLT:40,IEF:15,GLD:7.5,DBC:7.5},perm:{SPY:25,TLT:25,GLD:25,SHY:25},gb:{SPY:20,IWM:20,TLT:20,SHY:20,GLD:20},bogle:{VTI:60,EFA:20,AGG:20}};
const CLASSIC_INFO={
 6040:{t:"Cartera 60/40",who:"La cartera de referencia clásica",alloc:["60% SPY (acciones)","40% AGG (bonos)"],p:"60% en acciones para crecer y 40% en bonos para amortiguar. <b>Tesis:</b> las acciones aportan la rentabilidad a largo plazo y los bonos suelen subir cuando las acciones caen, suavizando los sustos. Sencilla, barata y sorprendentemente difícil de batir. Es la vara de medir de casi todo lo demás."},
 allw:{t:"All Weather",who:"Ray Dalio · Bridgewater",alloc:["30% acciones","40% bonos largos (TLT)","15% bonos medios (IEF)","7,5% oro","7,5% materias primas"],p:"<b>Tesis:</b> nadie sabe qué hará la economía, así que reparte el riesgo para sobrevivir a los cuatro entornos posibles — crecimiento y recesión, inflación y deflación. Mucho peso en bonos porque son menos volátiles que las acciones. Prioriza estabilidad y caídas suaves por encima de la máxima rentabilidad."},
 perm:{t:"Permanent Portfolio",who:"Harry Browne",alloc:["25% acciones","25% bonos largos","25% oro","25% liquidez (letras)"],p:"Cuatro cuartos iguales, cada uno pensado para brillar en un régimen distinto: acciones en <b>prosperidad</b>, bonos largos en <b>deflación/recesión</b>, oro en <b>inflación</b> y liquidez en <b>crisis de crédito</b>. <b>Tesis:</b> pase lo que pase, algo tira del carro. Muy defensiva, caídas pequeñas, rentabilidad moderada."},
 gb:{t:"Golden Butterfly",who:"Tyler · Portfolio Charts",alloc:["20% acciones grandes","20% small caps (IWM · la original usa small-cap value)","20% bonos largos","20% bonos cortos","20% oro"],p:"Variante del Permanent Portfolio que añade un quinto en <b>small caps</b>. <b>Tesis:</b> sube algo el peso en acciones (sobre todo pequeñas, históricamente más rentables) para mejorar el rendimiento sin renunciar a la resistencia en las caídas. Un punto medio entre crecer y dormir tranquilo."},
 bogle:{t:"Bogleheads · 3 fondos",who:"John Bogle · Vanguard",alloc:["60% acciones EE.UU. (VTI)","20% internacional desarrollado (EFA · la original usa internacional total)","20% bonos (AGG)"],p:"La cartera indexada por excelencia. <b>Tesis:</b> diversifica por todo el mundo al mínimo coste posible, no intentes acertar sectores ni el momento del mercado, y deja que el interés compuesto trabaje durante décadas. La base del inversor pasivo: aburrida y muy eficaz."}
};
document.querySelectorAll('.classic').forEach(b=>b.addEventListener('click',ev=>{
  if(ev.target.classList.contains('i')){openInfo(ev.target.dataset.info);return;}
  portfolio={...PRESETS[b.dataset.preset]};renderPortfolio();buildCatalog(document.getElementById('etfSearch').value);doBacktest(portfolio,benchmark,plazo,'bt-results',baseBt);
}));
function openInfo(key){const c=CLASSIC_INFO[key];const box=document.getElementById('modalBox');
  box.innerHTML=`<h3>${c.t}</h3><div class="who">${c.who}</div><div class="alloc">${c.alloc.map(a=>`<span>${a}</span>`).join('')}</div><p>${c.p}</p>
  <p class="hint" style="margin-top:8px">Réplica educativa con ETFs (proxies) en <b>compra y mantén, sin rebalanceo</b>; la estrategia original rebalancea periódicamente, así que los resultados pueden diferir.</p>`;
  const close=document.createElement('button');close.className='close';close.textContent='Cerrar';close.addEventListener('click',closeInfo);box.insertBefore(close,box.firstChild);
  const use=document.createElement('button');use.className='use';use.textContent='Cargar esta cartera';use.addEventListener('click',()=>usePreset(key));box.appendChild(use);
  document.getElementById('modalBg').classList.add('show');}
window.closeInfo=()=>document.getElementById('modalBg').classList.remove('show');
window.usePreset=k=>{portfolio={...PRESETS[k]};renderPortfolio();buildCatalog(document.getElementById('etfSearch').value);closeInfo();doBacktest(portfolio,benchmark,plazo,'bt-results',baseBt);};
document.getElementById('modalBg').onclick=e=>{if(e.target.id==='modalBg')closeInfo();};

/* Info del panel principal (distribución, tendencia) */
const PANEL_INFO={
 dist:{t:"Días de distribución y acumulación",p:`
   <p>Mide la <b>presión de las manos fuertes</b> (institucionales) sobre el índice — metodología clásica de William O'Neil / IBD.</p>
   <p>Un <b>día de distribución</b> es una sesión en la que el índice <b>cae ≥0,2%</b> con <b>más volumen</b> que el día anterior: señal de que están <b>vendiendo</b>. Un <b>día de acumulación</b> es lo contrario (sube ≥0,2% con más volumen: están <b>comprando</b>).</p>
   <p>Se cuentan en las <b>últimas 25 sesiones</b> (~5 semanas). A partir de <b>~6 días de distribución</b> el mercado suele considerarse "bajo presión".</p>`},
 tend:{t:"Tendencia · media de 50 semanas",p:`
   <p>Compara el precio actual del índice con su <b>media móvil de 50 semanas</b> (~250 sesiones), una de las referencias más usadas de la <b>tendencia de fondo</b> a largo plazo.</p>
   <p><b>▲ sobre</b> = el índice cotiza <b>por encima</b> de su media (tendencia alcista de fondo). <b>▼ bajo</b> = por <b>debajo</b> (tendencia debilitándose).</p>`}
};
function openPanelInfo(k){const c=PANEL_INFO[k];const box=document.getElementById('modalBox');
  box.innerHTML=`<h3>${c.t}</h3>${c.p}`;
  const close=document.createElement('button');close.className='close';close.textContent='Cerrar';close.addEventListener('click',closeInfo);box.insertBefore(close,box.firstChild);
  document.getElementById('modalBg').classList.add('show');}
document.querySelectorAll('.infobtn').forEach(b=>b.onclick=()=>openPanelInfo(b.dataset.info));

/* ===================== 7) BACKTEST FONDOS ===================== */
/* Solo se usan ETFs y fondos del catálogo validado (datos.js). No hay fondos manuales. */
let fportfolio={},fportfolioB={},fbench='SPY',fplazo='all',fcmpMode='bench',fundTarget='A';
function renderFPortfolio(){
  const keys=Object.keys(fportfolio);document.getElementById('fpfCount').textContent=keys.length+(keys.length===1?' activo':' activos');
  const rows=document.getElementById('fpfRows');
  rows.innerHTML=keys.map(k=>`<div class="pf-row"><span class="d" style="background:${colorFor(k)}"></span><span class="s" title="${esc(nameOf(k))}">${esc(nameOf(k).slice(0,10))}</span><span class="n">${esc(nameOf(k))}</span><input type="number" min="0" value="${fportfolio[k]}" data-k="${esc(k)}"><span style="color:var(--muted)">%</span><button class="x" data-x="${esc(k)}">×</button></div>`).join('')||'<div class="hint">Añade fondos del catálogo de la izquierda.</div>';
  rows.querySelectorAll('input').forEach(i=>i.oninput=()=>{fportfolio[i.dataset.k]=Math.max(0,parseFloat(i.value)||0);updSum('fpfSum',fportfolio);});
  rows.querySelectorAll('.x').forEach(x=>x.onclick=()=>{delete fportfolio[x.dataset.x];renderFPortfolio();renderFundCatalog(document.getElementById('fundSearch').value);});
  updSum('fpfSum',fportfolio);
}
function refreshFundBench(){
  const sel=document.getElementById('fbenchSel');const prev=sel.value;
  const idx=[['ACWI','Acciones mundo (ACWI)'],['VT','Mundo total (VT)'],['SPY','S&P 500 (SPY)'],['QQQ','Nasdaq 100 (QQQ)'],['EFA','Mundo exUS (EFA)'],['AGG','Bono agregado (AGG)'],['GLD','Oro (GLD)']].filter(([k])=>PRICES[k]);
  let html='<optgroup label="Índices de referencia">'+idx.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')+'</optgroup>';
  const funds=Object.keys(FUNDS_META).filter(k=>PRICES[k]&&FUNDS_META[k].banco);
  BANK_ORDER.forEach(bank=>{
    const items=funds.filter(k=>FUNDS_META[k].banco===bank);
    if(!items.length)return;
    html+=`<optgroup label="Fondo · ${esc(bank)}">`+items.map(k=>`<option value="${esc(k)}">${esc(nameOf(k))}</option>`).join('')+'</optgroup>';
  });
  sel.innerHTML=html;
  if(prev&&PRICES[prev])sel.value=prev;fbench=sel.value;
}
document.getElementById('fbenchSel').onchange=e=>fbench=e.target.value;
document.getElementById('fbtnEqual').onclick=()=>{const k=Object.keys(fportfolio);if(!k.length)return;const w=Math.round(100/k.length);k.forEach((x,i)=>fportfolio[x]=i===k.length-1?100-w*(k.length-1):w);renderFPortfolio();};
document.getElementById('fbtnClear').onclick=()=>{fportfolio={};renderFPortfolio();renderFundCatalog(document.getElementById('fundSearch').value);document.getElementById('f-results').innerHTML='';};
document.getElementById('fplazo').querySelectorAll('button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#fplazo button').forEach(x=>x.classList.remove('on'));b.classList.add('on');fplazo=b.dataset.y;});
document.getElementById('fbtnCalc').onclick=()=>doBacktest(fportfolio, fcmpMode==='cartera'?{weights:fportfolioB,name:'Cartera B'}:fbench, fplazo,'f-results',baseF);
{const sf=document.getElementById('baseSelF');if(sf){baseF=sf.value;sf.onchange=e=>{baseF=e.target.value;doBacktest(fportfolio, fcmpMode==='cartera'?{weights:fportfolioB,name:'Cartera B'}:fbench, fplazo,'f-results',baseF);};}}
/* Cartera B (comparar cartera vs cartera) */
function renderFPortfolioB(){
  const keys=Object.keys(fportfolioB);document.getElementById('fpfBCount').textContent=keys.length+(keys.length===1?' activo':' activos');
  const rows=document.getElementById('fpfBRows');
  rows.innerHTML=keys.map(k=>`<div class="pf-row"><span class="d" style="background:${colorFor(k)}"></span><span class="s" title="${esc(nameOf(k))}">${esc(nameOf(k).slice(0,10))}</span><span class="n">${esc(nameOf(k))}</span><input type="number" min="0" value="${fportfolioB[k]}" data-k="${esc(k)}"><span style="color:var(--muted)">%</span><button class="x" data-x="${esc(k)}">×</button></div>`).join('')||'<div class="hint">Añade fondos con «Cartera B» seleccionado en el catálogo.</div>';
  rows.querySelectorAll('input').forEach(i=>i.oninput=()=>{fportfolioB[i.dataset.k]=Math.max(0,parseFloat(i.value)||0);updSum('fpfBSum',fportfolioB);});
  rows.querySelectorAll('.x').forEach(x=>x.onclick=()=>{delete fportfolioB[x.dataset.x];renderFPortfolioB();renderFundCatalog(document.getElementById('fundSearch').value);});
  updSum('fpfBSum',fportfolioB);
}
document.getElementById('fbtnBEqual').onclick=()=>{const k=Object.keys(fportfolioB);if(!k.length)return;const w=Math.round(100/k.length);k.forEach((x,i)=>fportfolioB[x]=i===k.length-1?100-w*(k.length-1):w);renderFPortfolioB();};
document.getElementById('fbtnBClear').onclick=()=>{fportfolioB={};renderFPortfolioB();renderFundCatalog(document.getElementById('fundSearch').value);};
document.getElementById('fcmpMode').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#fcmpMode button').forEach(x=>x.classList.remove('on'));b.classList.add('on');fcmpMode=b.dataset.m;
  const cart=fcmpMode==='cartera';
  document.getElementById('carteraBcard').classList.toggle('hidden',!cart);
  document.getElementById('fundTarget').classList.toggle('hidden',!cart);
  document.getElementById('fbenchRow').classList.toggle('hidden',cart);
  if(!cart){fundTarget='A';document.querySelectorAll('#fundTargetSeg button').forEach(x=>x.classList.toggle('on',x.dataset.t==='A'));}
  renderFundCatalog(document.getElementById('fundSearch').value);
});
document.getElementById('fundTargetSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#fundTargetSeg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');fundTarget=b.dataset.t;
  renderFundCatalog(document.getElementById('fundSearch').value);
});

/* Catálogo de fondos, agrupado por banco */
const BANK_ORDER=["CaixaBank","Santander","BBVA","Independientes","Otros"];
const BANK_COLOR={CaixaBank:"#0093d0",Santander:"#ec0000",BBVA:"#1464a5",Independientes:"#5f3dc4",Otros:"#868e96"};
function renderFundCatalog(filter=''){
  const f=filter.trim().toLowerCase(),wrap=document.getElementById('fundCatalog');wrap.textContent='';
  /* §1: se listan desde FUNDS_META (incluye no disponibles, que aparecen desactivados) */
  const funds=Object.keys(FUNDS_META).filter(k=>FUNDS_META[k].banco);
  const active=fundTarget==='B'?fportfolioB:fportfolio;
  let any=false;
  BANK_ORDER.forEach(bank=>{
    const items=funds.filter(k=>FUNDS_META[k].banco===bank&&(!f||nameOf(k).toLowerCase().includes(f)||(FUNDS_META[k].tipo||'').toLowerCase().includes(f)||bank.toLowerCase().includes(f)));
    if(!items.length)return;any=true;
    const lbl=document.createElement('div');lbl.className='grouplbl';
    const sq=document.createElement('span');sq.className='sq';sq.style.background=BANK_COLOR[bank]||'#888';
    lbl.appendChild(sq);lbl.appendChild(document.createTextNode(' '+bank.toUpperCase()+' · '+items.length));
    wrap.appendChild(lbl);
    const grid=document.createElement('div');grid.className='etf-grid';grid.style.gridTemplateColumns='repeat(auto-fill,minmax(235px,1fr))';
    items.forEach(k=>{
      const disp=FUNDS_META[k].status!=='unavailable'&&!!PRICES[k];
      const sel=disp&&active[k]!=null;
      /* §4: nombre/tipo con textContent (nunca innerHTML con datos de datos.js) */
      const b=document.createElement('button');b.className='etf'+(sel?' sel':'')+(disp?'':' etf-off');b.title=nameOf(k);b.style.alignItems='center';b.disabled=!disp;
      const box=document.createElement('div');box.style.flex='1';box.style.minWidth='0';
      const nm=document.createElement('b');nm.style.cssText='font-family:var(--sans);font-weight:600;font-size:13.5px;white-space:normal;line-height:1.3;display:block';nm.style.color=sel?'#fff':'var(--ink)';nm.textContent=nameOf(k);
      const sub=document.createElement('div');sub.style.cssText='font-size:11px;letter-spacing:.2px;margin-top:3px';sub.style.color=disp?(sel?'#e6d3c9':'var(--muted)'):'var(--red)';
      sub.textContent=disp?(FUNDS_META[k].tipo||''):'Temporalmente no disponible';
      box.appendChild(nm);box.appendChild(sub);
      const ic=document.createElement('span');ic.className='i';ic.textContent=disp?(sel?'✓':'+'):'—';
      b.appendChild(box);b.appendChild(ic);
      if(disp)b.onclick=()=>{if(active[k]!=null)delete active[k];else active[k]=0;(fundTarget==='B'?renderFPortfolioB:renderFPortfolio)();renderFundCatalog(document.getElementById('fundSearch').value);};
      grid.appendChild(b);});
    wrap.appendChild(grid);
  });
  if(!any){const h=document.createElement('div');h.className='hint';h.textContent='No hay fondos que coincidan con la búsqueda.';wrap.appendChild(h);}
}
document.getElementById('fundSearch').oninput=e=>renderFundCatalog(e.target.value);

/* ===================== INIT ===================== */
function initApp(){
  renderDashboard();
  buildCatalog();
  portfolio={};renderPortfolio();      /* sin cartera predeterminada: se empieza en blanco */
  renderFPortfolio();renderFPortfolioB();refreshFundBench();renderFundCatalog();
}

/* §5: validación de esquema del JSON antes de aceptarlo como "real". Un JSON manipulado
   NO puede ejecutar código (es datos), y si no cumple el esquema se ignora -> modo demo. */
function datosValidos(D){
  if(!D||typeof D!=='object'||!D.tickers||typeof D.tickers!=='object')return false;
  const ks=Object.keys(D.tickers);if(!ks.length)return false;
  /* Los ETFs imprescindibles (presets y referencias) deben venir con serie y moneda:
     un JSON "válido" pero casi vacío no debe aceptarse como datos reales. */
  const OBLIGATORIOS=['SPY','QQQ','ACWI','VT','AGG'];
  if(!OBLIGATORIOS.every(m=>{const t=D.tickers[m];
    return t&&Array.isArray(t.p)&&t.p.length>=30&&t.currency;}))return false;
  return ks.every(k=>{const t=D.tickers[k];
    return t&&Array.isArray(t.d)&&Array.isArray(t.p)&&t.d.length===t.p.length&&
           t.p.every(x=>x==null||(typeof x==='number'&&isFinite(x)&&x>0));});
}

/* §5: los datos se cargan como JSON PASIVO por fetch (connect-src 'self'), no como <script>. */
function cargarDatos(){
  return fetch('./datos.json',{cache:'no-store'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('HTTP '+r.status)))
    .then(D=>{ if(datosValidos(D)){window.DATOS=D;} else {console.warn('datos.json no cumple el esquema; modo demo.');} })
    .catch(err=>{ console.warn('No se pudo cargar datos.json; modo demo.',err); });
}

cargarDatos().finally(()=>{ bootData(); renderBanners(); initApp();
  window.__APP_READY__=true;   /* señal para tests E2E: datos cargados y UI pintada */
});

/* v2 */
