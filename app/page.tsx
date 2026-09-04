"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─── Tax rate dictionary (value / 10000) ───
const CONSUMPTION_TAX_RATES: Record<string, number> = {"HND":0,"BRN":0,"ZAF":1500,"PER":1800,"NAM":0,"MOZ":0,"JAM":0,"LVA":2101,"EGY":1400,"DEU":1900,"FRA":2000,"BRB":1751,"TUR":2632,"BRA":1445,"UGA":2421,"LUX":1699,"TUN":0,"FIN":2550,"NIC":0,"AGO":0,"HUN":2700,"BIH":1699,"MWI":0,"PLW":0,"DMA":0,"GBR":2035,"TTO":0,"BHR":999,"LTU":2101,"BHS":999,"NPL":1533,"JPN":978,"MNG":0,"SAU":1499,"MNE":0,"KAZ":1600,"SRB":2000,"AFG":0,"XKS":1800,"MEX":1600,"YEM":0,"IND":1801,"CRI":0,"ROU":2100,"GRC":2401,"GRD":0,"TKM":0,"TCD":0,"TCA":0,"MMR":0,"CIV":1800,"CAN":0,"VGB":0,"NOR":2500,"CZE":2100,"JOR":0,"BGR":2000,"LCA":0,"MUS":1500,"ZWE":2159,"NGA":750,"GAB":0,"HKG":0,"LKA":0,"LBY":0,"AUT":2000,"AUS":1000,"MDV":0,"BOL":0,"RWA":0,"LBR":0,"SYC":0,"CYP":1900,"LBN":0,"PRY":0,"CYM":0,"VNM":1111,"TJK":1400,"MLT":1800,"PRT":2299,"IDN":1100,"MDG":0,"KHM":999,"HRV":2502,"BWA":0,"MLI":0,"MDA":2000,"CPV":0,"CHN":0,"CHL":1900,"GHA":2000,"CHE":809,"KGZ":1199,"VEN":0,"UKR":2000,"SGP":899,"PAN":0,"BFA":0,"PAK":0,"LAO":999,"TZA":2041,"NER":0,"SWZ":0,"ITA":2251,"ALB":2000,"ECU":0,"VUT":0,"ATG":0,"RUS":2200,"KOR":1000,"ZMB":1598,"MSR":0,"BMU":0,"DZA":0,"BEN":1800,"KWT":0,"ISR":0,"BEL":2101,"MKD":0,"EST":2401,"ISL":2401,"ESP":2128,"USA":0,"COL":1900,"SWE":2500,"URY":165,"COG":0,"COD":0,"PHL":1200,"BLZ":0,"MRT":0,"THA":700,"SVN":2202,"SVK":2299,"IRQ":0,"BLR":2000,"NLD":2101,"VCT":0,"QAT":0,"IRL":2299,"MAR":0,"KNA":0,"SEN":1800,"BTN":499,"UZB":1199,"ARM":2000,"GNB":0,"ARG":0,"KEN":1626,"ARE":500,"TON":0,"SUR":999,"OMN":499,"GEO":1800,"MAC":0,"POL":2299,"AZE":1800,"TWN":772,"GUY":0,"CMR":1923,"MYS":800,"DOM":0,"FSM":0,"GMB":0,"SLV":0,"AIA":0,"NRU":0,"STP":0,"SLE":0,"SLB":0,"PNG":0,"FJI":0,"NZL":1501,"GTM":0,"DNK":2500};

const COUNTRY_NAMES: Record<string, string> = {
  HND:"Honduras",BRN:"Brunei",ZAF:"South Africa",PER:"Peru",NAM:"Namibia",MOZ:"Mozambique",JAM:"Jamaica",LVA:"Latvia",EGY:"Egypt",DEU:"Germany",
  FRA:"France",BRB:"Barbados",TUR:"Turkey",BRA:"Brazil",UGA:"Uganda",LUX:"Luxembourg",TUN:"Tunisia",FIN:"Finland",NIC:"Nicaragua",AGO:"Angola",
  HUN:"Hungary",BIH:"Bosnia & Herzegovina",MWI:"Malawi",PLW:"Palau",DMA:"Dominica",GBR:"United Kingdom",TTO:"Trinidad & Tobago",BHR:"Bahrain",LTU:"Lithuania",BHS:"Bahamas",
  NPL:"Nepal",JPN:"Japan",MNG:"Mongolia",SAU:"Saudi Arabia",MNE:"Montenegro",KAZ:"Kazakhstan",SRB:"Serbia",AFG:"Afghanistan",XKS:"Kosovo",MEX:"Mexico",
  YEM:"Yemen",IND:"India",CRI:"Costa Rica",ROU:"Romania",GRC:"Greece",GRD:"Grenada",TKM:"Turkmenistan",TCD:"Chad",TCA:"Turks & Caicos",MMR:"Myanmar",
  CIV:"Côte d'Ivoire",CAN:"Canada",VGB:"British Virgin Islands",NOR:"Norway",CZE:"Czechia",JOR:"Jordan",BGR:"Bulgaria",LCA:"Saint Lucia",MUS:"Mauritius",ZWE:"Zimbabwe",
  NGA:"Nigeria",GAB:"Gabon",HKG:"Hong Kong",LKA:"Sri Lanka",LBY:"Libya",AUT:"Austria",AUS:"Australia",MDV:"Maldives",BOL:"Bolivia",RWA:"Rwanda",
  LBR:"Liberia",SYC:"Seychelles",CYP:"Cyprus",LBN:"Lebanon",PRY:"Paraguay",CYM:"Cayman Islands",VNM:"Vietnam",TJK:"Tajikistan",MLT:"Malta",PRT:"Portugal",
  IDN:"Indonesia",MDG:"Madagascar",KHM:"Cambodia",HRV:"Croatia",BWA:"Botswana",MLI:"Mali",MDA:"Moldova",CPV:"Cape Verde",CHN:"China",CHL:"Chile",
  GHA:"Ghana",CHE:"Switzerland",KGZ:"Kyrgyzstan",VEN:"Venezuela",UKR:"Ukraine",SGP:"Singapore",PAN:"Panama",BFA:"Burkina Faso",PAK:"Pakistan",LAO:"Laos",
  TZA:"Tanzania",NER:"Niger",SWZ:"Eswatini",ITA:"Italy",ALB:"Albania",ECU:"Ecuador",VUT:"Vanuatu",ATG:"Antigua & Barbuda",RUS:"Russia",KOR:"South Korea",
  ZMB:"Zambia",MSR:"Montserrat",BMU:"Bermuda",DZA:"Algeria",BEN:"Benin",KWT:"Kuwait",ISR:"Israel",BEL:"Belgium",MKD:"North Macedonia",EST:"Estonia",
  ISL:"Iceland",ESP:"Spain",USA:"United States",COL:"Colombia",SWE:"Sweden",URY:"Uruguay",COG:"Congo (Brazzaville)",COD:"DR Congo",PHL:"Philippines",BLZ:"Belize",
  MRT:"Mauritania",THA:"Thailand",SVN:"Slovenia",SVK:"Slovakia",IRQ:"Iraq",BLR:"Belarus",NLD:"Netherlands",VCT:"Saint Vincent",QAT:"Qatar",IRL:"Ireland",
  MAR:"Morocco",KNA:"Saint Kitts & Nevis",SEN:"Senegal",BTN:"Bhutan",UZB:"Uzbekistan",ARM:"Armenia",GNB:"Guinea-Bissau",ARG:"Argentina",KEN:"Kenya",ARE:"UAE",
  TON:"Tonga",SUR:"Suriname",OMN:"Oman",GEO:"Georgia",MAC:"Macau",POL:"Poland",AZE:"Azerbaijan",TWN:"Taiwan",GUY:"Guyana",CMR:"Cameroon",
  MYS:"Malaysia",DOM:"Dominican Republic",FSM:"Micronesia",GMB:"Gambia",SLV:"El Salvador",AIA:"Anguilla",NRU:"Nauru",STP:"São Tomé & Príncipe",SLE:"Sierra Leone",SLB:"Solomon Islands",
  PNG:"Papua New Guinea",FJI:"Fiji",NZL:"New Zealand",GTM:"Guatemala",DNK:"Denmark",
};

const POPULAR_MARKETS: { code: string; name: string }[] = Object.keys(CONSUMPTION_TAX_RATES)
  .map((code) => ({ code, name: COUNTRY_NAMES[code] ?? code }))
  .sort((a, b) => a.name.localeCompare(b.name));

type Platform = "apple" | "google" | "stripe" | "paypal";
type Entity = "hk" | "non-hk";
type BizModel = "onetime" | "monthly" | "yearly";

interface CountryResult {
  code: string;
  name: string;
  gross: number;
  tax: number;
  commission: number;
  wht: number;
  net: number;
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Blog posts (mirrored on /blog index) ───
const BLOG_POSTS = [
  {
    slug: "apple-small-business-program-guide",
    title: "Apple App Store 30% vs 15%: The Complete Small Business Program Guide",
    date: "Aug 8, 2026",
    readTime: "9 min",
  },
  {
    slug: "google-play-brazil-wht-deep-dive",
    title: "Google Play Brazil's 35% Withholding Tax: A Deep Dive for Foreign Developers",
    date: "Aug 8, 2026",
    readTime: "11 min",
  },
  {
    slug: "stripe-vs-paypal-saas-independent",
    title: "Stripe vs PayPal for SaaS: Which Payment Platform Actually Costs Less?",
    date: "Aug 8, 2026",
    readTime: "10 min",
  },
  {
    slug: "stripe-paypal-integration-guide",
    title: "How to Integrate Stripe & PayPal in a Next.js SaaS: Complete Developer Guide",
    date: "Aug 8, 2026",
    readTime: "13 min",
  },
];

// ─── SVG Icons ───
function IconGlobe() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>);
}
function IconChevron({ open }: { open: boolean }) {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6"/></svg>);
}
function IconCheck() {
  return (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>);
}
function IconAlertTriangle() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
}

// ─── Brand icon: descending revenue waterfall bars ───
function IconWaterfall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4v4h4V4H3z" />
      <path d="M10 8v4h4V8h-4z" />
      <path d="M17 12v4h4v-4h-4z" />
      <path d="M13 20v-4" />
      <path d="M19 16v4" />
    </svg>
  );
}

// ─── Waterfall Chart (horizontal stacked bar) ───
function WaterfallChart({ items }: { items: { label: string; value: number; pct: number; color: string; textColor: string }[] }) {
  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="h-10 w-full rounded-lg overflow-hidden flex">
        {items.map((d) => (
          d.pct > 0 && (
            <div
              key={d.label}
              className="h-full flex items-center justify-center text-xs font-semibold transition-all duration-300 relative group"
              style={{ width: `${d.pct}%`, backgroundColor: d.color }}
            >
              {d.pct > 8 && <span style={{ color: d.textColor }}>{d.pct.toFixed(1)}%</span>}
            </div>
          )
        ))}
      </div>
      {/* Legend rows */}
      <div className="space-y-1.5">
        {items.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-zinc-400 flex-1 truncate">{d.label}</span>
            <span className="tabular-nums text-zinc-200 font-medium shrink-0">${fmt(d.value)}</span>
            <span className="tabular-nums text-zinc-500 w-12 sm:w-16 text-right shrink-0">{d.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ───
export default function Home() {
  const [entity, setEntity] = useState<Entity>("non-hk");
  const [platform, setPlatform] = useState<Platform>("apple");
  const [bizModel, setBizModel] = useState<BizModel>("monthly");
  const [unitPrice, setUnitPrice] = useState(20);
  const [transactions, setTransactions] = useState(1);
  const grossSales = unitPrice * transactions;
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["USA", "JPN"]);
  const [sbpManual, setSbpManual] = useState<boolean | null>(null);
  const [marketsOpen, setMarketsOpen] = useState(false);

  const isAppStore = platform === "apple" || platform === "google";

  const annualized = useMemo(() => {
    if (bizModel === "monthly") return grossSales * 12;
    return grossSales;
  }, [grossSales, bizModel]);

  const sbpDisabled = annualized > 1_000_000;
  const sbpActive = sbpDisabled ? false : sbpManual !== null ? sbpManual : true;

  const toggleMarket = (code: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const results = useMemo(() => {
    const n = selectedMarkets.length || 1;
    const perGross = grossSales / n;
    const perTx = transactions / n;

    return selectedMarkets.map((code): CountryResult => {
      const mkt = POPULAR_MARKETS.find((m) => m.code === code);
      const taxRate = (CONSUMPTION_TAX_RATES[code] ?? 0) / 10000;

      let tax = 0;
      let commission = 0;
      let wht = 0;

      if (platform === "stripe") {
        commission = perGross * 0.029 + perTx * 0.3;
      } else if (platform === "paypal") {
        commission = perGross * 0.0349 + perTx * 0.49;
      } else {
        tax = perGross * taxRate;
        const commBase = perGross - tax;
        commission = commBase * (sbpActive ? 0.15 : 0.3);
        const proceeds = commBase - commission;

        if (code === "TWN") {
          wht = proceeds * 0.03;
        } else if (code === "BRA") {
          if (platform === "google") {
            wht = entity === "hk" ? perGross * 0.35 : perGross * 0.25;
          } else {
            wht = entity === "hk" ? proceeds * 0.25 : proceeds * 0.15;
          }
        }
      }

      return {
        code,
        name: mkt?.name ?? code,
        gross: perGross,
        tax,
        commission,
        wht,
        net: perGross - tax - commission - wht,
      };
    });
  }, [grossSales, transactions, selectedMarkets, platform, entity, sbpActive]);

  const totals = useMemo(() => {
    const t = { gross: 0, tax: 0, commission: 0, wht: 0, net: 0 };
    for (const r of results) {
      t.gross += r.gross;
      t.tax += r.tax;
      t.commission += r.commission;
      t.wht += r.wht;
      t.net += r.net;
    }
    return t;
  }, [results]);

  const margin = totals.gross > 0 ? (totals.net / totals.gross) * 100 : 0;

  const waterfallItems = totals.gross > 0 ? [
    { label: "Net Revenue", value: totals.net, pct: (totals.net / totals.gross) * 100, color: "#34d399", textColor: "#064e3b" },
    { label: "Consumption Tax", value: totals.tax, pct: (totals.tax / totals.gross) * 100, color: "#f87171", textColor: "#450a0a" },
    { label: "Commission", value: totals.commission, pct: (totals.commission / totals.gross) * 100, color: "#fb923c", textColor: "#431407" },
    { label: "Withholding Tax", value: totals.wht, pct: (totals.wht / totals.gross) * 100, color: "#c084fc", textColor: "#3b0764" },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-900 shrink-0">
          <IconWaterfall />
        </div>
        <h1 className="text-sm sm:text-lg font-semibold tracking-tight leading-tight">
          <span className="sm:hidden">Revenue Simulator</span>
          <span className="hidden sm:inline">Global App &amp; SaaS Revenue Simulator</span>
        </h1>
        <span className="ml-auto sm:ml-2 text-[10px] sm:text-xs font-medium bg-teal-500/15 text-teal-400 px-2 sm:px-2.5 py-0.5 rounded-full border border-teal-500/25 shrink-0">v2.0 Pro</span>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-12">
        <section className="grid lg:grid-cols-[420px_1fr] gap-4 sm:gap-6">
          {/* ═══ LEFT: FORM ═══ */}
          <div className="bg-zinc-800/70 border border-zinc-700/50 rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-5 self-start lg:sticky lg:top-8">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Configuration</h2>

            {/* Entity */}
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300">Developer Entity</label>
              <select value={entity} onChange={(e) => setEntity(e.target.value as Entity)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                <option value="hk">Hong Kong (HK)</option>
                <option value="non-hk">Non-Hong Kong</option>
              </select>
            </div>

            {/* Platform */}
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                <option value="apple">Apple App Store</option>
                <option value="google">Google Play</option>
                <option value="stripe">Stripe (Web)</option>
                <option value="paypal">PayPal (Web)</option>
              </select>
            </div>

            {/* Business Model */}
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300">Business Model</label>
              <select value={bizModel} onChange={(e) => setBizModel(e.target.value as BizModel)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                <option value="onetime">One-time Purchase</option>
                <option value="monthly">Subscription — Monthly</option>
                <option value="yearly">Subscription — Yearly</option>
              </select>
            </div>

            {/* Unit Price + Transactions */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Unit Price ($)</label>
                <input type="number" min={0} step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Transactions</label>
                <input type="number" min={1} value={transactions} onChange={(e) => setTransactions(Math.max(1, Number(e.target.value)))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              Gross Sales = <span className="text-zinc-300 tabular-nums">${fmt(grossSales)}</span> ({transactions.toLocaleString()} × ${fmt(unitPrice)})
            </div>

            {/* Target Markets Multi-select */}
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300 flex items-center gap-1.5">
                <IconGlobe /> Target Markets
                <span className="text-zinc-500 text-xs ml-auto">{selectedMarkets.length} selected</span>
              </label>
              <button onClick={() => setMarketsOpen(!marketsOpen)} className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 hover:border-zinc-600 transition-colors">
                <span className="truncate">
                  {selectedMarkets.length === 0 ? "Select markets..." : selectedMarkets.map((c) => POPULAR_MARKETS.find((m) => m.code === c)?.name ?? c).join(", ")}
                </span>
                <IconChevron open={marketsOpen} />
              </button>
              {marketsOpen && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-h-52 overflow-y-auto">
                  <div className="flex gap-2 px-3 py-2 border-b border-zinc-700/50 sticky top-0 bg-zinc-900 z-10">
                    <button
                      onClick={() => setSelectedMarkets(POPULAR_MARKETS.map((m) => m.code))}
                      className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-zinc-600">|</span>
                    <button
                      onClick={() => setSelectedMarkets([])}
                      className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                  {POPULAR_MARKETS.map((m) => {
                    const checked = selectedMarkets.includes(m.code);
                    const rate = (CONSUMPTION_TAX_RATES[m.code] ?? 0) / 100;
                    return (
                      <button key={m.code} onClick={() => toggleMarket(m.code)} className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-zinc-800 transition-colors ${checked ? "text-teal-400" : "text-zinc-300"}`}>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? "bg-teal-500 border-teal-500" : "border-zinc-600"}`}>
                          {checked && <IconCheck />}
                        </span>
                        <span className="text-left flex-1">{m.name}</span>
                        <span className="text-zinc-500 text-xs tabular-nums">{rate > 0 ? `${rate.toFixed(2)}%` : "0%"}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SBP Toggle */}
            {isAppStore && (
              <div className={`rounded-lg border px-4 py-3 transition-colors ${sbpDisabled ? "bg-red-500/5 border-red-500/30" : "bg-zinc-900/60 border-zinc-700/40"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-300">Small Business Program</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {sbpActive ? "15% commission" : "Standard 30%"}
                    </p>
                  </div>
                  <button
                    disabled={sbpDisabled}
                    onClick={() => setSbpManual(sbpManual === null ? false : !sbpManual)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${sbpDisabled ? "bg-zinc-700 cursor-not-allowed opacity-50" : sbpActive ? "bg-teal-500" : "bg-zinc-600"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${sbpActive ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
                {sbpDisabled && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                    <IconAlertTriangle />
                    Annualized revenue exceeds $1M — standard 30% rate applied.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══ RIGHT: DASHBOARD ═══ */}
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "Gross Sales", value: totals.gross, color: "text-zinc-100" },
                { label: "Transactions", value: transactions, color: "text-zinc-100", isCount: true },
                { label: "Consumption Tax", value: totals.tax, color: "text-red-400", prefix: "−" },
                { label: "Commission", value: totals.commission, color: "text-orange-400", prefix: "−" },
                { label: "WHT", value: totals.wht, color: "text-purple-400", prefix: "−" },
                { label: "Net Revenue", value: totals.net, color: "text-emerald-400" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-zinc-800/70 border border-zinc-700/50 rounded-xl p-3 sm:p-4 min-w-0">
                  <p className="text-[11px] sm:text-xs text-zinc-400 mb-1 truncate">{kpi.label}</p>
                  <p className={`text-base sm:text-lg font-bold tabular-nums truncate ${kpi.color}`}>
                    {"isCount" in kpi && kpi.isCount
                      ? kpi.value.toLocaleString()
                      : `${kpi.prefix ?? ""}$${fmt(kpi.value)}`}
                  </p>
                  {kpi.label === "Net Revenue" && (
                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Margin {margin.toFixed(1)}%</p>
                  )}
                  {kpi.label === "Transactions" && (
                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 truncate">Avg ${transactions > 0 ? fmt(grossSales / transactions) : "0.00"}/tx</p>
                  )}
                </div>
              ))}
            </div>

            {/* Waterfall Chart */}
            <div className="bg-zinc-800/70 border border-zinc-700/50 rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Revenue Waterfall</h3>
                <div className="text-[11px] sm:text-xs text-zinc-500">
                  Net Retention <span className="text-emerald-400 font-medium">{margin.toFixed(1)}%</span>
                  <span className="mx-2 text-zinc-700">·</span>
                  Total Leakage <span className="text-red-400 font-medium">{(100 - margin).toFixed(1)}%</span>
                </div>
              </div>
              <WaterfallChart items={waterfallItems} />
            </div>

            {/* Country Detail Table */}
            {results.length > 0 && (
              <div className="bg-zinc-800/70 border border-zinc-700/50 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-700/50">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Country Breakdown</h3>
                </div>
                <div className="overflow-auto max-h-[320px]">
                  <table className="w-full text-xs sm:text-sm border-separate border-spacing-0">
                    <thead className="sticky top-0 z-10">
                      <tr className="text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wider bg-zinc-800">
                        <th className="text-left px-2 sm:px-4 py-2 sm:py-2.5 font-medium bg-zinc-800 border-b border-zinc-700/50">Market</th>
                        <th className="text-right px-2 sm:px-4 py-2 sm:py-2.5 font-medium bg-zinc-800 border-b border-zinc-700/50">Gross</th>
                        <th className="text-right px-2 sm:px-4 py-2 sm:py-2.5 font-medium bg-zinc-800 border-b border-zinc-700/50">Tax</th>
                        <th className="text-right px-2 sm:px-4 py-2 sm:py-2.5 font-medium bg-zinc-800 border-b border-zinc-700/50">Comm.</th>
                        <th className="text-right px-2 sm:px-4 py-2 sm:py-2.5 font-medium bg-zinc-800 border-b border-zinc-700/50">WHT</th>
                        <th className="text-right px-2 sm:px-4 py-2 sm:py-2.5 font-medium bg-zinc-800 border-b border-zinc-700/50">Net</th>
                        <th className="text-right px-2 sm:px-4 py-2 sm:py-2.5 font-medium bg-zinc-800 border-b border-zinc-700/50 hidden sm:table-cell">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r.code} className="hover:bg-zinc-700/20 transition-colors">
                          <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-zinc-200 font-medium border-b border-zinc-700/30 whitespace-nowrap">{r.name} <span className="text-zinc-500 hidden sm:inline">({r.code})</span></td>
                          <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-zinc-200 border-b border-zinc-700/30 whitespace-nowrap">${fmt(r.gross)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-red-400 border-b border-zinc-700/30 whitespace-nowrap">{r.tax > 0 ? `−$${fmt(r.tax)}` : "—"}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-orange-400 border-b border-zinc-700/30 whitespace-nowrap">−${fmt(r.commission)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-purple-400 border-b border-zinc-700/30 whitespace-nowrap">{r.wht > 0 ? `−$${fmt(r.wht)}` : "—"}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-emerald-400 font-medium border-b border-zinc-700/30 whitespace-nowrap">${fmt(r.net)}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-zinc-300 border-b border-zinc-700/30 whitespace-nowrap hidden sm:table-cell">{r.gross > 0 ? `${((r.net / r.gross) * 100).toFixed(1)}%` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="sticky bottom-0 z-10">
                      <tr className="font-semibold">
                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-zinc-200 bg-zinc-900 border-t-2 border-zinc-600 whitespace-nowrap">Total</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-zinc-200 bg-zinc-900 border-t-2 border-zinc-600 whitespace-nowrap">${fmt(totals.gross)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-red-400 bg-zinc-900 border-t-2 border-zinc-600 whitespace-nowrap">{totals.tax > 0 ? `−$${fmt(totals.tax)}` : "—"}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-orange-400 bg-zinc-900 border-t-2 border-zinc-600 whitespace-nowrap">−${fmt(totals.commission)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-purple-400 bg-zinc-900 border-t-2 border-zinc-600 whitespace-nowrap">{totals.wht > 0 ? `−$${fmt(totals.wht)}` : "—"}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-emerald-400 bg-zinc-900 border-t-2 border-zinc-600 whitespace-nowrap">${fmt(totals.net)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-2.5 text-right tabular-nums text-zinc-300 bg-zinc-900 border-t-2 border-zinc-600 whitespace-nowrap hidden sm:table-cell">{margin.toFixed(1)}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══ LATEST BLOG POSTS ═══ */}
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">Latest Guides</h2>
            <Link href="/blog" className="text-sm text-teal-400 hover:text-teal-300 transition-colors shrink-0">View all →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-zinc-800/70 border border-zinc-700/50 rounded-xl p-4 hover:border-teal-500/50 hover:bg-zinc-800/90 transition-all flex flex-col"
              >
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-2">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-teal-300 transition-colors leading-snug flex-1">
                  {post.title}
                </h3>
                <div className="mt-3 text-xs text-teal-400 group-hover:text-teal-300 transition-colors">Read →</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ SEO ARTICLE ═══ */}
        <article className="max-w-4xl mx-auto space-y-5 sm:space-y-6 text-sm sm:text-base text-zinc-300 leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
            Navigating App Store Tax &amp; Withholding Tax (WHT) for Global Developers
          </h2>
          <p>
            For developers distributing software through Apple&apos;s App Store or Google Play, the path from a user&apos;s payment to the developer&apos;s bank account is far more complex than a simple commission deduction. In every jurisdiction where digital goods are sold, a layered system of consumption taxes, platform commissions, and withholding taxes collectively erodes gross revenue — sometimes by more than half. Understanding this full waterfall is essential to making informed decisions about which markets to prioritize, how to structure your legal entity, and whether to pursue the Small Business Program.
          </p>
          <p>
            This simulator models the complete revenue waterfall across dozens of countries, using the actual consumption tax rates that Apple and Google apply in each jurisdiction. By selecting multiple target markets, developers can compare the net revenue impact of selling in, say, Hungary (27% VAT) versus the United States (0% platform-collected consumption tax) — and see exactly how much each layer of taxation costs them in absolute dollars.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 pt-4">
            The Hidden Cost of WHT in Brazil &amp; Taiwan
          </h3>
          <p>
            Brazil imposes some of the most aggressive withholding tax rates on foreign app developers in the world. For developers distributing through Google Play with a Hong Kong entity, Brazil levies a staggering 35% WHT on the full gross revenue — not on the developer&apos;s proceeds after commission, but on the entire sale price including the portion Google retains. This means a developer can lose 35% of gross to WHT plus 3% to ISS (Brazil&apos;s service tax) plus 15% platform commission on the post-tax base, leaving barely 40 cents of every dollar earned. Switching to a non-HK entity reduces the Google Play WHT to 25%, while Apple developers face WHT on proceeds only — 25% for HK entities, 15% for non-HK — making Apple marginally more favorable in this market.
          </p>
          <p>
            Taiwan presents a more moderate but still noteworthy WHT regime. Both Apple and Google withhold 3% of the developer&apos;s proceeds (after commission). While 3% sounds trivial, when stacked on top of Taiwan&apos;s 5% VAT and the platform commission, the cumulative leakage can surprise developers who projected revenue using only the headline commission rate. For developers scaling across APAC, these small percentages compound into significant absolute numbers that directly impact unit economics and payback periods.
          </p>

          <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 pt-4">
            Small Business Program vs. Standard 30%
          </h3>
          <p>
            Both Apple and Google offer reduced commission programs for developers earning under $1 million in annual revenue. Apple&apos;s App Store Small Business Program and Google&apos;s equivalent both cut the commission from 30% to 15% — effectively doubling the developer&apos;s share of each post-tax dollar earned through the platform. The qualification threshold is evaluated on a trailing twelve-month basis, and crossing the $1M mark even briefly resets the rate to 30% for the remainder of the evaluation period.
          </p>
          <p>
            The financial cliff at $1M creates genuine strategic tension. A developer earning $80,000 per month retains the 15% rate and keeps roughly $68,000 after commission (before taxes). Crossing the $1M threshold resets the rate to 30%, dropping the monthly take-home to approximately $56,000 — a $12,000 monthly cliff that persists for the rest of the year. This simulator&apos;s auto-detection mirrors this threshold: when projected annual revenue exceeds $1M, the Small Business Program toggle automatically disables, forcing the 30% standard rate. Developers can use this tool to model scenarios on both sides of the threshold and make data-driven decisions about growth timing, pricing adjustments, or entity restructuring.
          </p>
          <p>
            The interplay between commission rates, consumption taxes, and withholding taxes makes global app distribution a genuinely complex financial optimization problem. A market that looks attractive at the gross revenue level may prove unprofitable once all three layers of deduction are applied — and conversely, a smaller market with favorable tax treatment may deliver superior net margins. This simulator arms developers with the granular, country-level data they need to make these decisions with confidence rather than intuition.
          </p>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 sm:px-6 py-6 text-center text-sm text-zinc-500">
        <p className="text-xs sm:text-sm">&copy; 2026 Global App &amp; SaaS Revenue Simulator. All rights reserved.</p>
        <p className="text-[11px] sm:text-xs text-zinc-600 mt-1 px-2">
          Estimates only — not tax, legal, or financial advice. See <Link href="/disclaimer" className="underline hover:text-zinc-400">Disclaimer</Link>.
        </p>
        <div className="mt-3 flex justify-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm">
          <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
          <Link href="/disclaimer" className="hover:text-zinc-300 transition-colors">Disclaimer</Link>
        </div>
      </footer>
    </div>
  );
}