/**
 * ============================================================
 * Pomodoro Timer — MJ Cloud Tecnologia
 * ============================================================
 * Copyright (c) 2026 MJ Cloud Tecnologia. Todos os direitos reservados.
 *
 * Este software e seu código-fonte são propriedade exclusiva da
 * MJ Cloud Tecnologia. É expressamente proibido, sem autorização
 * prévia e por escrito da MJ Cloud Tecnologia:
 *
 *   • Copiar, modificar ou distribuir este software;
 *   • Usar o nome, logotipo ou identidade visual da MJ Cloud Tecnologia;
 *   • Utilizar este software para fins comerciais;
 *   • Sub-licenciar, vender ou transferir direitos sobre este software.
 *
 * Visualização do código-fonte é permitida para fins de avaliação
 * e portfólio, mas NÃO concede nenhuma licença de uso, cópia
 * ou redistribuição.
 *
 * Para licenciamento, parcerias ou mais informações:
 * contato@mjcloud.com.br | https://mjcloud.com.br
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO
// ─────────────────────────────────────────────────────────────────────────────
function getAudioCtx(ref) {
  if (!ref.current) ref.current = new (window.AudioContext || window.webkitAudioContext)();
  return ref.current;
}
const SOUNDS = {
  bell: (ctx) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(0.6, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    o.start(); o.stop(ctx.currentTime + 1.2);
  },
  digital: (ctx) => {
    [0, 0.12, 0.24].forEach((t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "square"; o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(1200, ctx.currentTime + t);
      g.gain.setValueAtTime(0.3, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.09);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.1);
    });
  },
  soft: (ctx) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(528, ctx.currentTime);
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    o.start(); o.stop(ctx.currentTime + 1.5);
  },
  none: () => {},
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_MODES = [
  { id: "work",  label: "Trabalho",    minutes: 25, color: "#e05c5c" },
  { id: "short", label: "Pausa Curta", minutes: 5,  color: "#4ecdc4" },
  { id: "long",  label: "Pausa Longa", minutes: 10, color: "#6c8ebf" },
];

// A "step" inside a cycle is { modeId, label, minutes, color }
const DEFAULT_CYCLES = [
  {
    id: "classic",
    name: "Clássico",
    emoji: "🍅",
    steps: [
      { modeId: "work",  label: "Trabalho",    minutes: 25, color: "#e05c5c" },
      { modeId: "short", label: "Pausa Curta", minutes: 5,  color: "#4ecdc4" },
      { modeId: "work",  label: "Trabalho",    minutes: 25, color: "#e05c5c" },
      { modeId: "short", label: "Pausa Curta", minutes: 5,  color: "#4ecdc4" },
      { modeId: "work",  label: "Trabalho",    minutes: 25, color: "#e05c5c" },
      { modeId: "short", label: "Pausa Curta", minutes: 5,  color: "#4ecdc4" },
      { modeId: "work",  label: "Trabalho",    minutes: 25, color: "#e05c5c" },
      { modeId: "long",  label: "Pausa Longa", minutes: 10, color: "#6c8ebf" },
    ],
    onFinish: "ask", // "stop" | "repeat" | "ask"
  },
  {
    id: "sprint",
    name: "Sprint",
    emoji: "⚡",
    steps: [
      { modeId: "work",  label: "Trabalho",    minutes: 50, color: "#e05c5c" },
      { modeId: "long",  label: "Pausa Longa", minutes: 10, color: "#6c8ebf" },
    ],
    onFinish: "ask",
  },
];

const LEVELS = [
  { name: "Iniciante",  xpNeeded: 0,    icon: "🌱" },
  { name: "Focado",     xpNeeded: 200,  icon: "🔥" },
  { name: "Dedicado",   xpNeeded: 500,  icon: "⚡" },
  { name: "Expert",     xpNeeded: 1000, icon: "💎" },
  { name: "Mestre",     xpNeeded: 2000, icon: "👑" },
  { name: "Lendário",   xpNeeded: 4000, icon: "🏆" },
];

const ACHIEVEMENTS = [
  { id: "first",  name: "Primeiro Passo",  desc: "Complete seu primeiro pomodoro",  icon: "🎯", cond: (s) => s.totalPomodoros >= 1 },
  { id: "ten",    name: "Em Chamas",        desc: "Complete 10 pomodoros",            icon: "🔥", cond: (s) => s.totalPomodoros >= 10 },
  { id: "fifty",  name: "Incansável",       desc: "Complete 50 pomodoros",            icon: "💪", cond: (s) => s.totalPomodoros >= 50 },
  { id: "str3",   name: "Consistente",      desc: "3 dias seguidos",                  icon: "📅", cond: (s) => s.streak >= 3 },
  { id: "str7",   name: "Semana Perfeita",  desc: "7 dias seguidos",                  icon: "🗓️", cond: (s) => s.streak >= 7 },
  { id: "2h",     name: "Foco Total",       desc: "2h de trabalho em um dia",         icon: "⏱️", cond: (s) => (s.todayMinutes || 0) >= 120 },
  { id: "cycle1", name: "Ciclista",         desc: "Complete 1 ciclo inteiro",         icon: "🔄", cond: (s) => (s.completedCycles || 0) >= 1 },
  { id: "cycle5", name: "Maratonista",      desc: "Complete 5 ciclos inteiros",       icon: "🏅", cond: (s) => (s.completedCycles || 0) >= 5 },
];

const pad = (n) => String(n).padStart(2, "0");
const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const todayKey = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

function loadStats() { try { return JSON.parse(localStorage.getItem("pomo_stats3") || "{}"); } catch { return {}; } }
function saveStats(s) { try { localStorage.setItem("pomo_stats3", JSON.stringify(s)); } catch {} }
function loadPrefs() { try { return JSON.parse(localStorage.getItem("pomo_prefs3") || "{}"); } catch { return {}; } }
function savePrefs(p) { try { localStorage.setItem("pomo_prefs3", JSON.stringify(p)); } catch {} }
function getLevel(xp) { let l=0; for(let i=LEVELS.length-1;i>=0;i--){if(xp>=LEVELS[i].xpNeeded){l=i;break;}} return l; }

// ─────────────────────────────────────────────────────────────────────────────
// THEMES
// ─────────────────────────────────────────────────────────────────────────────
const DARK = { bg:"#0e0e12", panelBg:"#16161c", cardBg:"#1c1c24", inputBg:"rgba(255,255,255,0.06)", border:"rgba(255,255,255,0.09)", text:"#f0f0f5", muted:"rgba(255,255,255,0.38)", accent:"#e05c5c", tabBorder:"rgba(255,255,255,0.07)", blobOp:0.12 };
const LIGHT = { bg:"#f0ede8", panelBg:"#ffffff", cardBg:"#f8f5f2", inputBg:"rgba(0,0,0,0.06)", border:"rgba(0,0,0,0.14)", text:"#0d0d14", muted:"rgba(0,0,0,0.62)", accent:"#e05c5c", tabBorder:"rgba(0,0,0,0.13)", blobOp:0.07 };

// ─────────────────────────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Btn({ th, onClick, title, children, style = {} }) {
  return (
    <button onClick={onClick} title={title} style={{ background:th.inputBg, border:`1px solid ${th.border}`, borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:th.muted, fontSize:15, flexShrink:0, ...style }}>
      {children}
    </button>
  );
}

function CircleProgress({ progress, color, size = 280 }) {
  const r = size / 2 - 18;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ position:"absolute", top:0, left:0, transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(128,128,128,0.1)" strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={c} strokeDashoffset={c*(1-progress)} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 0.5s ease, stroke 0.4s ease" }} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM MODAL (timer running → switch step)
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmModal({ th, message, onOk, onNo, okLabel = "Confirmar", okColor = "#e05c5c" }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:th.panelBg, border:`1px solid ${th.border}`, borderRadius:20, padding:28, maxWidth:360, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⏸</div>
        <div style={{ fontSize:14, color:th.muted, lineHeight:1.7, marginBottom:22 }} dangerouslySetInnerHTML={{ __html: message }} />
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onNo} style={{ flex:1,padding:"12px",borderRadius:12,border:`1px solid ${th.border}`,background:"transparent",color:th.muted,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif" }}>Cancelar</button>
          <button onClick={onOk} style={{ flex:1,padding:"12px",borderRadius:12,border:"none",background:okColor,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>{okLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CYCLE COMPLETE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function CycleCompleteModal({ th, cycleName, onRepeat, onStop }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(8px)",zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:th.panelBg, border:`1px solid ${th.border}`, borderRadius:22, padding:32, maxWidth:360, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🎉</div>
        <div style={{ fontSize:20, fontWeight:700, color:th.text, fontFamily:"'DM Serif Display',serif", marginBottom:6 }}>Ciclo Completo!</div>
        <div style={{ fontSize:14, color:th.muted, marginBottom:26 }}>Você terminou o ciclo <strong style={{ color:th.text }}>{cycleName}</strong>. O que deseja fazer?</div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onStop} style={{ flex:1,padding:"13px",borderRadius:12,border:`1px solid ${th.border}`,background:"transparent",color:th.muted,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif" }}>Encerrar</button>
          <button onClick={onRepeat} style={{ flex:1,padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#e05c5c,#f4a261)",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>Repetir Ciclo ↺</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CYCLE EDITOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
const EMOJIS = ["🍅","⚡","📚","💼","🎯","🧘","💻","🎨","🏋️","🔬"];
const FINISH_OPTIONS = [
  { value:"ask",    label:"Perguntar ao usuário" },
  { value:"repeat", label:"Repetir automaticamente" },
  { value:"stop",   label:"Parar e notificar" },
];

function CycleEditor({ th, cycle, modes, onSave, onClose }) {
  const [name, setName]       = useState(cycle?.name || "");
  const [emoji, setEmoji]     = useState(cycle?.emoji || "🍅");
  const [steps, setSteps]     = useState(cycle?.steps ? cycle.steps.map(s=>({...s})) : [
    { id:uid(), modeId:"work", label:"Trabalho", minutes:25, color:"#e05c5c" }
  ]);
  const [onFinish, setOnFinish] = useState(cycle?.onFinish || "ask");

  const addStep = (modeId) => {
    const m = modes.find(x=>x.id===modeId) || modes[0];
    setSteps(p => [...p, { id:uid(), modeId:m.id, label:m.label, minutes:m.minutes, color:m.color }]);
  };
  const removeStep = (id) => setSteps(p => p.filter(s=>s.id!==id));
  const moveStep = (id, dir) => {
    setSteps(p => {
      const idx = p.findIndex(s=>s.id===id);
      if ((dir===-1&&idx===0)||(dir===1&&idx===p.length-1)) return p;
      const a=[...p]; [a[idx],a[idx+dir]]=[a[idx+dir],a[idx]]; return a;
    });
  };
  const updateStep = (id, field, val) => setSteps(p=>p.map(s=>s.id===id?{...s,[field]:val}:s));

  const totalMin = steps.reduce((t,s)=>t+Number(s.minutes),0);

  const save = () => {
    if (!name.trim() || steps.length===0) return;
    onSave({ id: cycle?.id || uid(), name:name.trim(), emoji, steps: steps.map(({id,...s})=>({...s,minutes:Math.max(1,Math.min(90,Number(s.minutes)))})), onFinish });
  };

  const inp = { background:th.inputBg, border:`1px solid ${th.border}`, borderRadius:10, padding:"9px 12px", color:th.text, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none" };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(8px)",zIndex:180,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto" }}>
      <div style={{ background:th.panelBg, border:`1px solid ${th.border}`, borderRadius:22, width:"100%", maxWidth:480, maxHeight:"96vh", overflowY:"auto", padding:26 }}>

        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <span style={{ fontSize:17,fontWeight:700,color:th.text,fontFamily:"'DM Serif Display',serif" }}>{cycle ? "Editar Ciclo" : "Novo Ciclo"}</span>
          <button onClick={onClose} style={{ background:th.inputBg,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:th.muted,fontSize:15 }}>✕</button>
        </div>

        {/* Name + Emoji */}
        <label style={{ display:"block",fontSize:10,color:th.muted,letterSpacing:2,marginBottom:7 }}>NOME DO CICLO</label>
        <div style={{ display:"flex",gap:8,marginBottom:18 }}>
          <div style={{ position:"relative" }}>
            <button style={{ ...inp,padding:"9px 12px",cursor:"pointer",fontSize:18,minWidth:46,textAlign:"center",background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:10 }} onClick={()=>{}}>
              {emoji}
            </button>
          </div>
          <input value={name} onChange={e=>setName(e.target.value)} style={{ ...inp,flex:1 }} placeholder="Ex: Sessão de Estudo" />
        </div>

        {/* Emoji picker */}
        <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:20 }}>
          {EMOJIS.map(e=>(
            <button key={e} onClick={()=>setEmoji(e)} style={{ fontSize:20,width:36,height:36,borderRadius:8,border:`1px solid ${emoji===e?th.accent:th.border}`,background:emoji===e?`${th.accent}20`:"transparent",cursor:"pointer" }}>{e}</button>
          ))}
        </div>

        {/* Steps */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <label style={{ fontSize:10,color:th.muted,letterSpacing:2 }}>SEQUÊNCIA ({steps.length} etapas · {totalMin}min total)</label>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:14 }}>
          {steps.map((step, idx) => (
            <div key={step.id} style={{ display:"flex",alignItems:"center",gap:7,background:th.cardBg,borderRadius:12,padding:"10px 12px",border:`1px solid ${th.border}` }}>
              {/* Color dot */}
              <div style={{ width:10,height:10,borderRadius:"50%",background:step.color,flexShrink:0 }} />
              {/* Mode selector */}
              <select value={step.modeId} onChange={e=>{const m=modes.find(x=>x.id===e.target.value);updateStep(step.id,"modeId",m.id);updateStep(step.id,"label",m.label);updateStep(step.id,"color",m.color);updateStep(step.id,"minutes",m.minutes);}} style={{ ...inp,padding:"5px 8px",flex:2,cursor:"pointer" }}>
                {modes.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              {/* Minutes */}
              <input type="number" value={step.minutes} onChange={e=>updateStep(step.id,"minutes",e.target.value)} style={{ ...inp,width:54,textAlign:"center",padding:"5px 8px" }} min={1} max={90} />
              <span style={{ fontSize:10,color:th.muted,flexShrink:0 }}>min</span>
              {/* Move & delete */}
              <button onClick={()=>moveStep(step.id,-1)} disabled={idx===0} style={{ background:"none",border:"none",cursor:idx===0?"default":"pointer",color:idx===0?th.border:th.muted,fontSize:14,padding:"2px 3px" }}>↑</button>
              <button onClick={()=>moveStep(step.id,1)} disabled={idx===steps.length-1} style={{ background:"none",border:"none",cursor:idx===steps.length-1?"default":"pointer",color:idx===steps.length-1?th.border:th.muted,fontSize:14,padding:"2px 3px" }}>↓</button>
              <button onClick={()=>removeStep(step.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#e05c5c",fontSize:15,padding:"2px 4px",opacity:steps.length===1?0.3:1 }} disabled={steps.length===1}>✕</button>
            </div>
          ))}
        </div>

        {/* Add step buttons */}
        <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:20 }}>
          {modes.map(m=>(
            <button key={m.id} onClick={()=>addStep(m.id)} style={{ border:`1px solid ${m.color}55`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:12,background:`${m.color}18`,color:m.color,fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
              + {m.label}
            </button>
          ))}
        </div>

        {/* On finish */}
        <label style={{ display:"block",fontSize:10,color:th.muted,letterSpacing:2,marginBottom:9 }}>AO FINALIZAR O CICLO</label>
        <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:24 }}>
          {FINISH_OPTIONS.map(o=>(
            <button key={o.value} onClick={()=>setOnFinish(o.value)} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:12,border:`1px solid ${onFinish===o.value?th.accent:th.border}`,background:onFinish===o.value?`${th.accent}15`:"transparent",cursor:"pointer",color:onFinish===o.value?th.text:th.muted,fontSize:13,fontFamily:"'DM Sans',sans-serif",textAlign:"left" }}>
              <div style={{ width:16,height:16,borderRadius:"50%",border:`2px solid ${onFinish===o.value?th.accent:th.border}`,background:onFinish===o.value?th.accent:"transparent",flexShrink:0 }} />
              {o.label}
            </button>
          ))}
        </div>

        <button onClick={save} disabled={!name.trim()||steps.length===0} style={{ width:"100%",background:!name.trim()||steps.length===0?"rgba(224,92,92,0.3)":"#e05c5c",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:15,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:!name.trim()?"not-allowed":"pointer" }}>
          Salvar Ciclo
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CYCLE PICKER (sidebar overlay)
// ─────────────────────────────────────────────────────────────────────────────
function CyclePicker({ th, cycles, activeCycleId, modes, onSelect, onEdit, onDelete, onCreate, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",zIndex:160,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:th.panelBg,border:`1px solid ${th.border}`,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"80vh",overflowY:"auto",padding:24,paddingBottom:32 }}>
        <div style={{ width:36,height:4,borderRadius:2,background:th.border,margin:"0 auto 20px" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
          <span style={{ fontSize:17,fontWeight:700,color:th.text,fontFamily:"'DM Serif Display',serif" }}>🔄 Ciclos</span>
          <button onClick={onCreate} style={{ background:"#e05c5c",border:"none",borderRadius:20,padding:"7px 16px",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>+ Novo</button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {cycles.map(cycle => {
            const totalMin = cycle.steps.reduce((t,s)=>t+s.minutes,0);
            const isActive = cycle.id === activeCycleId;
            return (
              <div key={cycle.id} style={{ background:isActive?`${th.accent}15`:th.cardBg, border:`1px solid ${isActive?th.accent:th.border}`, borderRadius:16, padding:"14px 16px", cursor:"pointer" }} onClick={()=>onSelect(cycle.id)}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <span style={{ fontSize:26 }}>{cycle.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ fontSize:15,fontWeight:700,color:th.text }}>{cycle.name}</span>
                      {isActive && <span style={{ fontSize:9,background:th.accent,color:"#fff",borderRadius:99,padding:"2px 7px",letterSpacing:1,fontWeight:700 }}>ATIVO</span>}
                    </div>
                    <div style={{ fontSize:11,color:th.muted,marginTop:3 }}>{cycle.steps.length} etapas · {totalMin} min</div>
                    {/* mini step pills */}
                    <div style={{ display:"flex",gap:4,marginTop:7,flexWrap:"wrap" }}>
                      {cycle.steps.map((s,i)=>(
                        <span key={i} style={{ fontSize:9,borderRadius:99,padding:"2px 7px",background:`${s.color}25`,color:s.color,fontWeight:600 }}>{s.label} {s.minutes}m</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                    <button onClick={e=>{e.stopPropagation();onEdit(cycle);}} style={{ background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:7,width:28,height:28,cursor:"pointer",color:th.muted,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center" }}>✏️</button>
                    {cycle.id!=="classic"&&cycle.id!=="sprint"&&(
                      <button onClick={e=>{e.stopPropagation();onDelete(cycle.id);}} style={{ background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:7,width:28,height:28,cursor:"pointer",color:"#e05c5c",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center" }}>🗑</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
function Settings({ th, modes, setModes, sound, setSound, user, setUser, onClose }) {
  const [lm, setLm]   = useState(modes.map(m=>({...m})));
  const [ls, setLs]   = useState(sound);
  const [ln, setLn]   = useState(user.name);
  const upd = (id,f,v) => setLm(p=>p.map(m=>m.id===id?{...m,[f]:v}:m));
  const save = () => {
    setModes(lm.map(m=>({...m,minutes:Math.max(1,Math.min(90,Number(m.minutes)))})));
    setSound(ls); setUser({name:ln||"Visitante"}); onClose();
  };
  const inp = { background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:10,padding:"9px 12px",color:th.text,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none" };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:th.panelBg,border:`1px solid ${th.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:420,maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <span style={{ fontSize:17,fontWeight:700,color:th.text,fontFamily:"'DM Serif Display',serif" }}>Configurações</span>
          <button onClick={onClose} style={{ background:th.inputBg,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:th.muted,fontSize:15 }}>✕</button>
        </div>
        <label style={{ display:"block",fontSize:10,color:th.muted,letterSpacing:2,marginBottom:7 }}>NOME DO USUÁRIO</label>
        <input value={ln} onChange={e=>setLn(e.target.value)} style={{ ...inp,width:"100%",marginBottom:18 }} placeholder="Seu nome" />
        <label style={{ display:"block",fontSize:10,color:th.muted,letterSpacing:2,marginBottom:9 }}>MODOS BASE</label>
        {lm.map(m=>(
          <div key={m.id} style={{ display:"flex",gap:8,alignItems:"center",marginBottom:9 }}>
            <input value={m.label} onChange={e=>upd(m.id,"label",e.target.value)} style={{ ...inp,flex:2 }} />
            <input type="number" value={m.minutes} onChange={e=>upd(m.id,"minutes",e.target.value)} style={{ ...inp,flex:1,textAlign:"center" }} min={1} max={90} />
            <span style={{ fontSize:10,color:th.muted }}>min</span>
            <input type="color" value={m.color} onChange={e=>upd(m.id,"color",e.target.value)} style={{ width:34,height:34,border:"none",borderRadius:8,cursor:"pointer",background:"none",padding:0 }} />
          </div>
        ))}
        <label style={{ display:"block",fontSize:10,color:th.muted,letterSpacing:2,marginTop:16,marginBottom:9 }}>SOM</label>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:22 }}>
          {Object.keys(SOUNDS).map(s=>(
            <button key={s} onClick={()=>setLs(s)} style={{ border:`1px solid ${ls===s?"transparent":th.border}`,borderRadius:20,padding:"7px 15px",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",background:ls===s?"#e05c5c":"transparent",color:ls===s?"#fff":th.muted,transition:"all 0.2s" }}>
              {s==="none"?"Sem som":s[0].toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={save} style={{ width:"100%",background:"#e05c5c",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:15,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer" }}>Salvar</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BAR CHART
// ─────────────────────────────────────────────────────────────────────────────
function BarChart({ data, th }) {
  const max = Math.max(...data.map(d=>d.value),1);
  return (
    <div style={{ display:"flex",alignItems:"flex-end",gap:5,height:80,paddingTop:4 }}>
      {data.map((d,i)=>(
        <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
          <div style={{ width:"100%",background:th.inputBg,borderRadius:6,height:64,display:"flex",flexDirection:"column",justifyContent:"flex-end",overflow:"hidden" }}>
            <div style={{ background:"#e05c5c",borderRadius:6,transition:"height 0.7s ease",height:`${(d.value/max)*100}%`,opacity:d.value===0?0.15:0.85,minHeight:d.value?2:0 }} />
          </div>
          <span style={{ fontSize:9,color:th.muted,textAlign:"center" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ th, stats, onClose }) {
  const [tab, setTab] = useState("week");
  const xp = stats.xp||0;
  const lvlIdx = getLevel(xp);
  const lvl = LEVELS[lvlIdx];
  const next = lvlIdx < LEVELS.length-1 ? LEVELS[lvlIdx+1] : null;
  const xpInLevel = xp - LEVELS[lvlIdx].xpNeeded;
  const xpNeeded = next ? next.xpNeeded - LEVELS[lvlIdx].xpNeeded : 1;
  const lvlProg = next ? Math.min(xpInLevel/xpNeeded,1) : 1;
  const daily = stats.daily||{};
  const buildDays  = () => Array.from({length:7},(_,i)=>{const dt=new Date();dt.setDate(dt.getDate()-(6-i));const k=dt.toISOString().slice(0,10);return{label:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][dt.getDay()],value:Math.round(daily[k]?.workMinutes||0)};});
  const buildWeeks = () => Array.from({length:4},(_,i)=>{let t=0;for(let j=0;j<7;j++){const dt=new Date();dt.setDate(dt.getDate()-(3-i)*7-j);t+=daily[dt.toISOString().slice(0,10)]?.workMinutes||0;}return{label:`S${i+1}`,value:Math.round(t)};});
  const buildMonths= () => Array.from({length:6},(_,i)=>{const dt=new Date();dt.setMonth(dt.getMonth()-(5-i));const ym=dt.toISOString().slice(0,7);const t=Object.entries(daily).filter(([k])=>k.startsWith(ym)).reduce((s,[,v])=>s+(v.workMinutes||0),0);return{label:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][dt.getMonth()],value:Math.round(t)};});
  const chartData = tab==="day"?buildDays():tab==="week"?buildWeeks():buildMonths();
  const totalMin = stats.totalMinutes||0;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(8px)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto" }}>
      <div style={{ background:th.panelBg,border:`1px solid ${th.border}`,borderRadius:24,width:"100%",maxWidth:520,maxHeight:"96vh",overflowY:"auto",padding:26 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <span style={{ fontSize:18,fontWeight:700,color:th.text,fontFamily:"'DM Serif Display',serif" }}>📊 Dashboard</span>
          <button onClick={onClose} style={{ background:th.inputBg,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:th.muted,fontSize:15 }}>✕</button>
        </div>
        {/* Level */}
        <div style={{ background:th.cardBg,border:`1px solid ${th.border}`,borderRadius:16,padding:20,marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:14 }}>
            <div style={{ fontSize:40 }}>{lvl.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10,color:th.muted,letterSpacing:2,marginBottom:2 }}>NÍVEL {lvlIdx+1}</div>
              <div style={{ fontSize:21,fontWeight:700,color:th.text,fontFamily:"'DM Serif Display',serif",lineHeight:1 }}>{lvl.name}</div>
              <div style={{ fontSize:12,color:th.muted,marginTop:2 }}>{xp} XP{next?` / ${next.xpNeeded} XP total`:""}</div>
            </div>
            {next&&<div style={{ textAlign:"right" }}><div style={{ fontSize:10,color:th.muted,marginBottom:2 }}>Próximo</div><div style={{ fontSize:22 }}>{next.icon}</div><div style={{ fontSize:11,color:th.text,fontWeight:600 }}>{next.name}</div></div>}
          </div>
          {next&&<><div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:th.muted,marginBottom:5 }}><span>{xpInLevel} XP</span><span>{xpNeeded} XP para subir</span></div><div style={{ height:8,background:th.inputBg,borderRadius:99,overflow:"hidden" }}><div style={{ height:"100%",background:"linear-gradient(90deg,#e05c5c,#f4a261)",borderRadius:99,width:`${lvlProg*100}%`,transition:"width 0.8s ease" }} /></div></>}
          {!next&&<div style={{ textAlign:"center",fontSize:12,color:"#f4a261",fontWeight:600,marginTop:4 }}>🏆 Nível Máximo!</div>}
        </div>
        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:14 }}>
          {[{icon:"🍅",value:stats.totalPomodoros||0,label:"Pomodoros"},{icon:"⏱️",value:`${Math.floor(totalMin/60)}h${totalMin%60}m`,label:"Foco total"},{icon:"🔥",value:`${stats.streak||0}d`,label:"Sequência"},{icon:"🔄",value:stats.completedCycles||0,label:"Ciclos"}].map((s,i)=>(
            <div key={i} style={{ background:th.cardBg,border:`1px solid ${th.border}`,borderRadius:14,padding:"12px 8px",textAlign:"center" }}>
              <div style={{ fontSize:20,marginBottom:3 }}>{s.icon}</div>
              <div style={{ fontSize:17,fontWeight:700,color:th.text,fontFamily:"'DM Serif Display',serif" }}>{s.value}</div>
              <div style={{ fontSize:9,color:th.muted,letterSpacing:0.5 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div style={{ background:th.cardBg,border:`1px solid ${th.border}`,borderRadius:16,padding:18,marginBottom:14 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <span style={{ fontSize:13,fontWeight:600,color:th.text }}>{tab==="day"?"Últimos 7 dias":tab==="week"?"Últimas 4 semanas":"Últimos 6 meses"}</span>
            <div style={{ display:"flex",gap:5 }}>{[["day","Dia"],["week","Sem"],["month","Mês"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{ border:`1px solid ${tab===k?"transparent":th.border}`,borderRadius:20,padding:"4px 11px",cursor:"pointer",fontSize:11,background:tab===k?"#e05c5c":"transparent",color:tab===k?"#fff":th.muted,fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s" }}>{l}</button>
            ))}</div>
          </div>
          <BarChart data={chartData} th={th} />
          <div style={{ fontSize:10,color:th.muted,marginTop:6,textAlign:"right" }}>minutos de foco</div>
        </div>
        {/* Levels journey */}
        <div style={{ background:th.cardBg,border:`1px solid ${th.border}`,borderRadius:16,padding:18,marginBottom:14 }}>
          <div style={{ fontSize:13,fontWeight:600,color:th.text,marginBottom:12 }}>Jornada de Níveis</div>
          {LEVELS.map((l,i)=>{const reached=xp>=l.xpNeeded;const isNow=i===lvlIdx;return(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:isNow?`${th.accent}20`:th.inputBg,border:`1px solid ${isNow?th.accent:th.border}`,opacity:reached?1:0.4,marginBottom:6 }}>
              <span style={{ fontSize:20 }}>{l.icon}</span>
              <div style={{ flex:1 }}><span style={{ fontSize:13,fontWeight:600,color:th.text }}>{l.name}</span><span style={{ fontSize:11,color:th.muted,marginLeft:8 }}>{l.xpNeeded} XP</span></div>
              {isNow&&<span style={{ fontSize:9,color:th.accent,fontWeight:700,letterSpacing:1 }}>ATUAL</span>}
              {reached&&!isNow&&<span style={{ fontSize:14,color:"#4ecdc4" }}>✓</span>}
            </div>
          );})}
        </div>
        {/* Achievements */}
        <div style={{ background:th.cardBg,border:`1px solid ${th.border}`,borderRadius:16,padding:18 }}>
          <div style={{ fontSize:13,fontWeight:600,color:th.text,marginBottom:12 }}>Conquistas</div>
          {ACHIEVEMENTS.map(a=>{const done=a.cond(stats);return(
            <div key={a.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:done?`${th.accent}15`:th.inputBg,borderRadius:10,border:`1px solid ${done?th.accent:th.border}`,opacity:done?1:0.5,marginBottom:7 }}>
              <span style={{ fontSize:22 }}>{done?a.icon:"🔒"}</span>
              <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:600,color:th.text }}>{a.name}</div><div style={{ fontSize:11,color:th.muted }}>{a.desc}</div></div>
              {done&&<span style={{ fontSize:11,color:th.accent,fontWeight:700 }}>✓</span>}
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function PomodoroApp() {
  const prefs = loadPrefs();
  const [isDark,   setIsDark]   = useState(prefs.isDark !== false);
  const [modes,    setModes]    = useState(prefs.modes  || DEFAULT_MODES);
  const [sound,    setSound]    = useState(prefs.sound  || "bell");
  const [user,     setUser]     = useState(prefs.user   || { name:"Visitante" });
  const [cycles,   setCycles]   = useState(prefs.cycles || DEFAULT_CYCLES);

  // Free-mode (no cycle) state
  const [freeIdx,   setFreeIdx]   = useState(0);      // which mode is active in free mode
  // Cycle-run state
  const [cycleMode,      setCycleMode]      = useState(false);   // true = running a cycle
  const [activeCycleId,  setActiveCycleId]  = useState("classic");
  const [cycleStepIdx,   setCycleStepIdx]   = useState(0);

  // Unified current step
  const activeCycle = cycles.find(c=>c.id===activeCycleId) || cycles[0];
  const currentStep = cycleMode ? activeCycle.steps[cycleStepIdx] : modes[freeIdx];

  // Timer
  const [seconds,  setSeconds]  = useState(currentStep.minutes * 60);
  const [running,  setRunning]  = useState(false);

  // UI overlays
  const [showSettings,   setShowSettings]   = useState(false);
  const [showDash,       setShowDash]       = useState(false);
  const [showCyclePicker,setShowCyclePicker]= useState(false);
  const [editingCycle,   setEditingCycle]   = useState(null);  // cycle obj or "new"
  const [confirmData,    setConfirmData]    = useState(null);  // {message, onOk, okLabel, okColor}
  const [cycleComplete,  setCycleComplete]  = useState(false);

  const [pulse,    setPulse]    = useState(false);
  const [stats,    setStats]    = useState(loadStats);
  const [xpAnim,   setXpAnim]   = useState(null);

  const audioRef = useRef(null);
  const intRef   = useRef(null);
  const th = isDark ? DARK : LIGHT;

  useEffect(() => { savePrefs({ isDark, modes, sound, user, cycles }); }, [isDark, modes, sound, user, cycles]);

  const playSound = useCallback(() => {
    try { SOUNDS[sound]?.(getAudioCtx(audioRef)); } catch {}
  }, [sound]);

  const addPomodoro = useCallback((stepModeId, stepMinutes) => {
    const isWork = stepModeId === "work";
    const xpGain = isWork ? 30 : 10;
    const today = todayKey();
    setStats(prev => {
      const daily = { ...(prev.daily||{}) };
      const d = daily[today] || { workMinutes:0, pomodoros:0 };
      daily[today] = { workMinutes: d.workMinutes + (isWork?stepMinutes:0), pomodoros: d.pomodoros + (isWork?1:0) };
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
      const yk = yesterday.toISOString().slice(0,10);
      const hadYesterday = (daily[yk]?.pomodoros||0)>0;
      const todayPoms = daily[today].pomodoros;
      const streak = isWork ? (hadYesterday||todayPoms>1?(prev.streak||0)+1:1) : (prev.streak||0);
      const next = { ...prev, xp:(prev.xp||0)+xpGain, totalPomodoros:(prev.totalPomodoros||0)+(isWork?1:0), totalMinutes:(prev.totalMinutes||0)+(isWork?stepMinutes:0), todayMinutes:daily[today].workMinutes, streak, daily };
      saveStats(next);
      return next;
    });
    setXpAnim(`+${xpGain} XP`);
    setTimeout(()=>setXpAnim(null), 1800);
  }, []);

  const addCycle = useCallback(() => {
    setStats(prev => {
      const next = { ...prev, completedCycles:(prev.completedCycles||0)+1 };
      saveStats(next); return next;
    });
  }, []);

  // ── Advance to next step in cycle ──────────────────────────────────────────
  const advanceCycle = useCallback((nextStepIdx) => {
    if (nextStepIdx >= activeCycle.steps.length) {
      // Cycle finished
      addCycle();
      playSound();
      if (activeCycle.onFinish === "repeat") {
        setCycleStepIdx(0);
        const firstStep = activeCycle.steps[0];
        setSeconds(firstStep.minutes * 60);
        setRunning(true);
      } else if (activeCycle.onFinish === "stop") {
        setCycleMode(false);
        setCycleStepIdx(0);
        setSeconds(modes[freeIdx].minutes * 60);
        setRunning(false);
      } else {
        // ask
        setCycleComplete(true);
        setRunning(false);
      }
    } else {
      setCycleStepIdx(nextStepIdx);
      const step = activeCycle.steps[nextStepIdx];
      setSeconds(step.minutes * 60);
      setRunning(true);
    }
  }, [activeCycle, addCycle, playSound, modes, freeIdx]);

  // ── Timer countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      intRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intRef.current);
            // snapshot step for callback
            const stepModeId  = cycleMode ? activeCycle.steps[cycleStepIdx].modeId  : modes[freeIdx].id;
            const stepMinutes = cycleMode ? activeCycle.steps[cycleStepIdx].minutes : modes[freeIdx].minutes;
            setPulse(true); setTimeout(()=>setPulse(false), 500);
            addPomodoro(stepModeId, stepMinutes);
            playSound();
            if (cycleMode) {
              advanceCycle(cycleStepIdx + 1);
            } else {
              setRunning(false);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(intRef.current);
    return () => clearInterval(intRef.current);
  }, [running, cycleMode, cycleStepIdx, activeCycle, modes, freeIdx, addPomodoro, playSound, advanceCycle]);

  useEffect(() => {
    const label = cycleMode ? activeCycle.steps[cycleStepIdx]?.label : modes[freeIdx]?.label;
    document.title = running ? `${fmt(seconds)} — ${label||""}` : "Pomodoro";
  }, [seconds, running]);

  // ── Switch free mode ───────────────────────────────────────────────────────
  const switchFreeMode = (idx) => {
    if (cycleMode) {
      setConfirmData({
        message: `Você está em um ciclo ativo. Deseja <strong>sair do ciclo</strong> e usar o modo livre?`,
        okLabel: "Sair do ciclo",
        okColor: "#e05c5c",
        onOk: () => {
          setCycleMode(false); setRunning(false);
          setFreeIdx(idx); setSeconds(modes[idx].minutes*60); setConfirmData(null);
        },
      }); return;
    }
    if (running) {
      setConfirmData({
        message: `Timer em andamento. Deseja pausar e trocar para <strong style="color:${modes[idx].color}">${modes[idx].label}</strong>?`,
        okLabel: "Trocar",
        okColor: modes[idx].color,
        onOk: () => { setRunning(false); setFreeIdx(idx); setSeconds(modes[idx].minutes*60); setConfirmData(null); },
      }); return;
    }
    setFreeIdx(idx);
    setSeconds(modes[idx].minutes*60);
  };

  // ── Start a cycle ──────────────────────────────────────────────────────────
  const startCycle = (cycleId) => {
    const doStart = () => {
      const c = cycles.find(x=>x.id===cycleId);
      setCycleMode(true); setActiveCycleId(cycleId);
      setCycleStepIdx(0); setSeconds(c.steps[0].minutes*60);
      setRunning(true); setShowCyclePicker(false);
    };
    if (running) {
      setConfirmData({
        message: "Deseja parar o timer atual e <strong>iniciar o ciclo</strong>?",
        okLabel: "Iniciar ciclo",
        okColor: "#e05c5c",
        onOk: () => { setConfirmData(null); doStart(); },
      });
    } else doStart();
  };

  // ── Skip current step ──────────────────────────────────────────────────────
  const skipStep = () => {
    if (!cycleMode) return;
    setConfirmData({
      message: `Deseja <strong>pular esta etapa</strong> e avançar para a próxima?`,
      okLabel: "Pular",
      okColor: "#6c8ebf",
      onOk: () => { setRunning(false); setConfirmData(null); advanceCycle(cycleStepIdx+1); },
    });
  };

  const toggle = () => {
    if (seconds === 0) { setSeconds(currentStep.minutes*60); setRunning(true); }
    else setRunning(r=>!r);
  };
  const resetTimer = () => { setSeconds(currentStep.minutes*60); setRunning(false); };

  const total = currentStep.minutes * 60;
  const prog  = 1 - seconds / total;
  const lvlIcon = LEVELS[getLevel(stats.xp||0)].icon;

  // Cycle progress bar
  const cycleProgressPct = cycleMode ? Math.round(((cycleStepIdx) / activeCycle.steps.length) * 100) : 0;

  return (
    <div style={{ minHeight:"100vh", background:th.bg, display:"flex", flexDirection:"column", alignItems:"center", fontFamily:"'DM Sans',sans-serif", position:"relative", overflow:"hidden", paddingBottom:60, transition:"background 0.3s" }}>

      {/* Ambient blobs */}
      <div style={{ position:"absolute",width:450,height:450,borderRadius:"50%",background:currentStep.color,top:-140,left:-120,opacity:th.blobOp,filter:"blur(100px)",pointerEvents:"none",transition:"background 0.4s" }} />
      <div style={{ position:"absolute",width:320,height:320,borderRadius:"50%",background:currentStep.color,bottom:-80,right:-90,opacity:th.blobOp*0.6,filter:"blur(80px)",pointerEvents:"none",transition:"background 0.4s" }} />

      {/* Header */}
      <header style={{ width:"100%",maxWidth:500,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"22px 20px 0",position:"relative",zIndex:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:18,letterSpacing:2.5,fontWeight:700,color:th.text,fontFamily:"'DM Serif Display',serif" }}>POMO</span>
          <span style={{ fontSize:9,color:currentStep.color,letterSpacing:3.5,marginTop:1,fontWeight:600 }}>TIMER</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
          <div style={{ display:"flex",alignItems:"center",gap:7,background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:24,padding:"5px 13px 5px 5px" }}>
            <div style={{ width:26,height:26,borderRadius:"50%",background:currentStep.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0 }}>{user.name.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize:12,color:th.text,fontWeight:500 }}>{user.name}</span>
            <span style={{ fontSize:13 }}>{lvlIcon}</span>
          </div>
          <Btn th={th} onClick={()=>setIsDark(d=>!d)} title="Tema">{isDark?"☀️":"🌙"}</Btn>
          <Btn th={th} onClick={()=>setShowDash(true)} title="Dashboard">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
          </Btn>
          <Btn th={th} onClick={()=>setShowSettings(true)} title="Configurações">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </Btn>
        </div>
      </header>

      {/* ── CYCLE ACTIVE BANNER ───────────────────────────────────────────── */}
      {cycleMode && (
        <div style={{ width:"100%",maxWidth:500,padding:"14px 20px 0",position:"relative",zIndex:10 }}>
          <div style={{ background:th.cardBg,border:`1px solid ${th.border}`,borderRadius:16,padding:"12px 16px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:18 }}>{activeCycle.emoji}</span>
                <div>
                  <div style={{ fontSize:13,fontWeight:700,color:th.text }}>{activeCycle.name}</div>
                  <div style={{ fontSize:10,color:th.muted }}>Etapa {cycleStepIdx+1} de {activeCycle.steps.length}</div>
                </div>
              </div>
              <button onClick={skipStep} title="Pular etapa" style={{ background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",color:th.muted,fontSize:11,fontFamily:"'DM Sans',sans-serif" }}>Pular ›</button>
            </div>
            {/* Step pills */}
            <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:8 }}>
              {activeCycle.steps.map((s,i)=>(
                <div key={i} style={{ fontSize:9,borderRadius:99,padding:"3px 8px",background:i<cycleStepIdx?`${s.color}30`:i===cycleStepIdx?s.color:`${s.color}15`,color:i===cycleStepIdx?"#fff":s.color,fontWeight:600,border:`1px solid ${s.color}40`,transition:"background 0.3s" }}>
                  {i===cycleStepIdx?"▶ ":""}{s.label} {s.minutes}m
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div style={{ height:4,background:th.inputBg,borderRadius:99,overflow:"hidden" }}>
              <div style={{ height:"100%",background:`linear-gradient(90deg,${activeCycle.steps[0]?.color||"#e05c5c"},${activeCycle.steps[activeCycle.steps.length-1]?.color||"#4ecdc4"})`,borderRadius:99,width:`${cycleProgressPct}%`,transition:"width 0.5s ease" }} />
            </div>
          </div>
        </div>
      )}

      {/* ── FREE MODE TABS + CYCLE BUTTON ─────────────────────────────────── */}
      {!cycleMode && (
        <div style={{ display:"flex",alignItems:"center",marginTop:22,borderBottom:`1px solid ${th.tabBorder}`,width:"100%",maxWidth:500,padding:"0 20px" }}>
          {modes.map((m,i)=>(
            <button key={m.id} onClick={()=>switchFreeMode(i)} style={{ background:"none",border:"none",padding:"9px 16px",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:0.4,color:freeIdx===i&&!cycleMode?m.color:th.muted,borderBottom:freeIdx===i&&!cycleMode?`2px solid ${m.color}`:"2px solid transparent",position:"relative",top:1,transition:"color 0.2s" }}>
              {m.label}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <button onClick={()=>setShowCyclePicker(true)} style={{ display:"flex",alignItems:"center",gap:6,background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",color:th.muted,fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:600,marginBottom:1,flexShrink:0 }}>
            🔄 Ciclos
          </button>
        </div>
      )}
      {cycleMode && (
        <div style={{ marginTop:14,display:"flex",gap:10,alignItems:"center" }}>
          <button onClick={()=>setShowCyclePicker(true)} style={{ display:"flex",alignItems:"center",gap:6,background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",color:th.muted,fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>
            🔄 Trocar ciclo
          </button>
          <button onClick={()=>{setConfirmData({message:"Deseja <strong>sair do ciclo</strong> e voltar ao modo livre?",okLabel:"Sair",okColor:"#e05c5c",onOk:()=>{setCycleMode(false);setRunning(false);setCycleStepIdx(0);setSeconds(modes[freeIdx].minutes*60);setConfirmData(null);}});}} style={{ display:"flex",alignItems:"center",gap:5,background:"transparent",border:`1px solid ${th.border}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",color:th.muted,fontSize:12,fontFamily:"'DM Sans',sans-serif" }}>
            ✕ Sair do ciclo
          </button>
        </div>
      )}

      {/* ── TIMER CIRCLE ──────────────────────────────────────────────────── */}
      <div style={{ position:"relative",width:280,height:280,marginTop:28,display:"flex",alignItems:"center",justifyContent:"center",transform:pulse?"scale(1.05)":"scale(1)",transition:"transform 0.2s ease" }}>
        <CircleProgress progress={prog} color={currentStep.color} size={280} />
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
          <div style={{ fontSize:64,fontFamily:"'DM Serif Display',serif",color:th.text,lineHeight:1,letterSpacing:-2 }}>{fmt(seconds)}</div>
          <div style={{ fontSize:11,color:th.muted,marginTop:7,letterSpacing:2.5 }}>{currentStep.label.toUpperCase()}</div>
          {running && <div style={{ width:5,height:5,borderRadius:"50%",background:currentStep.color,marginTop:9,animation:"pulseAnim 1.2s infinite" }} />}
        </div>
      </div>

      {/* XP float */}
      {xpAnim && (
        <div style={{ position:"absolute",top:"52%",left:"50%",transform:"translateX(-50%)",fontSize:17,fontWeight:700,color:"#f4a261",pointerEvents:"none",zIndex:50,animation:"floatUp 1.8s ease forwards" }}>
          {xpAnim}
        </div>
      )}

      {/* Controls */}
      <div style={{ display:"flex",gap:14,alignItems:"center",marginTop:28 }}>
        <button onClick={resetTimer} style={{ width:46,height:46,borderRadius:"50%",border:`1px solid ${th.border}`,background:th.inputBg,cursor:"pointer",fontSize:19,color:th.muted,display:"flex",alignItems:"center",justifyContent:"center" }}>↺</button>
        <button onClick={toggle} style={{ width:70,height:70,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:24,background:currentStep.color,boxShadow:`0 0 36px ${currentStep.color}55`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",transition:"box-shadow 0.3s" }}>
          {running?"⏸":"▶"}
        </button>
        <div style={{ width:46 }} />
      </div>

      {/* Dots */}
      <div style={{ marginTop:20,display:"flex",gap:7,alignItems:"center" }}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{ width:9,height:9,borderRadius:"50%",background:i<(stats.totalPomodoros||0)%4?currentStep.color:th.inputBg,border:`1px solid ${th.border}`,transition:"background 0.3s" }} />
        ))}
        <span style={{ fontSize:10,color:th.muted,marginLeft:8,letterSpacing:1.5 }}>CICLO {Math.floor((stats.totalPomodoros||0)/4)+1}</span>
      </div>

      {/* ── OVERLAYS ──────────────────────────────────────────────────────── */}
      {confirmData && <ConfirmModal th={th} message={confirmData.message} okLabel={confirmData.okLabel} okColor={confirmData.okColor} onOk={confirmData.onOk} onNo={()=>setConfirmData(null)} />}

      {cycleComplete && (
        <CycleCompleteModal th={th} cycleName={activeCycle.name}
          onRepeat={() => { setCycleComplete(false); setCycleStepIdx(0); setSeconds(activeCycle.steps[0].minutes*60); setRunning(true); }}
          onStop={()  => { setCycleComplete(false); setCycleMode(false); setCycleStepIdx(0); setSeconds(modes[freeIdx].minutes*60); }} />
      )}

      {showCyclePicker && (
        <CyclePicker th={th} cycles={cycles} activeCycleId={activeCycleId} modes={modes}
          onSelect={startCycle}
          onEdit={(c) => { setEditingCycle(c); setShowCyclePicker(false); }}
          onDelete={(id) => setCycles(p=>p.filter(c=>c.id!==id))}
          onCreate={() => { setEditingCycle("new"); setShowCyclePicker(false); }}
          onClose={() => setShowCyclePicker(false)} />
      )}

      {editingCycle && (
        <CycleEditor th={th} cycle={editingCycle==="new"?null:editingCycle} modes={modes}
          onSave={(c) => {
            setCycles(p => {
              const exists = p.find(x=>x.id===c.id);
              return exists ? p.map(x=>x.id===c.id?c:x) : [...p,c];
            });
            setEditingCycle(null);
          }}
          onClose={() => setEditingCycle(null)} />
      )}

      {showSettings && <Settings th={th} modes={modes} setModes={m=>{setModes(m);if(!running)setSeconds(cycleMode?activeCycle.steps[cycleStepIdx].minutes*60:m[freeIdx].minutes*60);}} sound={sound} setSound={setSound} user={user} setUser={setUser} onClose={()=>setShowSettings(false)} />}
      {showDash     && <Dashboard th={th} stats={stats} onClose={()=>setShowDash(false)} />}

      {/* Footer */}
      <footer style={{ width:'100%', maxWidth:520, marginTop:'auto', paddingTop:28, paddingBottom:18, paddingLeft:20, paddingRight:20, display:'flex', flexDirection:'column', alignItems:'center', gap:4, position:'relative', zIndex:10 }}>
        <div style={{ width:'100%', height:'1px', background:th.tabBorder, marginBottom:14 }} />
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#e05c5c,#f4a261)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0, letterSpacing:0.5 }}>MJ</div>
          <span style={{ fontSize:12, fontWeight:600, color:th.text, letterSpacing:0.3 }}>MJ Cloud Tecnologia</span>
        </div>
        <p style={{ fontSize:11, color:th.muted, textAlign:'center', lineHeight:1.6 }}>
          © {new Date().getFullYear()} MJ Cloud Tecnologia. Todos os direitos reservados.
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulseAnim{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}
        @keyframes floatUp{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-55px)}}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.2);border-radius:4px;}
        input[type=number]::-webkit-inner-spin-button{opacity:0.5;}
        button:active{transform:scale(0.96);}
        select option{background:#1c1c24;color:#f0f0f5;}
      `}</style>
    </div>
  );
}
