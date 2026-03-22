"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Search, Bell, Plus, Star, Tv, Film,
  TrendingUp, Home, Eye, X, Bookmark, BookmarkCheck,
  Trash2, ArrowLeft, Shield, ChevronRight, MoreVertical,
} from "lucide-react";

// ── ASSETS ────────────────────────────────────────────────────────────────────
import imgStatuette       from "../assets/anaterate-few-2919164_1920.png";
import imgMosque          from "../assets/mariams-fisherman-mosque-246976_1920.jpg";
import posterSuperman     from "../assets/Superman.jpg";
import posterTrumanShow   from "../assets/The_Truman_Show.jpg";
import posterJoker        from "../assets/JOKER_poster_fan-art_-_NIMROD___.jpg";
import posterOppenheimer  from "../assets/Oppenheimer_movie_poster.jpg";
import posterInterstellar from "../assets/Interstellar.jpg";

// ── PALETTE ───────────────────────────────────────────────────────────────────
const C = {
  green:"#00853F", yellow:"#FDEF42", red:"#E31B23",
  glass:"rgba(255,255,255,0.055)", glassMd:"rgba(255,255,255,0.09)",
  border:"rgba(255,255,255,0.09)", borderHi:"rgba(255,255,255,0.20)",
  text:"#F5EFE6", muted:"rgba(245,239,230,0.55)", soft:"rgba(245,239,230,0.30)",
  bg:"#0C0A08",
};

// ── RESPONSIVE HOOK ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
const FlagStripe: React.FC<{ width?:number; height?:number }> = ({ width=36, height=2 }) => (
  <div style={{ display:"flex", height, borderRadius:99, overflow:"hidden", width, flexShrink:0 }}>
    <div style={{ flex:1, background:C.green }}/><div style={{ flex:1, background:C.yellow }}/><div style={{ flex:1, background:C.red }}/>
  </div>
);

const Logo: React.FC<{ size?:number }> = ({ size=28 }) => (
  <img src={imgStatuette} alt="KaySetane"
    style={{ width:size, height:Math.round(size*1.6), objectFit:"contain",
      objectPosition:"center top", filter:"brightness(0.9) contrast(1.1) sepia(0.1)",
      mixBlendMode:"screen" }}/>
);

// ── STORAGE ───────────────────────────────────────────────────────────────────
const LISTE_KEY = "kaysetane_liste";
const PROG_KEY  = "kaysetane_progress";
const getListe  = (): any[] => { try { return JSON.parse(localStorage.getItem(LISTE_KEY)||"[]"); } catch { return []; } };
const saveListe = (items:any[]) => localStorage.setItem(LISTE_KEY, JSON.stringify(items));
const addToListe = (item:any) => {
  const l = getListe();
  if (l.find((i:any)=>i.id===item.id && i.media_type===item.media_type)) return;
  saveListe([{ id:item.id, title:mediaTitle(item), poster_path:item.poster_path,
    media_type:item.media_type||"movie", year:mediaYear(item), vote_average:item.vote_average,
    frembed_link:item.frembed_link||null, version:item.version||null, savedAt:Date.now() }, ...l]);
};
const removeFromListe = (id:number,mt:string) => saveListe(getListe().filter((i:any)=>!(i.id===id&&i.media_type===mt)));
const isInListe = (id:number,mt:string) => getListe().some((i:any)=>i.id===id&&i.media_type===mt);
const getProgress = (): Record<string,any> => { try { return JSON.parse(localStorage.getItem(PROG_KEY)||"{}"); } catch { return {}; } };
const saveProgress = (key:string,data:any) => { const p=getProgress(); p[key]=data; localStorage.setItem(PROG_KEY,JSON.stringify(p)); };

// ── TMDB ──────────────────────────────────────────────────────────────────────
const TMDB_KEY  = "7340fd92d1c2bdec987f215f33c56717";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE  = "https://image.tmdb.org/t/p/";

const SOURCES = [
  { name:"🇫🇷 VF",
    fn:(id:number,tv:boolean,s=1,e=1) => tv ? `https://frembed.bond/embed/serie/${id}?sa=${s}&epi=${e}` : `https://frembed.bond/embed/movie/${id}` },
  { name:"Source 2",
    fn:(id:number,tv:boolean,s=1,e=1) => tv ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` : `https://vidsrc.xyz/embed/movie/${id}` },
  { name:"Source 3",
    fn:(id:number,tv:boolean,s=1,e=1) => tv ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${id}&tmdb=1` },
];

async function tmdb(path:string, params:Record<string,string>={}) {
  try {
    const u=new URL(TMDB_BASE+path);
    u.searchParams.set("api_key",TMDB_KEY); u.searchParams.set("language","fr-FR");
    u.searchParams.set("region","FR"); u.searchParams.set("include_adult","false");
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    const r=await fetch(u.toString()); if(!r.ok) throw new Error(String(r.status));
    return r.json();
  } catch(e) { console.error("TMDB:",path,e); return null; }
}

async function tmdbFB(path:string, params:Record<string,string>={}) {
  const d=await tmdb(path,params);
  if(d&&!d.overview){ const fb=await tmdb(path,{...params,language:"en-US"}); if(fb?.overview) d.overview=fb.overview; }
  return d;
}

const imgUrl=(path?:string|null,size="w342")=>{ if(!path) return null; return path.startsWith("http")?path:IMG_BASE+size+path; };
const mediaTitle=(item:any)=>item?.title||item?.name||"";
const mediaYear=(item:any)=>(item?.release_date||item?.first_air_date||"").slice(0,4);
const isTV=(item:any)=>item?.media_type==="tv"||item?.type==="tv";
const embedSrc=(item:any,si=0,s=1,e=1)=>{
  if(si===0&&(item as any).frembed_link){ const lk=(item as any).frembed_link as string; return isTV(item)?lk.replace(/sa=\d+/,`sa=${s}`).replace(/epi=\d+/,`epi=${e}`):lk; }
  return SOURCES[si].fn(item.id,isTV(item),s,e);
};

// ── FREMBED API ───────────────────────────────────────────────────────────────
const FREMBED="https://frembed.bond/api/public/v1";
async function frembedMovies(page=1,order="popular") {
  try { const r=await fetch(`${FREMBED}/movies?limit=20&page=${page}&order=${order}`); const d=await r.json();
    return (d?.result?.items||[]).map((i:any)=>({ id:Number(i.tmdb),title:i.title,release_date:i.year?`${i.year}-01-01`:"",poster_path:i.poster||null,vote_average:0,media_type:"movie",frembed_link:i.link,version:i.version||"VF" }));
  } catch { return []; }
}
async function frembedTV(page=1,order="popular") {
  try { const r=await fetch(`${FREMBED}/tv?limit=20&page=${page}&order=${order}`); const d=await r.json();
    const seen=new Set<string>();
    return (d?.result?.items||[]).filter((i:any)=>{ if(seen.has(i.tmdb)) return false; seen.add(i.tmdb); return true; })
      .map((i:any)=>({ id:Number(i.tmdb),name:i.title,first_air_date:i.year?`${i.year}-01-01`:"",poster_path:null,vote_average:0,media_type:"tv",frembed_link:i.link,version:i.version||"VF" }));
  } catch { return []; }
}

// ── FEATURED ──────────────────────────────────────────────────────────────────
const FEATURED=[
  { id:807,    title:"Superman",        year:"2025", img:posterSuperman,     media_type:"movie", accent:C.yellow, overview:"Le Héros de Krypton revient dans une aventure épique signée James Gunn." },
  { id:37165,  title:"The Truman Show", year:"1998", img:posterTrumanShow,   media_type:"movie", accent:C.green,  overview:"Un homme découvre que toute sa vie est un show télévisé diffusé en direct." },
  { id:475557, title:"Joker",           year:"2019", img:posterJoker,        media_type:"movie", accent:C.red,    overview:"L'origine sombre du clown criminel le plus célèbre de Gotham." },
  { id:872585, title:"Oppenheimer",     year:"2023", img:posterOppenheimer,  media_type:"movie", accent:C.yellow, overview:"Le père de la bombe atomique." },
  { id:157336, title:"Interstellar",    year:"2014", img:posterInterstellar, media_type:"movie", accent:C.green,  overview:"Un voyage à travers les étoiles pour sauver l'humanité." },
];

// ── SKELETON ──────────────────────────────────────────────────────────────────
const Skel: React.FC<{ w?:number; h?:number }> = ({ w=140, h=210 }) => (
  <div style={{ flexShrink:0, width:w, height:h, borderRadius:12,
    background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize:"600px 100%", animation:"shimmer 1.4s infinite" }}/>
);

// ── MEDIA CARD ────────────────────────────────────────────────────────────────
const CARD_W = 130;
const CARD_H = 195;

const MediaCard: React.FC<{ item:any; onClick:(i:any)=>void; localImg?:string }> =
({ item, onClick, localImg }) => {
  const [hov, setHov] = useState(false);
  const poster = localImg || imgUrl(item.poster_path);
  const t = mediaTitle(item);
  const tv = isTV(item);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "";
  const hasVF = !!(item.frembed_link||item.version);
  const inL = isInListe(item.id, item.media_type||"movie");
  const prog = getProgress()[String(item.id)];

  return (
    <motion.div whileHover={{ scale:1.04 }} transition={{ duration:0.18 }}
      onTouchStart={()=>setHov(true)} onTouchEnd={()=>setTimeout(()=>setHov(false),400)}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      onClick={()=>onClick(item)}
      style={{ flexShrink:0, width:CARD_W, borderRadius:12, overflow:"hidden",
        position:"relative", cursor:"pointer",
        boxShadow:hov?"0 16px 40px rgba(0,0,0,0.8)":"0 4px 16px rgba(0,0,0,0.5)" }}>

      {poster
        ? <img src={poster} alt={t} loading="lazy" style={{ width:CARD_W, height:CARD_H, objectFit:"cover", display:"block" }}/>
        : <div style={{ width:CARD_W, height:CARD_H, background:"rgba(255,255,255,0.04)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:6 }}>
            <span style={{ fontSize:9, color:C.soft, textAlign:"center", lineHeight:1.4 }}>{t}</span>
          </div>}

      <motion.div animate={{ opacity:hov?1:0 }}
        style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.15) 50%,transparent 100%)",
          display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"8px 8px 10px" }}>
        <p style={{ fontSize:10, fontWeight:700, color:C.text, lineHeight:1.3, marginBottom:2 }}>{t}</p>
        <div style={{ display:"flex", justifyContent:"center", marginTop:4 }}>
          <div style={{ width:30, height:30, borderRadius:99, background:C.yellow,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Play size={11} color="#000" fill="#000"/>
          </div>
        </div>
      </motion.div>

      {/* VF badge */}
      {hasVF && <div style={{ position:"absolute", top:6, left:6, background:"rgba(0,133,63,0.9)",
        borderRadius:4, padding:"2px 5px", fontSize:7, fontWeight:800, color:"#fff" }}>
        {item.version||"VF"}</div>}

      {/* Rating */}
      {rating && !hasVF && <div style={{ position:"absolute", top:6, left:6, background:"rgba(0,0,0,0.7)",
        borderRadius:4, padding:"2px 5px", display:"flex", alignItems:"center", gap:2 }}>
        <Star size={7} color={C.yellow} fill={C.yellow}/><span style={{ fontSize:7, fontWeight:700, color:C.yellow }}>{rating}</span></div>}

      {/* TV/Film */}
      <div style={{ position:"absolute", top:6, right:6,
        background:tv?"rgba(0,133,63,0.2)":"rgba(255,255,255,0.08)",
        border:`1px solid ${tv?"rgba(0,133,63,0.4)":C.border}`,
        borderRadius:4, padding:"2px 5px", fontSize:6, fontWeight:700,
        color:tv?C.green:C.muted, textTransform:"uppercase" }}>{tv?"TV":"Film"}</div>

      {/* Bookmark */}
      {inL && <div style={{ position:"absolute", top:24, right:6, width:16, height:16,
        borderRadius:4, background:"rgba(253,239,66,0.9)",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <BookmarkCheck size={9} color="#000"/></div>}

      {/* Progress */}
      {prog?.pct>2 && <div style={{ position:"absolute", bottom:2, left:0, right:0, height:3, background:"rgba(0,0,0,0.5)" }}>
        <div style={{ width:`${prog.pct}%`, height:"100%", background:C.yellow, borderRadius:"0 2px 2px 0" }}/></div>}

      <div style={{ position:"absolute", bottom:prog?.pct>2?5:0, left:0, right:0, height:2, display:"flex" }}>
        <div style={{ flex:1, background:C.green, opacity:hov?1:0.25, transition:"opacity 0.2s" }}/>
        <div style={{ flex:1, background:C.yellow, opacity:hov?1:0.25, transition:"opacity 0.2s" }}/>
        <div style={{ flex:1, background:C.red, opacity:hov?1:0.25, transition:"opacity 0.2s" }}/>
      </div>
    </motion.div>
  );
};

// ── MEDIA ROW ─────────────────────────────────────────────────────────────────
const MediaRow: React.FC<{ label:string; items:any[]; loading:boolean; onCardClick:(i:any)=>void }> =
({ label, items, loading, onCardClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:12, padding: isMobile ? "0 16px" : "0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <FlagStripe width={14} height={2}/>
          <h2 style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em",
            textTransform:"uppercase", color:C.muted }}>{label}</h2>
        </div>
        {!isMobile && (
          <div style={{ display:"flex", gap:4 }}>
            {["‹","›"].map((ch,i)=>(
              <button key={i} onClick={()=>ref.current?.scrollBy({left:i===0?-350:350,behavior:"smooth"})}
                style={{ width:24, height:24, borderRadius:99, background:C.glass,
                  border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{ch}</button>
            ))}
          </div>
        )}
      </div>
      <div ref={ref} style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none",
        paddingBottom:4, paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0,
        // Snap scroll on mobile
        scrollSnapType: isMobile ? "x mandatory" : "none",
        WebkitOverflowScrolling:"touch" }}>
        {loading ? Array.from({length:8}).map((_,i)=><Skel key={i}/>)
          : items.map((item,i)=>(
            <div key={`${item.id}-${i}`} style={{ scrollSnapAlign: isMobile ? "start" : "none" }}>
              <MediaCard item={item} onClick={onCardClick}/>
            </div>
          ))}
      </div>
    </div>
  );
};

// ── HERO — auto-slide ─────────────────────────────────────────────────────────
const HeroBanner: React.FC<{ items:any[]; onPlay:(i:any)=>void; onDetail:(i:any)=>void }> =
({ items, onPlay, onDetail }) => {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const isMobile = useIsMobile();
  const pool = items.length>0 ? items : FEATURED;

  const restart = useCallback(()=>{
    if(timerRef.current) clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setIdx(i=>(i+1)%pool.length),8000);
  },[pool.length]);

  useEffect(()=>{ restart(); return ()=>{ if(timerRef.current) clearInterval(timerRef.current); }; },[restart]);
  const goTo=(i:number)=>{ setIdx(i); restart(); };

  const f=pool[idx]||pool[0];
  const isLocal=!!(f as any).img;
  const backdrop=isLocal?(f as any).img:imgUrl(f.backdrop_path,"original");
  const t=isLocal?(f as any).title:mediaTitle(f);
  const y=isLocal?(f as any).year:mediaYear(f);
  const tv=!isLocal&&isTV(f);
  const rating=!isLocal&&f.vote_average?f.vote_average.toFixed(1):"";
  const overview=isLocal?(f as any).overview:(f.overview||"");
  const hasVF=!!(f as any).frembed_link||isLocal;

  const heroH = isMobile ? "56vw" : "420px";
  const heroMinH = isMobile ? 260 : 380;

  return (
    <div style={{ position:"relative", height:heroH, minHeight:heroMinH, borderRadius: isMobile ? 16 : 22,
      overflow:"hidden", marginBottom: isMobile ? 20 : 32 }}>
      <AnimatePresence mode="sync">
        <motion.div key={idx} initial={{ opacity:0, scale:1.04 }} animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0 }} transition={{ duration:0.6 }}
          style={{ position:"absolute", inset:0 }}>
          {backdrop && <img src={backdrop} alt={t}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 20%" }}/>}
        </motion.div>
      </AnimatePresence>

      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to right,rgba(12,10,8,0.95) 0%,rgba(12,10,8,0.45) 70%,transparent 100%)" }}/>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to top,rgba(12,10,8,0.98) 0%,transparent 50%)" }}/>

      <motion.div key={`c${idx}`} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.45, delay:0.15 }}
        style={{ position:"absolute", inset:0, padding: isMobile ? "16px 16px 20px" : "28px 36px 28px",
          display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>

        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
          <FlagStripe width={22} height={2}/>
          {hasVF && <span style={{ fontSize:7, fontWeight:800, color:"#fff",
            background:"rgba(0,133,63,0.9)", borderRadius:99, padding:"2px 7px" }}>VF</span>}
          {rating && <div style={{ display:"flex", alignItems:"center", gap:2,
            background:`${C.yellow}18`, border:`1px solid ${C.yellow}30`, borderRadius:99, padding:"2px 7px" }}>
            <Star size={7} color={C.yellow} fill={C.yellow}/>
            <span style={{ fontSize:8, fontWeight:700, color:C.yellow }}>{rating}</span></div>}
          {y && <span style={{ fontSize:8, color:C.soft, background:"rgba(255,255,255,0.08)", borderRadius:99, padding:"2px 7px" }}>{y}</span>}
        </div>

        <h1 style={{ fontSize: isMobile ? "clamp(18px,5.5vw,28px)" : "clamp(24px,3.5vw,44px)",
          fontWeight:800, letterSpacing:"-0.03em", color:C.text, lineHeight:1.1, marginBottom:6 }}>{t}</h1>

        {overview && !isMobile && (
          <p style={{ fontSize:11, color:C.muted, lineHeight:1.6, maxWidth:400, marginBottom:16,
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{overview}</p>
        )}

        <div style={{ display:"flex", gap:8, marginTop: isMobile ? 8 : 0 }}>
          <button onClick={()=>onPlay(f)}
            style={{ display:"flex", alignItems:"center", gap:6,
              padding: isMobile ? "9px 18px" : "10px 22px",
              borderRadius:99, background:C.yellow, color:"#000",
              fontSize: isMobile ? 11 : 12, fontWeight:700, cursor:"pointer", border:"none" }}>
            <Play size={11} fill="currentColor"/> {isMobile ? "▶ Voir" : "Regarder"}
          </button>
          <button onClick={()=>onDetail(f)}
            style={{ display:"flex", alignItems:"center", gap:5,
              padding: isMobile ? "9px 14px" : "10px 18px",
              borderRadius:99, background:"rgba(255,255,255,0.1)", backdropFilter:"blur(12px)",
              border:`1px solid ${C.border}`, color:C.muted,
              fontSize: isMobile ? 11 : 12, cursor:"pointer" }}>
            <Plus size={11}/> {isMobile ? "Liste" : "Ma liste"}
          </button>
        </div>
      </motion.div>

      {/* Dots */}
      <div style={{ position:"absolute", bottom: isMobile ? 10 : 12, right: isMobile ? 12 : 16,
        display:"flex", gap:4, alignItems:"center" }}>
        {pool.slice(0,Math.min(pool.length,6)).map((_,i)=>(
          <button key={i} onClick={()=>goTo(i)}
            style={{ width:idx===i?16:5, height:5, borderRadius:99, padding:0,
              background:idx===i?C.yellow:"rgba(255,255,255,0.3)",
              border:"none", cursor:"pointer", transition:"all 0.3s" }}/>
        ))}
      </div>

      {/* Timer bar */}
      <motion.div key={`t${idx}`} initial={{ scaleX:0 }} animate={{ scaleX:1 }}
        transition={{ duration:8, ease:"linear" }}
        style={{ position:"absolute", bottom:0, left:0, right:0, height:2,
          background:C.yellow, opacity:0.4, transformOrigin:"left" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, display:"flex" }}>
        <div style={{ flex:1, background:C.green }}/><div style={{ flex:1, background:C.yellow }}/><div style={{ flex:1, background:C.red }}/>
      </div>
    </div>
  );
};

// ── AD BLOCKER OVERLAY ────────────────────────────────────────────────────────
// Bloque les clics sur les zones de pub dans l'iframe (coins, overlay banner)
const AdBlockOverlay: React.FC<{ isMobile:boolean }> = ({ isMobile }) => (
  <>
    {/* Top-left ad zone */}
    <div style={{ position:"absolute", top:0, left:0, width:"18%", height:"18%", zIndex:5, cursor:"default" }}/>
    {/* Top-right ad zone */}
    <div style={{ position:"absolute", top:0, right:0, width:"22%", height:"18%", zIndex:5, cursor:"default" }}/>
    {/* Bottom-right watermark/ad */}
    <div style={{ position:"absolute", bottom:0, right:0, width:"25%", height:"14%", zIndex:5, cursor:"default" }}/>
    {/* Bottom-left */}
    <div style={{ position:"absolute", bottom:0, left:0, width:"18%", height:"12%", zIndex:5, cursor:"default" }}/>
    {/* Center top banner (skip ad button zone) */}
    <div style={{ position:"absolute", top:0, left:"18%", right:"22%", height:"12%", zIndex:5, cursor:"default" }}/>
  </>
);

// ── UBLOCK BANNER ─────────────────────────────────────────────────────────────
const UBlockBanner: React.FC<{ onClose:()=>void }> = ({ onClose }) => (
  <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
    style={{ background:"rgba(0,133,63,0.12)", backdropFilter:"blur(16px)",
      borderBottom:`1px solid rgba(0,133,63,0.3)`,
      padding:"10px 16px", display:"flex", alignItems:"center", gap:10,
      flexShrink:0 }}>
    <Shield size={14} color={C.green}/>
    <div style={{ flex:1 }}>
      <span style={{ fontSize:11, color:C.text }}>
        Pour bloquer les pubs — installe{" "}
        <a href="https://ublockorigin.com" target="_blank" rel="noreferrer"
          style={{ color:C.yellow, fontWeight:700, textDecoration:"none" }}>
          uBlock Origin
        </a>
        {" "}(Chrome / Firefox)
      </span>
    </div>
    <button onClick={onClose}
      style={{ background:"none", border:"none", cursor:"pointer", color:C.soft,
        padding:0, display:"flex", flexShrink:0 }}>
      <X size={12}/>
    </button>
  </motion.div>
);

// ── PLAYER ────────────────────────────────────────────────────────────────────
const PlayerModal: React.FC<{ item:any; onClose:()=>void }> = ({ item, onClose }) => {
  const [season, setSeason]    = useState(1);
  const [episode, setEpisode]  = useState(1);
  const [seasons, setSeasons]  = useState<number[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [si, setSi]            = useState(0);
  const [fallback, setFallback] = useState(false);
  const [showUBlock, setShowUBlock] = useState(true);
  const [showEpPanel, setShowEpPanel] = useState(false);
  const fbTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const isMobile = useIsMobile();

  const tv=isTV(item), t=(item as any).title||mediaTitle(item), isLocal=!!(item as any).img;

  useEffect(()=>{ if(!tv||isLocal) return; tmdb(`/tv/${item.id}`).then(d=>{ if(d) setSeasons(Array.from({length:d.number_of_seasons||1},(_,i)=>i+1)); }); },[item.id,tv]);
  useEffect(()=>{ if(!tv||isLocal) return; tmdb(`/tv/${item.id}/season/${season}`).then(d=>setEpisodes(d?.episodes||[])); },[item.id,tv,season]);

  useEffect(()=>{
    setFallback(false);
    if(fbTimer.current) clearTimeout(fbTimer.current);
    if(si===0&&!isLocal) fbTimer.current=setTimeout(()=>setFallback(true),12000);
    return ()=>{ if(fbTimer.current) clearTimeout(fbTimer.current); };
  },[si,season,episode]);

  const src=isLocal
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(t+" bande annonce")}`
    : embedSrc(item,si,season,episode);
  const epList=episodes.length>0?episodes:Array.from({length:12},(_,i)=>({episode_number:i+1,name:`Épisode ${i+1}`}));

  useEffect(()=>{ saveProgress(String(item.id),{ pct:10, title:t, season:tv?season:undefined, episode:tv?episode:undefined, updatedAt:Date.now() }); },[]);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"#000",
        display:"flex", flexDirection:"column" }}>

      {/* Topbar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding: isMobile ? "10px 14px" : "10px 20px",
        borderBottom:`1px solid ${C.border}`, flexShrink:0, background:"rgba(8,6,4,0.97)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, overflow:"hidden" }}>
          <Logo size={18}/>
          <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.16em",
            textTransform:"uppercase", color:C.text }}>KAYSETANE</span>
          <span style={{ color:C.soft, fontSize:10 }}>›</span>
          <span style={{ fontSize:11, fontWeight:600, color:C.text,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
            maxWidth: isMobile ? 120 : 300 }}>{t}</span>
          {tv&&!isLocal&&<span style={{ fontSize:9, color:C.muted, background:"rgba(255,255,255,0.06)",
            padding:"2px 6px", borderRadius:5, flexShrink:0 }}>S{season}·E{episode}</span>}
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
          {!isLocal && (
            <div style={{ display:"flex", gap:3, padding:"3px 5px", borderRadius:99,
              background:C.glass, border:`1px solid ${C.border}` }}>
              {SOURCES.map((s,i)=>(
                <button key={i} onClick={()=>{ setSi(i); setFallback(false); }}
                  style={{ padding: isMobile ? "3px 8px" : "4px 10px", borderRadius:99,
                    fontSize: isMobile ? 9 : 10, fontWeight:600, cursor:"pointer",
                    background:si===i?C.yellow:"transparent",
                    color:si===i?"#000":C.muted, border:"none" }}>{s.name}</button>
              ))}
            </div>
          )}
          {tv && !isLocal && isMobile && (
            <button onClick={()=>setShowEpPanel(!showEpPanel)}
              style={{ width:30, height:30, borderRadius:8, background:C.glass,
                border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
              <MoreVertical size={13}/>
            </button>
          )}
          <button onClick={onClose}
            style={{ width:30, height:30, borderRadius:99, background:C.glass,
              border:`1px solid ${C.border}`, color:C.text, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={13}/>
          </button>
        </div>
      </div>

      {/* uBlock banner */}
      <AnimatePresence>
        {showUBlock && <UBlockBanner onClose={()=>setShowUBlock(false)}/>}
      </AnimatePresence>

      {/* Content */}
      <div style={{ display:"flex", flex:1, overflow:"hidden", position:"relative",
        flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ flex:1, position:"relative" }}>
          {isLocal ? (
            <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:20, background:"rgba(12,10,8,0.95)",
              padding:20 }}>
              <img src={(item as any).img} alt={t}
                style={{ width: isMobile ? 160 : 200, borderRadius:14, boxShadow:"0 16px 48px rgba(0,0,0,0.8)" }}/>
              <p style={{ fontSize:13, color:C.muted, textAlign:"center", maxWidth:300, lineHeight:1.7 }}>
                {(item as any).overview}
              </p>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(t+" bande annonce")}`}
                target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px",
                  borderRadius:99, background:C.yellow, color:"#000",
                  fontSize:12, fontWeight:700, textDecoration:"none" }}>
                <Play size={12} fill="#000"/> Bande annonce
              </a>
            </div>
          ) : (
            <>
              {/* iframe wrapper avec overlay anti-pub */}
              <div style={{ position:"relative", width:"100%", height:"100%" }}>
                <iframe src={src} width="100%" height="100%" frameBorder="0"
                  allowFullScreen allow="autoplay;fullscreen;picture-in-picture;encrypted-media"
                  style={{ display:"block", border:"none", width:"100%", height:"100%" }}
                  onLoad={()=>{ if(fbTimer.current) clearTimeout(fbTimer.current); setFallback(false); }}/>
                {/* Bloqueur de clics sur les zones pub */}
                <AdBlockOverlay isMobile={isMobile}/>
              </div>

              {/* Fallback banner */}
              <AnimatePresence>
                {fallback && (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ position:"absolute", inset:0, background:"rgba(8,6,4,0.92)",
                      backdropFilter:"blur(8px)", display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center", gap:16, padding:20, zIndex:10 }}>
                    <p style={{ fontSize:13, color:C.muted, textAlign:"center", maxWidth:280 }}>
                      Frembed VF ne répond pas.<br/>
                      <span style={{ color:C.soft, fontSize:11 }}>Essayer Source 2 ?</span>
                    </p>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
                      <button onClick={()=>{ setSi(1); setFallback(false); }}
                        style={{ padding:"10px 22px", borderRadius:99, background:C.yellow,
                          color:"#000", fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>
                        ✓ Source 2
                      </button>
                      <button onClick={()=>setFallback(false)}
                        style={{ padding:"10px 22px", borderRadius:99, background:C.glass,
                          border:`1px solid ${C.border}`, color:C.muted, fontSize:12, cursor:"pointer" }}>
                        Patienter
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Episode sidebar — desktop */}
        {tv && !isLocal && !isMobile && (
          <div style={{ width:240, background:"rgba(6,4,2,0.99)",
            borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
            {seasons.length>1 && (
              <div style={{ padding:10, borderBottom:`1px solid ${C.border}` }}>
                <p style={{ fontSize:8, fontWeight:600, color:C.soft, textTransform:"uppercase",
                  letterSpacing:"0.22em", marginBottom:8 }}>Saison</p>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  {seasons.map(s=>(
                    <button key={s} onClick={()=>{ setSeason(s); setEpisode(1); }}
                      style={{ padding:"4px 10px", borderRadius:7, fontSize:11, fontWeight:600,
                        cursor:"pointer", background:season===s?C.yellow:C.glass,
                        color:season===s?"#000":C.muted, border:season===s?"none":`1px solid ${C.border}` }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ flex:1, overflowY:"auto", padding:6 }}>
              {epList.map((ep:any)=>{
                const n=ep.episode_number||1; const active=episode===n;
                return (
                  <div key={n} onClick={()=>{ setEpisode(n); saveProgress(`${item.id}_s${season}e${n}`,{pct:10,title:t,season,episode:n,updatedAt:Date.now()}); }}
                    style={{ padding:"8px 10px", borderRadius:9, marginBottom:3, cursor:"pointer",
                      display:"flex", gap:8, alignItems:"center",
                      background:active?"rgba(253,239,66,0.08)":"transparent",
                      border:`1px solid ${active?"rgba(253,239,66,0.2)":"transparent"}` }}>
                    <div style={{ width:26, height:26, borderRadius:6, flexShrink:0,
                      background:active?C.yellow:C.glass, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {active?<Play size={9} color="#000" fill="#000"/>:<span style={{ fontSize:9, color:C.soft }}>{n}</span>}
                    </div>
                    <p style={{ fontSize:10, fontWeight:active?600:400, color:active?C.yellow:C.text,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {ep.name||`Épisode ${n}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Episode panel — mobile bottom sheet */}
        <AnimatePresence>
          {tv && !isLocal && isMobile && showEpPanel && (
            <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", stiffness:300, damping:30 }}
              style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:20,
                background:"rgba(10,8,6,0.98)", borderRadius:"20px 20px 0 0",
                border:`1px solid ${C.border}`, borderBottom:"none",
                maxHeight:"60%", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"12px 16px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:10, fontWeight:600, color:C.muted,
                  textTransform:"uppercase", letterSpacing:"0.15em" }}>Épisodes</span>
                <button onClick={()=>setShowEpPanel(false)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:C.soft }}>
                  <X size={14}/>
                </button>
              </div>
              {seasons.length>1 && (
                <div style={{ padding:"0 16px 10px", display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none" }}>
                  {seasons.map(s=>(
                    <button key={s} onClick={()=>{ setSeason(s); setEpisode(1); }}
                      style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:600,
                        cursor:"pointer", flexShrink:0,
                        background:season===s?C.yellow:C.glass, color:season===s?"#000":C.muted,
                        border:season===s?"none":`1px solid ${C.border}` }}>{s}</button>
                  ))}
                </div>
              )}
              <div style={{ flex:1, overflowY:"auto", padding:"0 12px 16px" }}>
                {epList.map((ep:any)=>{
                  const n=ep.episode_number||1; const active=episode===n;
                  return (
                    <div key={n} onClick={()=>{ setEpisode(n); setShowEpPanel(false); }}
                      style={{ padding:"10px 12px", borderRadius:10, marginBottom:4, cursor:"pointer",
                        display:"flex", gap:10, alignItems:"center",
                        background:active?"rgba(253,239,66,0.08)":"transparent",
                        border:`1px solid ${active?"rgba(253,239,66,0.2)":"transparent"}` }}>
                      <div style={{ width:30, height:30, borderRadius:8, flexShrink:0,
                        background:active?C.yellow:C.glass, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {active?<Play size={10} color="#000" fill="#000"/>:<span style={{ fontSize:10, color:C.soft }}>{n}</span>}
                      </div>
                      <p style={{ fontSize:12, fontWeight:active?600:400, color:active?C.yellow:C.text,
                        flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {ep.name||`Épisode ${n}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── DETAIL MODAL ──────────────────────────────────────────────────────────────
const DetailModal: React.FC<{ item:any; onClose:()=>void; onPlay:(i:any)=>void }> =
({ item, onClose, onPlay }) => {
  const [info, setInfo]     = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [inL, setInL]       = useState(false);
  const isMobile = useIsMobile();
  const tv=isTV(item), isLocal=!!(item as any).img;

  useEffect(()=>{
    setInL(isInListe(item.id, item.media_type||"movie"));
    if(isLocal) return;
    Promise.all([tmdbFB(`/${tv?"tv":"movie"}/${item.id}`), tmdb(`/${tv?"tv":"movie"}/${item.id}/similar`)])
      .then(([d,s])=>{ setInfo(d); setSimilar((s?.results||[]).filter((r:any)=>r.poster_path).slice(0,8).map((r:any)=>({...r,media_type:tv?"tv":"movie"}))); });
  },[item.id,tv,isLocal]);

  const data=info||item;
  const backdrop=isLocal?(item as any).img:imgUrl(data.backdrop_path,"original");
  const poster=isLocal?(item as any).img:imgUrl(data.poster_path,"w500");
  const t=isLocal?(item as any).title:mediaTitle(data);
  const rating=!isLocal&&data.vote_average?data.vote_average.toFixed(1):"";
  const y=isLocal?(item as any).year:mediaYear(data);
  const hasVF=!!(item.frembed_link||(item as any).img);
  const prog=getProgress()[String(item.id)];
  const toggleL=()=>{ if(inL){removeFromListe(item.id,item.media_type||"movie");setInL(false);}else{addToListe({...item,...(info||{})});setInL(true);} };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, zIndex:900, background:"rgba(0,0,0,0.8)",
        backdropFilter:"blur(8px)", display:"flex",
        alignItems: isMobile ? "flex-end" : "flex-end", justifyContent:"center" }}>

      <motion.div initial={{ y:60 }} animate={{ y:0 }}
        style={{ width:"100%", maxWidth: isMobile ? "100%" : 820,
          maxHeight: isMobile ? "92vh" : "88vh", overflowY:"auto",
          background:"rgba(14,11,8,0.98)", backdropFilter:"blur(32px)",
          borderRadius: isMobile ? "20px 20px 0 0" : "20px 20px 0 0",
          scrollbarWidth:"none", border:`1px solid ${C.border}`, borderBottom:"none" }}>

        <div style={{ position:"relative", height: isMobile ? "45vw" : 260,
          minHeight: isMobile ? 200 : 220, overflow:"hidden", borderRadius: isMobile ? "20px 20px 0 0" : "20px 20px 0 0" }}>
          {backdrop&&<img src={backdrop} style={{ width:"100%", height:"100%", objectFit:"cover",
            objectPosition:isLocal?"center top":"center 30%" }} alt=""/>}
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(to top,rgba(14,11,8,0.98) 0%,transparent 55%)" }}/>
          <button onClick={onClose}
            style={{ position:"absolute", top:12, right:12, width:32, height:32, borderRadius:99,
              background:"rgba(0,0,0,0.6)", border:`1px solid ${C.border}`, color:C.text,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={14}/>
          </button>
          {/* Mobile drag handle */}
          {isMobile && <div style={{ position:"absolute", top:8, left:"50%", transform:"translateX(-50%)",
            width:36, height:4, borderRadius:99, background:"rgba(255,255,255,0.2)" }}/>}
        </div>

        <div style={{ padding: isMobile ? "0 16px 32px" : "0 24px 32px" }}>
          <div style={{ display:"flex", gap:14, marginTop:-44, position:"relative", zIndex:1 }}>
            {poster&&<img src={poster} style={{ width: isMobile ? 80 : 90, borderRadius:10,
              flexShrink:0, objectFit:"cover", boxShadow:"0 12px 32px rgba(0,0,0,0.8)" }} alt=""/>}
            <div style={{ flex:1, paddingTop: isMobile ? 50 : 52 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, letterSpacing:"-0.02em",
                  color:C.text, lineHeight:1.15 }}>{t}</h2>
                <button onClick={toggleL}
                  style={{ display:"flex", alignItems:"center", gap:4,
                    padding: isMobile ? "6px 10px" : "6px 12px", borderRadius:99,
                    background:inL?`${C.yellow}18`:C.glass, border:`1px solid ${inL?C.yellow+"44":C.border}`,
                    color:inL?C.yellow:C.muted, fontSize:10, fontWeight:600, cursor:"pointer",
                    flexShrink:0, whiteSpace:"nowrap" }}>
                  {inL?<><BookmarkCheck size={11}/> Sauvé</>:<><Bookmark size={11}/> Liste</>}
                </button>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", marginTop:6 }}>
                {hasVF&&<span style={{ fontSize:7, fontWeight:800, color:"#fff",
                  background:"rgba(0,133,63,0.9)", borderRadius:99, padding:"2px 7px" }}>VF</span>}
                {rating&&<div style={{ display:"flex", alignItems:"center", gap:3 }}>
                  <Star size={9} color={C.yellow} fill={C.yellow}/><span style={{ fontSize:10, color:C.yellow, fontWeight:700 }}>{rating}</span></div>}
                {y&&<span style={{ fontSize:10, color:C.muted }}>· {y}</span>}
                <FlagStripe width={16} height={2}/>
              </div>
            </div>
          </div>

          {prog?.pct>2 && (
            <div style={{ marginTop:12 }}>
              <div style={{ height:3, borderRadius:99, background:"rgba(255,255,255,0.08)" }}>
                <div style={{ width:`${prog.pct}%`, height:"100%", borderRadius:99, background:C.yellow }}/></div>
              <p style={{ fontSize:9, color:C.soft, marginTop:3 }}>{prog.pct}% regardé</p>
            </div>
          )}

          {!isLocal&&info?.genres?.length>0&&(
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:12 }}>
              {info.genres.slice(0,4).map((g:any)=>(
                <span key={g.id} style={{ fontSize:9, padding:"3px 8px", borderRadius:99,
                  background:C.glass, border:`1px solid ${C.border}`, color:C.muted }}>{g.name}</span>
              ))}
            </div>
          )}

          {(isLocal?(item as any).overview:(data.overview||""))&&(
            <p style={{ fontSize: isMobile ? 12 : 13, color:C.muted, lineHeight:1.8, marginTop:14 }}>
              {isLocal?(item as any).overview:data.overview}
            </p>
          )}

          <button onClick={()=>{ onClose(); onPlay(item); }}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"13px 0", width:"100%", borderRadius:14, background:C.yellow,
              color:"#000", fontSize:13, fontWeight:700, cursor:"pointer", border:"none",
              marginTop:16 }}>
            <Play size={13} fill="currentColor"/>
            {prog?.pct>2 ? "Reprendre" : "Regarder"}
          </button>

          {similar.length>0&&(
            <div style={{ marginTop:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <FlagStripe width={12} height={2}/>
                <h3 style={{ fontSize:9, fontWeight:600, letterSpacing:"0.22em",
                  textTransform:"uppercase", color:C.soft }}>Similaires</h3>
              </div>
              <div style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none" }}>
                {similar.map((s,i)=><MediaCard key={s.id||i} item={s}
                  onClick={it=>{ onClose(); setTimeout(()=>onPlay(it),100); }}/>)}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── MA LISTE PAGE ─────────────────────────────────────────────────────────────
const PageMaListe: React.FC<{ onCardClick:(i:any)=>void; onRefresh:()=>void }> =
({ onCardClick, onRefresh }) => {
  const [liste, setListe] = useState<any[]>([]);
  useEffect(()=>setListe(getListe()),[]);
  const remove=(id:number,mt:string)=>{ removeFromListe(id,mt); setListe(getListe()); onRefresh(); };

  if(!liste.length) return (
    <div style={{ paddingTop:60, textAlign:"center", padding:"60px 20px" }}>
      <Bookmark size={36} color={C.soft} style={{ margin:"0 auto 14px", display:"block" }}/>
      <p style={{ fontSize:15, color:C.muted, fontWeight:600 }}>Sa liste dafa selu.</p>
      <p style={{ fontSize:12, color:C.soft, marginTop:8, lineHeight:1.7 }}>
        Ajoute des films depuis leur page.<br/>Clique sur "Liste" pour sauvegarder.
      </p>
    </div>
  );

  return (
    <div style={{ paddingTop:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"0 16px" }}>
        <FlagStripe/>
        <span style={{ fontSize:11, color:C.muted, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>
          {liste.length} titre{liste.length>1?"s":""}
        </span>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:12, padding:"0 16px" }}>
        {liste.map((item,i)=>(
          <div key={`${item.id}-${i}`} style={{ position:"relative" }}>
            <MediaCard item={item} onClick={onCardClick}/>
            <button onClick={()=>remove(item.id,item.media_type)}
              style={{ position:"absolute", top:-6, left:-6, width:20, height:20, borderRadius:99,
                background:C.red, border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}>
              <Trash2 size={9} color="#fff"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── BOTTOM NAV (mobile) ───────────────────────────────────────────────────────
const BottomNav: React.FC<{ active:string; setActive:(s:string)=>void; listeCount:number }> =
({ active, setActive, listeCount }) => {
  const NAV=[
    { id:"accueil",   label:"Accueil",  icon:Home },
    { id:"films",     label:"Films",    icon:Film },
    { id:"series",    label:"Séries",   icon:Tv },
    { id:"tendances", label:"Tendances",icon:TrendingUp },
    { id:"maListe",   label:"Liste",    icon:Eye },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      background:"rgba(8,6,4,0.96)", backdropFilter:"blur(24px)",
      borderTop:`1px solid ${C.border}`,
      display:"flex", paddingBottom:"env(safe-area-inset-bottom,8px)" }}>
      {NAV.map(item=>{
        const on=active===item.id; const Icon=item.icon;
        return (
          <button key={item.id} onClick={()=>setActive(item.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              gap:3, padding:"10px 0 8px", background:"transparent", border:"none",
              cursor:"pointer", position:"relative" }}>
            <Icon size={20} color={on?C.yellow:C.soft}/>
            <span style={{ fontSize:9, fontWeight:on?700:400, color:on?C.yellow:C.soft,
              letterSpacing:"0.04em" }}>{item.label}</span>
            {item.id==="maListe"&&listeCount>0&&(
              <div style={{ position:"absolute", top:7, right:"calc(50% - 16px)",
                minWidth:14, height:14, borderRadius:99, background:C.yellow,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:7, fontWeight:800, color:"#000", padding:"0 3px" }}>
                {listeCount}
              </div>
            )}
            {on && <motion.div layoutId="bottom-dot"
              style={{ position:"absolute", bottom:0, width:20, height:2,
                borderRadius:99, background:C.yellow }}/>}
          </button>
        );
      })}
    </div>
  );
};

// ── DESKTOP SIDEBAR ───────────────────────────────────────────────────────────
const Sidebar: React.FC<{ active:string; setActive:(s:string)=>void; listeCount:number }> =
({ active, setActive, listeCount }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const NAV=[
    { id:"accueil",   label:"Accueil",   icon:Home },
    { id:"films",     label:"Films",     icon:Film },
    { id:"series",    label:"Séries",    icon:Tv },
    { id:"tendances", label:"Tendances", icon:TrendingUp },
    { id:"maListe",   label:"Ma liste",  icon:Eye },
  ];

  return (
    <motion.aside animate={{ width:open?190:56 }} transition={{ type:"spring", stiffness:280, damping:28 }}
      style={{ position:"relative", display:"flex", flexDirection:"column", flexShrink:0, height:"100%",
        background:"rgba(8,6,4,0.72)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
        borderRight:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, padding:"24px 13px 26px" }}>
        <Logo size={21}/>
        <AnimatePresence>
          {open&&<motion.div initial={{ opacity:0,x:-5 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:C.text, lineHeight:1 }}>KAYSETANE</div>
            <FlagStripe width={55}/>
          </motion.div>}
        </AnimatePresence>
      </div>

      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2, padding:"0 7px" }}>
        {NAV.map(item=>{
          const on=active===item.id; const Icon=item.icon;
          return (
            <button key={item.id} onClick={()=>setActive(item.id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:12,
                width:"100%", cursor:"pointer", background:on?C.glassMd:"transparent",
                border:on?`1px solid ${C.border}`:"1px solid transparent", position:"relative" }}>
              <Icon size={15} color={on?C.text:C.soft} style={{ flexShrink:0 }}/>
              <AnimatePresence>
                {open&&<motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ fontSize:12, fontWeight:on?600:400, color:on?C.text:C.soft, whiteSpace:"nowrap", flex:1 }}>
                  {item.label}
                </motion.span>}
              </AnimatePresence>
              {item.id==="maListe"&&listeCount>0&&(
                <div style={{ position:"absolute", right:on?22:3, top:7, minWidth:15, height:15,
                  borderRadius:99, background:C.yellow, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:7, fontWeight:800, color:"#000", padding:"0 3px" }}>
                  {listeCount}
                </div>
              )}
              {on&&<motion.div layoutId="nav-dot"
                style={{ position:"absolute", right:8, width:2.5, height:16, borderRadius:99, background:C.yellow }}/>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"0 7px 8px" }}>
        {open&&<div style={{ borderRadius:9, overflow:"hidden", height:55, position:"relative", marginBottom:8 }}>
          <img src={imgMosque} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.4 }}/>
          <div style={{ position:"absolute", bottom:4, left:8, fontSize:7, color:C.soft, letterSpacing:"0.1em" }}>Made in Dakar 🇸🇳</div>
        </div>}
      </div>

      <div style={{ padding:"8px 7px 20px", borderTop:`1px solid ${C.border}` }}>
        <button onClick={()=>navigate("/")}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:12,
            width:"100%", cursor:"pointer", background:"transparent", border:"none", color:C.soft }}>
          <ArrowLeft size={15} style={{ flexShrink:0 }}/>{open&&<span style={{ fontSize:12 }}>Déconnexion</span>}
        </button>
      </div>

      <button onClick={()=>setOpen(!open)}
        style={{ position:"absolute", right:-11, top:28, width:22, height:22, borderRadius:99,
          background:C.yellow, border:"none", cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center", zIndex:10 }}>
        <motion.div animate={{ rotate:open?0:180 }}><ChevronRight size={11} color="#000"/></motion.div>
      </button>
    </motion.aside>
  );
};

// ── TABS ──────────────────────────────────────────────────────────────────────
const FREMBED_ROWS: Record<string,{label:string;loader:()=>Promise<any[]>}> = {
  vfMovies:  { label:"🇫🇷 Films en VF — Maintenant",    loader:()=>frembedMovies(1,"popular") },
  vfMovies2: { label:"🆕 Films VF — Récents",            loader:()=>frembedMovies(1,"latest")  },
  vfTV:      { label:"🇫🇷 Séries en VF — Maintenant",   loader:()=>frembedTV(1,"popular")     },
  vfTV2:     { label:"🆕 Séries VF — Récentes",          loader:()=>frembedTV(1,"latest")      },
};

const TABS: Record<string,any[]> = {
  accueil: [
    { k:"trW",  p:"/trending/all/week",  label:"🔥 Tendances" },
    { k:"popM", p:"/movie/popular",      label:"🎬 Films populaires" },
    { k:"popTV",p:"/tv/popular",         label:"📺 Séries populaires" },
    { k:"topM", p:"/movie/top_rated",    label:"⭐ Mieux notés" },
    { k:"nowM", p:"/movie/now_playing",  label:"🎭 Au cinéma" },
  ],
  films: [
    { k:"vfMovies",  p:"", label:"🇫🇷 Films VF maintenant", type:"frembed" },
    { k:"vfMovies2", p:"", label:"🆕 Films VF récents",      type:"frembed" },
    { k:"fpop", p:"/movie/popular",      label:"🔥 Populaires" },
    { k:"ftop", p:"/movie/top_rated",    label:"⭐ Les mieux notés" },
    { k:"fact", p:"/discover/movie",     label:"💥 Action",  params:{ with_genres:"28" } },
    { k:"fcom", p:"/discover/movie",     label:"😂 Comédie", params:{ with_genres:"35" } },
    { k:"fhor", p:"/discover/movie",     label:"👻 Horreur", params:{ with_genres:"27" } },
    { k:"fsci", p:"/discover/movie",     label:"🚀 Sci-Fi",  params:{ with_genres:"878" } },
  ],
  series: [
    { k:"vfTV",  p:"", label:"🇫🇷 Séries VF maintenant", type:"frembed" },
    { k:"vfTV2", p:"", label:"🆕 Séries VF récentes",     type:"frembed" },
    { k:"spop", p:"/tv/popular",         label:"🔥 Populaires" },
    { k:"stop", p:"/tv/top_rated",       label:"⭐ Les mieux notées" },
    { k:"sair", p:"/tv/on_the_air",      label:"📡 En diffusion" },
    { k:"sanim",p:"/discover/tv",        label:"🎌 Animation", params:{ with_genres:"16" } },
    { k:"scrim",p:"/discover/tv",        label:"🔍 Crime",     params:{ with_genres:"80" } },
  ],
  tendances: [
    { k:"tdW",  p:"/trending/all/week",  label:"Cette semaine" },
    { k:"tdMW", p:"/trending/movie/week",label:"Films · semaine" },
    { k:"tdTW", p:"/trending/tv/week",   label:"Séries · semaine" },
  ],
  maListe: [],
};

// ── SEARCH BAR MOBILE ─────────────────────────────────────────────────────────
const SearchBar: React.FC<{ query:string; onChange:(q:string)=>void; isMobile:boolean }> =
({ query, onChange, isMobile }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8,
    padding:"8px 14px", borderRadius:12,
    background:C.glass, border:`1px solid ${C.border}`,
    width: isMobile ? "100%" : 200 }}>
    <Search size={13} color={C.muted}/>
    <input type="text" placeholder="Seet film, série…" value={query}
      onChange={e=>onChange(e.target.value)}
      style={{ background:"transparent", border:"none", outline:"none",
        flex:1, fontSize:12, color:C.text }}/>
    {query&&<button onClick={()=>onChange("")}
      style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:0, display:"flex" }}>
      <X size={11}/></button>}
  </div>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab]             = useState("accueil");
  const [rows, setRows]           = useState<Record<string,any[]>>({});
  const [busy, setBusy]           = useState<Record<string,boolean>>({});
  const [heroItems, setHeroItems] = useState<any[]>([]);
  const [query, setQuery]         = useState("");
  const [searchRes, setSearchRes] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [player, setPlayer]       = useState<any>(null);
  const [detail, setDetail]       = useState<any>(null);
  const [stimer, setStimer]       = useState<ReturnType<typeof setTimeout>|null>(null);
  const [listeCount, setListeCount] = useState(getListe().length);
  const [showSearch, setShowSearch] = useState(false);
  const isMobile = useIsMobile();

  const refreshListe = () => setListeCount(getListe().length);

  const loadTab = useCallback(async (t:string) => {
    const cfg=TABS[t]||[];
    for (const row of cfg) {
      const { k,p,params={},type }=row as any;
      if(rows[k]!==undefined) continue;
      setBusy(prev=>({...prev,[k]:true}));
      if(type==="frembed") {
        const items=FREMBED_ROWS[k]?await FREMBED_ROWS[k].loader():[];
        setRows(prev=>({...prev,[k]:items})); setBusy(prev=>({...prev,[k]:false}));
      } else {
        const d=await tmdb(p,params);
        const items=(d?.results||[]).filter((r:any)=>r.poster_path).slice(0,20)
          .map((r:any)=>({...r,media_type:r.media_type||(p.includes("/tv")||p.includes("discover/tv")?"tv":"movie")}));
        setRows(prev=>({...prev,[k]:items})); setBusy(prev=>({...prev,[k]:false}));
        if(t==="accueil"&&k==="trW"&&items.length&&heroItems.length===0) setHeroItems(items.slice(0,8));
      }
    }
  }, [rows, heroItems]);

  useEffect(()=>{ loadTab(tab); }, [tab]);

  const doSearch=async(q:string)=>{
    if(!q.trim()){setSearchRes([]);setSearching(false);return;}
    setSearching(true);
    const [mv,tv]=await Promise.all([tmdb("/search/movie",{query:q}),tmdb("/search/tv",{query:q})]);
    setSearchRes([
      ...(mv?.results||[]).filter((r:any)=>r.poster_path).slice(0,12).map((r:any)=>({...r,media_type:"movie"})),
      ...(tv?.results||[]).filter((r:any)=>r.poster_path).slice(0,12).map((r:any)=>({...r,media_type:"tv"})),
    ]); setSearching(false);
  };

  const handleSearch=(q:string)=>{
    setQuery(q); if(stimer) clearTimeout(stimer);
    if(q) setStimer(setTimeout(()=>doSearch(q),400)); else setSearchRes([]);
  };

  const PAGE: Record<string,string> = { accueil:"Accueil", films:"Films yi", series:"Série yi", tendances:"Tendances", maListe:"Sa liste" };

  const mainContent = (
    <AnimatePresence mode="wait">
      <motion.div key={tab+query} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        transition={{ duration:0.2 }}>
        {query ? (
          <div style={{ paddingTop:16, padding: isMobile ? "16px 16px 0" : "16px 0 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <FlagStripe width={14} height={2}/>
              <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:C.soft }}>
                {searching?"Seet…":`${searchRes.length} résultat${searchRes.length>1?"s":""}`}
              </p>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {searchRes.map((item,i)=><MediaCard key={item.id||i} item={item} onClick={setDetail}/>)}
            </div>
          </div>
        ) : tab==="maListe" ? (
          <PageMaListe onCardClick={setDetail} onRefresh={refreshListe}/>
        ) : (
          <>
            {tab==="accueil"&&(
              <div style={{ padding: isMobile ? "12px 0 0" : "16px 0 0" }}>
                <div style={{ padding: isMobile ? "0 16px" : "0" }}>
                  <HeroBanner items={heroItems} onPlay={setPlayer} onDetail={setDetail}/>
                </div>
                {/* Featured row */}
                <div style={{ marginBottom:32 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12,
                    padding: isMobile ? "0 16px" : "0" }}>
                    <FlagStripe width={14} height={2}/>
                    <h2 style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em",
                      textTransform:"uppercase", color:C.muted }}>⭐ Films à ne pas manquer</h2>
                  </div>
                  <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none",
                    paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0, paddingBottom:4 }}>
                    {FEATURED.map((f,i)=><MediaCard key={i} item={{...f}} localImg={f.img} onClick={setDetail}/>)}
                  </div>
                </div>
                {/* Frembed VF rows on accueil */}
                {Object.entries(FREMBED_ROWS).map(([k,{label}])=>(
                  <MediaRow key={k} label={label}
                    items={rows[k]||[]} loading={!!busy[k]&&!rows[k]?.length}
                    onCardClick={setDetail}/>
                ))}
              </div>
            )}
            <div style={{ paddingTop:tab!=="accueil"?isMobile?12:20:0 }}>
              {(TABS[tab]||[]).map(({k,label})=>(
                <MediaRow key={k} label={label}
                  items={rows[k]||[]} loading={!!busy[k]&&!rows[k]?.length}
                  onCardClick={setDetail}/>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden",
      fontFamily:"'DM Sans','Satoshi',sans-serif", color:C.text, background:C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        *{box-sizing:border-box;} ::-webkit-scrollbar{display:none;}
        button{font-family:inherit;} input{font-family:inherit;}
      `}</style>

      <div style={{ position:"fixed", inset:0, zIndex:0, background:"linear-gradient(160deg,#100b06 0%,#0c0a08 50%,#080608 100%)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 90% 55% at 50% 0%,rgba(0,133,63,0.05) 0%,transparent 60%)" }}/>

      <div style={{ position:"relative", zIndex:10, display:"flex", width:"100%", height:"100%" }}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <Sidebar active={tab} listeCount={listeCount}
            setActive={t=>{ setTab(t); setQuery(""); setSearchRes([]); refreshListe(); }}/>
        )}

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden",
          paddingBottom: isMobile ? 64 : 0 }}>

          {/* Header */}
          <div style={{ flexShrink:0,
            padding: isMobile ? "12px 16px 8px" : "12px 24px 0",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            background: isMobile ? "rgba(8,6,4,0.9)" : "transparent",
            backdropFilter: isMobile ? "blur(24px)" : "none",
            borderBottom: isMobile ? `1px solid ${C.border}` : "none",
            position: isMobile ? "sticky" : "relative", top:0, zIndex:50 }}>

            {isMobile ? (
              <>
                {/* Mobile header */}
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Logo size={20}/>
                  <div>
                    <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.18em",
                      textTransform:"uppercase", color:C.text, lineHeight:1 }}>KAYSETANE</div>
                    <FlagStripe width={48} height={2}/>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <button onClick={()=>setShowSearch(!showSearch)}
                    style={{ width:34, height:34, borderRadius:10, background:C.glass,
                      border:`1px solid ${C.border}`, color:C.muted,
                      display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <Search size={15}/>
                  </button>
                  <div style={{ width:32, height:32, borderRadius:99, background:C.yellow,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:800, color:"#000" }}>MN</div>
                </div>
              </>
            ) : (
              <>
                {/* Desktop header */}
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <FlagStripe width={16} height={2}/>
                  <h1 style={{ fontSize:11, fontWeight:500, color:C.soft,
                    letterSpacing:"0.1em", textTransform:"uppercase" }}>{PAGE[tab]}</h1>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <SearchBar query={query} onChange={handleSearch} isMobile={false}/>
                  <button style={{ position:"relative", width:32, height:32, borderRadius:99,
                    background:C.glass, border:`1px solid ${C.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <Bell size={12} color={C.muted}/>
                    <span style={{ position:"absolute", top:7, right:7, width:4, height:4, borderRadius:99, background:C.yellow }}/>
                  </button>
                  <div style={{ width:32, height:32, borderRadius:99, background:C.yellow,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:800, color:"#000", cursor:"pointer" }}>MN</div>
                </div>
              </>
            )}
          </div>

          {/* Mobile search expand */}
          <AnimatePresence>
            {isMobile && showSearch && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                exit={{ height:0, opacity:0 }}
                style={{ padding:"8px 16px", background:"rgba(8,6,4,0.9)",
                  backdropFilter:"blur(24px)", borderBottom:`1px solid ${C.border}`, overflow:"hidden" }}>
                <SearchBar query={query} onChange={q=>{ handleSearch(q); if(!q) setShowSearch(false); }} isMobile={true}/>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main scroll */}
          <main style={{ flex:1, overflowY:"auto", scrollbarWidth:"none",
            WebkitOverflowScrolling:"touch" }}>
            {mainContent}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <BottomNav active={tab} listeCount={listeCount}
          setActive={t=>{ setTab(t); setQuery(""); setSearchRes([]); setShowSearch(false); refreshListe(); }}/>
      )}

      <AnimatePresence>
        {detail&&<DetailModal key="detail" item={detail}
          onClose={()=>{ setDetail(null); refreshListe(); }}
          onPlay={it=>{ setDetail(null); setPlayer(it); }}/>}
      </AnimatePresence>
      <AnimatePresence>
        {player&&<PlayerModal key="player" item={player} onClose={()=>setPlayer(null)}/>}
      </AnimatePresence>
    </div>
  );
}