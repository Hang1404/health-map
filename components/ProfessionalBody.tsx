"use client";
import { useEffect, useMemo, useState } from "react";
import AnatomyScene from "./anatomy/scene";
import { defaultVisible, SYSTEMS, type Atlas, type SystemId } from "./anatomy/anatomy";

type Props = { onRegionSelect: (region: string) => void; selectedRegion: string; resultStatuses: Record<string, string> };
const regionFor = (name: string) => {
  const n = name.toLowerCase();
  if (/brain|eye|ear|head|tongue|jaw/.test(n)) return "head";
  if (/heart|cardiac/.test(n)) return "heart";
  if (/lung|trachea|bronch/.test(n)) return "lungs";
  if (/liver|hepatic|gallbladder/.test(n)) return "liver";
  if (/kidney|renal|ureter|bladder/.test(n)) return "kidneys";
  if (/vertebra|spine|spinal/.test(n)) return "spine";
  if (/knee|patella/.test(n)) return "left-knee";
  if (/stomach|pancreas|spleen|intestin|colon/.test(n)) return "abdomen";
  return "abdomen";
};

export default function ProfessionalBody({ onRegionSelect, selectedRegion, resultStatuses }: Props) {
  const [atlas, setAtlas] = useState<Atlas | null>(null);
  const [visible, setVisible] = useState<SystemId[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [explode, setExplode] = useState(0);
  const [view, setView] = useState<"three-quarter" | "front" | "back" | "side">("three-quarter");
  const [rotate, setRotate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [reset, setReset] = useState(0);
  useEffect(() => { fetch("/models/atlas.json").then(r => r.json()).then((data: Atlas) => { setAtlas(data); setVisible(defaultVisible("male")); }).catch(() => setError("解剖模型加载失败，请刷新页面后重试。")); }, []);
  const state = useMemo(() => ({ explode, visible, selected, isolate: false, view, rotate, reset, inspectorOpen: false }), [explode, visible, selected, view, rotate, reset]);
  const select = (id: string) => { if (!atlas) return; const part = atlas.parts.find(p => p.id === id); if (part) onRegionSelect(regionFor(part.name)); setSelected([id]); };
  const toggle = (id: SystemId) => setVisible(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const markerPositions: Record<string, { left: string; top: string; label: string }> = { head: { left: "50%", top: "17%", label: "头颈部" }, heart: { left: "48%", top: "34%", label: "心脏" }, lungs: { left: "53%", top: "35%", label: "肺部" }, liver: { left: "56%", top: "46%", label: "肝脏" }, kidneys: { left: "49%", top: "51%", label: "肾脏" }, spine: { left: "50%", top: "45%", label: "脊柱" }, abdomen: { left: "50%", top: "49%", label: "腹部" }, "left-knee": { left: "46%", top: "74%", label: "膝关节" } };
  const visibleMarkers = Object.entries(resultStatuses).filter(([, status]) => status === "abnormal" || status === "review").map(([region, status]) => ({ region, status, marker: markerPositions[region] })).filter((item): item is { region: string; status: string; marker: { left: string; top: string; label: string } } => Boolean(item.marker));
  return <div className="professional-atlas relative h-[530px] overflow-hidden rounded-2xl bg-[#edf0ef]">
    {!atlas && !error && <div className="absolute inset-0 z-10 grid place-items-center bg-[#edf0ef]"><div className="text-center"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-coral"/><p className="mt-4 text-sm text-slate-500">正在加载专业解剖图谱 {progress ? `${progress}%` : ""}</p><p className="mt-1 text-xs text-slate-400">首次加载约 30 MB</p></div></div>}
    {error && <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-slate-500">{error}</div>}
    {atlas && <AnatomyScene atlas={atlas} state={state} onSelect={select} onProgress={setProgress} onError={setError}/>} 
    {visibleMarkers.map(({ region, status, marker }) => <button key={region} onClick={() => onRegionSelect(region)} aria-label={`${marker.label}${status === "abnormal" ? "异常" : "需关注"}标记`} className={`absolute z-20 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white shadow-lg ${selectedRegion === region ? "h-12 w-12" : "h-10 w-10"}`} style={{ left: marker.left, top: marker.top, background: status === "abnormal" ? "#E23D32" : "#F0A039" }}><i className="absolute inset-0 animate-ping rounded-full opacity-50" style={{ background: status === "abnormal" ? "#E23D32" : "#F0A039" }}/><span className="relative text-base font-bold text-white">!</span></button>)}
    <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] gap-1 overflow-x-auto rounded-xl border border-white/70 bg-white/90 p-1 shadow-sm backdrop-blur">
      {(["front", "back", "side"] as const).map(v => <button key={v} onClick={() => setView(v)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${view === v ? "bg-ink text-white" : "text-slate-500"}`}>{v === "front" ? "正面" : v === "back" ? "背面" : "侧面"}</button>)}
      <button onClick={() => setRotate(!rotate)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${rotate ? "bg-[#FFF0EA] text-coral" : "text-slate-500"}`}>自动旋转</button>
    </div>
    <div className="absolute bottom-4 left-4 right-4 z-10 rounded-xl border border-white/70 bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between text-xs font-semibold"><span>解剖层级</span><button onClick={() => setReset(reset + 1)} className="text-slate-500">重置视角</button></div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{SYSTEMS.filter(s => ["skeletal","muscular","cardiac","respiratory","digestive","arterial","nervous"].includes(s.id)).map(s => <button key={s.id} onClick={() => toggle(s.id)} className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${visible.includes(s.id) ? "text-white" : "bg-slate-100 text-slate-500"}`} style={visible.includes(s.id) ? { background: s.color } : undefined}>{({skeletal:"骨骼",muscular:"肌肉",cardiac:"心脏",respiratory:"呼吸",digestive:"消化",arterial:"血管",nervous:"神经"} as Record<string,string>)[s.id]}</button>)}</div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1" aria-label="检查结果关联区域">{[{id:"heart",label:"心脏"},{id:"lungs",label:"肺部"},{id:"liver",label:"肝脏"},{id:"kidneys",label:"肾脏"},{id:"spine",label:"脊柱"},{id:"left-knee",label:"膝关节"}].map(r => { const tone = ({normal:"#6FAE8A",review:"#F0A039",abnormal:"#E9644B",none:"#C7CCCE"} as Record<string,string>)[resultStatuses[r.id] || "none"]; return <button key={r.id} onClick={() => onRegionSelect(r.id)} className={`whitespace-nowrap rounded-full border px-2 py-1 text-xs font-semibold ${selectedRegion === r.id ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-slate-600"}`}><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{background:tone}}/>{r.label}</button>})}</div>
      <div className="mt-2 flex items-center gap-2"><span className="whitespace-nowrap text-xs text-slate-500">展开</span><input aria-label="展开解剖结构" className="w-full accent-coral" type="range" min="0" max="100" value={explode * 100} onChange={e => setExplode(Number(e.target.value) / 100)}/></div>
    </div>
  </div>;
}
