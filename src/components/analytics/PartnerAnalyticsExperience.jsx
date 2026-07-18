import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Download, FileText, Info, MapPin, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { demoOrganizations, getOrganizationEntities } from "@/config/workspaceArchitecture";

const VIEWS = [["overview","Overview"],["audience","Audience"],["places","Places"],["campaigns","Campaigns"],["activity","Offers & Events"],["sources","Sources"],["geography","Geography"],["reports","Reports"]];
const RANGES = [["7d","Last 7 days"],["30d","Last 30 days"],["90d","Last 90 days"],["ytd","Year to date"]];
const COMPARISONS = [["previous_period","Previous period"],["previous_year","Previous year"],["none","No comparison"]];
const DISTRICTS = ["Downtown Core","Rainey","Seaholm","Congress","Red River"];

function seed(input, floor, spread) { return floor + ([...String(input)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % spread); }
function format(value) { return new Intl.NumberFormat("en-US", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value); }

function buildFixture(organization) {
  const entities = getOrganizationEntities(organization.id);
  const base = seed(organization.id, 760, 420);
  const opens = base * Math.max(entities.length, 1);
  const metrics = [
    ["Experience opens", opens, 12, "Opening of a published experience."],
    ["Listing views", Math.round(opens*2.84), 9, "A listing detail successfully rendered."],
    ["Saves", Math.round(opens*.42), 18, "An intentional save of a place, offer or event."],
    ["Directions", Math.round(opens*.27), 7, "A directions action initiated."],
    ["Verified visits", Math.round(opens*.19), 5, "A visit confirmed through an approved method."],
    ["Redemptions", Math.round(opens*.11), -2, "An offer validation completed successfully."],
    ["Event RSVPs", Math.round(opens*.15), 11, "A completed RSVP associated with this workspace."],
    ["Repeat engagement", Math.round(opens*.31), 6, "A defined action in separate sessions."],
  ];
  const places = entities.map((entity,index) => ({ id: entity.entity_id, name: entity.display_name, meta: `${entity.entity_type} · ${DISTRICTS[index%DISTRICTS.length]}`, value: Math.round(base*(.72-index*.07)), change: 14-index*5 }));
  return {
    metrics,
    places,
    trend: [44,52,49,61,67,63,72,79,76,88,94,101],
    funnel: [["Discovered",metrics[1][1]],["Opened",opens],["Saved",metrics[2][1]],["Directions",metrics[3][1]],["Visited",Math.round(opens*.23)],["Verified",metrics[4][1]],["Redeemed",metrics[5][1]],["Returned",metrics[7][1]]],
    sources: ["Resident map","QR","Direct","Email","Partner website","Campaign placement"].map((name,index)=>({name,meta:"Attributed entry source",value:Math.round(opens*(.31-index*.035)),change:13-index*4})),
    districts: DISTRICTS.map((name,index)=>({name,meta:"Canonical district",value:Math.round(opens*(.3-index*.034)),change:11-index*3})),
    audience: [["Returning users",38],["Residents",31],["Visitors",19],["Event attendees",12]].map(([name,value])=>({name,meta:"Consented category",value,change:0})),
    motivations: [["Dining",72],["Events",61],["Offers",54],["Walking route",43]].map(([name,value])=>({name,meta:"Survey response strength",value,change:0})),
    campaigns: [{name:"Neighborhood discovery",meta:"Active · Listing discovery",value:Math.round(opens*.18),change:16},{name:"Weekend resident guide",meta:"Complete · Directions",value:Math.round(opens*.12),change:7}],
    activity: [{name:"Resident welcome offer",meta:"Offer · Redemptions",value:Math.round(opens*.08),change:8},{name:"Downtown weekend event",meta:"Event · RSVPs",value:Math.round(opens*.06),change:11}],
  };
}

function Delta({ value }) {
  if (!value) return <span className="dp-pa-delta">Stable</span>;
  const Icon = value > 0 ? TrendingUp : TrendingDown;
  return <span className={`dp-pa-delta ${value > 0 ? "up" : "down"}`}><Icon aria-hidden="true" />{Math.abs(value)}%</span>;
}

function Ranked({ eyebrow, title, items, mapLinks=false }) {
  if (!items.length) return <section className="dp-pa-empty"><strong>No connected places yet.</strong><p>Publish or connect a map listing before place analytics can be calculated.</p></section>;
  return <section className="dp-pa-panel"><header><span>{eyebrow}</span><h2>{title}</h2></header><ol className="dp-pa-ranked">{items.map((item,index)=><li key={item.id||item.name}><b>{String(index+1).padStart(2,"0")}</b><div><strong>{item.name}</strong><small>{item.meta}</small></div><em>{format(item.value)}</em><Delta value={item.change}/>{mapLinks?<Link to={`/map?mode=partner&tab=map&entityId=${encodeURIComponent(item.id)}`} aria-label={`View ${item.name} on map`}><MapPin aria-hidden="true"/></Link>:null}</li>)}</ol></section>;
}

function Metrics({ metrics, comparison }) {
  return <section className="dp-pa-metrics" aria-label="Analytics scorecard">{metrics.map(([label,value,delta,definition])=><article key={label}><div><span>{label}</span><button type="button" title={definition} aria-label={`${label}: ${definition}`}><Info aria-hidden="true"/></button></div><strong>{format(value)}</strong><footer>{comparison === "none" ? <span>No comparison</span> : <Delta value={delta}/>}<span>Demo fixture</span></footer></article>)}</section>;
}

function Trend({ values }) {
  const max=Math.max(...values); const points=values.map((value,index)=>`${index/(values.length-1)*100},${92-value/max*76}`).join(" ");
  return <section className="dp-pa-panel"><header><span>Performance trend</span><h2>Engagement is building across the period.</h2></header><div className="dp-pa-chart" role="img" aria-label="Experience opens trend rising across twelve periods"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={points}/></svg></div><table className="sr-only"><caption>Experience opens trend</caption><tbody>{values.map((value,index)=><tr key={index}><th>Period {index+1}</th><td>{value}</td></tr>)}</tbody></table></section>;
}

function Funnel({ stages }) {
  return <section className="dp-pa-panel"><header><span>Conversion funnel</span><h2>Saves to directions is the clearest drop-off.</h2></header><ol className="dp-pa-funnel">{stages.map(([label,value],index)=>{const previous=index?stages[index-1][1]:value;return <li key={label}><div><strong>{label}</strong><span>{format(value)}</span></div><i><b style={{width:`${Math.max(8,value/stages[0][1]*100)}%`}}/></i><small>{index?`${Math.round(value/previous*100)}% from prior stage`:"Starting audience"}</small></li>})}</ol></section>;
}

function Overview({ data, comparison }) {
  return <><section className="dp-pa-decision"><div><span>Measured finding</span><h2>Engagement increased 12% compared with the selected period.</h2><p>{data.places[0]?.name || "The leading place"} generated the strongest listing activity. Saves grew faster than verified visits.</p></div><div><span>Recommended next action</span><h3>Retarget people who saved but did not visit.</h3><p>Evidence: saves rose 18% while verified visits rose 5%. This is an interpreted opportunity, not confirmed causality.</p><Link to="/partner-workspace/campaigns">Open Campaigns <ArrowRight aria-hidden="true"/></Link></div></section><Metrics metrics={data.metrics} comparison={comparison}/><div className="dp-pa-split"><Trend values={data.trend}/><Funnel stages={data.funnel}/></div><div className="dp-pa-split"><Ranked eyebrow="Top places" title="Places creating the strongest response" items={data.places.slice(0,5)} mapLinks/><Ranked eyebrow="Attribution" title="Where meaningful actions begin" items={data.sources.slice(0,5)}/></div><Ranked eyebrow="Geography" title="Districts with the strongest activity" items={data.districts}/></>;
}

function Records({ eyebrow, title, items, href }) {
  return <section className="dp-pa-panel"><header><span>{eyebrow}</span><h2>{title}</h2></header><div className="dp-pa-records">{items.map(item=><article key={item.name}><div><strong>{item.name}</strong><small>{item.meta}</small></div><em>{format(item.value)} actions</em><Delta value={item.change}/>{href?<Link to={href}>Open</Link>:null}</article>)}</div></section>;
}

function Reports({ onExport }) {
  return <section className="dp-pa-panel"><header><span>Reports</span><h2>Share the current analytical context.</h2></header><div className="dp-pa-reports">{["Monthly performance","Campaign report","Offer & event report","Place report","Source attribution report","Executive summary"].map(name=><article key={name}><FileText aria-hidden="true"/><div><strong>{name}</strong><small>Period, workspace, definitions, comparison, limitations and recommendations.</small></div><button type="button" onClick={onExport}>Export CSV</button></article>)}</div></section>;
}

export function PartnerAnalyticsExperience() {
  const location=useLocation(); const navigate=useNavigate();
  const params=useMemo(()=>new URLSearchParams(location.search),[location.search]);
  const organization=demoOrganizations.find(item=>item.id===params.get("workspace"))||demoOrganizations[0];
  const view=VIEWS.some(([id])=>id===params.get("view"))?params.get("view"):"overview";
  const range=RANGES.some(([id])=>id===params.get("range"))?params.get("range"):"30d";
  const comparison=COMPARISONS.some(([id])=>id===params.get("comparison"))?params.get("comparison"):"previous_period";
  const data=useMemo(()=>buildFixture(organization),[organization]);
  function update(changes){const next=new URLSearchParams(location.search);Object.entries(changes).forEach(([key,value])=>next.set(key,value));next.set("workspace",changes.workspace||organization.id);navigate(`${location.pathname}?${next.toString()}`);}
  function exportCsv(){const rows=[["metric","value","comparison_percent"],...data.metrics.map(([label,value,delta])=>[label,value,delta])];const csv=rows.map(row=>row.map(cell=>`"${String(cell).replaceAll('"','""')}"`).join(",")).join("\n");const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));link.download=`${organization.name.toLowerCase().replaceAll(/[^a-z0-9]+/g,"-")}-${range}-analytics.csv`;link.click();URL.revokeObjectURL(link.href);}
  return <motion.section className="dp-partner-analytics" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
    <header className="dp-pa-header"><div><span>Analytics</span><h1>Understand what people discover, save, visit and act on.</h1><p>Focused measurement, attribution, audience behavior and next actions for {organization.name}.</p></div><div><button type="button" onClick={exportCsv}><Download aria-hidden="true"/>Export CSV</button><Link to="/partner-workspace/reports"><FileText aria-hidden="true"/>Reports</Link></div></header>
    <section className="dp-pa-controls" aria-label="Analytics filters"><label>Workspace<select value={organization.id} onChange={e=>update({workspace:e.target.value})}>{demoOrganizations.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Date range<select value={range} onChange={e=>update({range:e.target.value})}>{RANGES.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Comparison<select value={comparison} onChange={e=>update({comparison:e.target.value})}>{COMPARISONS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><div className="dp-pa-status"><CheckCircle2 aria-hidden="true"/><span><strong>Demo workspace data</strong>Explicit fixture · refreshed now</span></div></section>
    <nav className="dp-pa-tabs" aria-label="Analytics views">{VIEWS.map(([id,label])=><button key={id} type="button" aria-current={view===id?"page":undefined} onClick={()=>update({view:id})}>{label}</button>)}</nav>
    <div className="dp-pa-content">{view==="overview"&&<Overview data={data} comparison={comparison}/>} {view==="audience"&&<div className="dp-pa-split"><Ranked eyebrow="Audience" title="Consented audience composition" items={data.audience}/><Ranked eyebrow="Survey intelligence" title="What motivates engagement" items={data.motivations}/></div>} {view==="places"&&<Ranked eyebrow="Places" title="Compare every connected place" items={data.places} mapLinks/>} {view==="campaigns"&&<Records eyebrow="Campaign comparison" title="Compare outcomes against each objective" items={data.campaigns} href="/partner-workspace/campaigns"/>} {view==="activity"&&<Records eyebrow="Offers & events" title="Different conversions, one activity read" items={data.activity}/>} {view==="sources"&&<Ranked eyebrow="Attribution" title="Entries and meaningful actions by source" items={data.sources}/>} {view==="geography"&&<div className="dp-pa-geography"><div><MapPin aria-hidden="true"/><strong>Canonical partner map</strong><p>No second map provider is introduced.</p><Link to="/map?mode=partner&tab=map&filter=All">Open partner map</Link></div><Ranked eyebrow="Geography" title="District performance" items={data.districts}/></div>} {view==="reports"&&<Reports onExport={exportCsv}/>}</div>
    <aside className="dp-pa-note"><Sparkles aria-hidden="true"/><div><strong>Data limitation</strong><p>This restored frontend shows an explicitly labeled fixture. Production values must come from the canonical backend analytics contract; BASE44 does not create duplicate persistence.</p></div></aside>
  </motion.section>;
}
