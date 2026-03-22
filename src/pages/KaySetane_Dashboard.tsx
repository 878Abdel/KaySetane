"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Search, Bell, ChevronRight, Plus, Star,
  Tv, Film, TrendingUp, Home, Eye, X, ArrowLeft,
  Bookmark, BookmarkCheck, Trash2,
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

// ── UTILS ─────────────────────────────────────────────────────────────────────
const FlagStripe: React.FC<{ width?:number; height?:number }> = ({ width=36, height=2 }) => (
  <div style={{ display:"flex", height, borderRadius:99, overflow:"hidden", width, flexShrink:0 }}>
    <div style={{ flex:1, background:C.green }}/><div style={{ flex:1, background:C.yellow }}/>
    <div style={{ flex:1, background:C.red }}/>
  </div>
);

const Logo: React.FC<{ size?:number }> = ({ size=28 }) => (
  <img src={imgStatuette} alt="KaySetane"
    style={{ width:size, height:Math.round(size*1.6), objectFit:"contain",
      objectPosition:"center top", filter:"brightness(0.9) contrast(1.1) sepia(0.1)",
      mixBlendMode:"screen" }}/>
);

// ── MA LISTE — localStorage ───────────────────────────────────────────────────
const LISTE_KEY = "kaysetane_liste";
const getListe = (): any[] => { try { return JSON.parse(localStorage.getItem(LISTE_KEY)||"[]"); } catch { return []; } };
const saveListe = (items:any[]) => localStorage.setItem(LISTE_KEY, JSON.stringify(items));

const addToListe = (item:any) => {
  const l = getListe();
  if (l.find((i:any)=>i.id===item.id && i.media_type===item.media_type)) return;
  saveListe([{ id:item.id, title:mediaTitle(item), poster_path:item.poster_path,
    media_type:item.media_type||"movie", year:mediaYear(item),
    vote_average:item.vote_average, frembed_link:item.frembed_link||null,
    version:item.version||null, savedAt:Date.now() }, ...l]);
};
const removeFromListe = (id:number, mt:string) => saveListe(getListe().filter((i:any)=>!(i.id===id && i.media_type===mt)));
const isInListe = (id:number, mt:string) => getListe().some((i:any)=>i.id===id && i.media_type===mt);

// ── PROGRESS — localStorage ───────────────────────────────────────────────────
const PROG_KEY = "kaysetane_progress";
const getProgress = (): Record<string,any> => { try { return JSON.parse(localStorage.getItem(PROG_KEY)||"{}"); } catch { return {}; } };
const saveProgress = (key:string, data:any) => {
  const p = getProgress(); p[key] = data; localStorage.setItem(PROG_KEY, JSON.stringify(p));
};

// ── TMDB ──────────────────────────────────────────────────────────────────────
const TMDB_KEY  = "7340fd92d1c2bdec987f215f33c56717";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE  = "https://image.tmdb.org/t/p/";

const SOURCES = [
  { name:"🇫🇷 Frembed VF",
    fn:(id:number,tv:boolean,s=1,e=1) => tv ? `https://frembed.bond/embed/serie/${id}?sa=${s}&epi=${e}` : `https://frembed.bond/embed/movie/${id}` },
  { name:"Source 2",
    fn:(id:number,tv:boolean,s=1,e=1) => tv ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` : `https://vidsrc.xyz/embed/movie/${id}` },
  { name:"Source 3",
    fn:(id:number,tv:boolean,s=1,e=1) => tv ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${id}&tmdb=1` },
];

async function tmdb(path:string, params:Record<string,string>={}) {
  try {
    const u = new URL(TMDB_BASE+path);
    u.searchParams.set("api_key",TMDB_KEY); u.searchParams.set("language","fr-FR");
    u.searchParams.set("region","FR"); u.searchParams.set("include_adult","false");
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    const r = await fetch(u.toString()); if (!r.ok) throw new Error(String(r.status));
    return r.json();
  } catch(e) { console.error("TMDB:",path,e); return null; }
}

async function tmdbFB(path:string, params:Record<string,string>={}) {
  const d = await tmdb(path,params);
  if (d && !d.overview) { const fb = await tmdb(path,{...params,language:"en-US"}); if (fb?.overview) d.overview=fb.overview; }
  return d;
}

const imgUrl = (path?:string|null, size="w342") => {
  if (!path) return null;
  return path.startsWith("http") ? path : IMG_BASE+size+path;
};

const mediaTitle = (item:any) => item?.title||item?.name||"";
const mediaYear  = (item:any) => (item?.release_date||item?.first_air_date||"").slice(0,4);
const isTV = (item:any) => item?.media_type==="tv"||item?.type==="tv";

const embedSrc = (item:any, si=0, s=1, e=1) => {
  if (si===0 && (item as any).frembed_link) {
    const lk = (item as any).frembed_link as string;
    return isTV(item) ? lk.replace(/sa=\d+/,`sa=${s}`).replace(/epi=\d+/,`epi=${e}`) : lk;
  }
  return SOURCES[si].fn(item.id, isTV(item), s, e);
};

// ── FREMBED API ───────────────────────────────────────────────────────────────
const FREMBED = "https://frembed.bond/api/public/v1";

async function frembedMovies(page=1, order="popular") {
  try {
    const r = await fetch(`${FREMBED}/movies?limit=20&page=${page}&order=${order}`);
    const d = await r.json();
    return (d?.result?.items||[]).map((i:any)=>({
      id:Number(i.tmdb), title:i.title, release_date:i.year?`${i.year}-01-01`:"",
      poster_path:i.poster||null, vote_average:0, media_type:"movie",
      frembed_link:i.link, version:i.version||"VF",
    }));
  } catch { return []; }
}

async function frembedTV(page=1, order="popular") {
  try {
    const r = await fetch(`${FREMBED}/tv?limit=20&page=${page}&order=${order}`);
    const d = await r.json();
    const seen = new Set<string>();
    return (d?.result?.items||[])
      .filter((i:any)=>{ if(seen.has(i.tmdb)) return false; seen.add(i.tmdb); return true; })
      .map((i:any)=>({
        id:Number(i.tmdb), name:i.title, first_air_date:i.year?`${i.year}-01-01`:"",
        poster_path:null, vote_average:0, media_type:"tv",
        frembed_link:i.link, version:i.version||"VF",
      }));
  } catch { return []; }
}

// ── FEATURED ──────────────────────────────────────────────────────────────────
const FEATURED = [
  { id:807,    title:"Superman",        year:"2025", img:posterSuperman,     media_type:"movie", accent:C.yellow, overview:"Le Héros de Krypton revient dans une aventure épique signée James Gunn." },
  { id:37165,  title:"The Truman Show", year:"1998", img:posterTrumanShow,   media_type:"movie", accent:C.green,  overview:"Un homme découvre que toute sa vie est un show télévisé diffusé en direct." },
  { id:475557, title:"Joker",           year:"2019", img:posterJoker,        media_type:"movie", accent:C.red,    overview:"L'origine sombre du clown criminel le plus célèbre de Gotham." },
  { id:872585, title:"Oppenheimer",     year:"2023", img:posterOppenheimer,  media_type:"movie", accent:C.yellow, overview:"Le père de la bombe atomique et le poids moral d'une invention qui changea le monde." },
  { id:157336, title:"Interstellar",    year:"2014", img:posterInterstellar, media_type:"movie", accent:C.green,  overview:"Un voyage à travers les étoiles pour sauver l'humanité d'une Terre mourante." },
];

// ── SKELETON ──────────────────────────────────────────────────────────────────
const Skel: React.FC = () => (
  <div style={{ flexShrink:0, width:140, height:210, borderRadius:14,
    background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize:"600px 100%", animation:"shimmer 1.4s infinite" }}/>
);

// ── MEDIA CARD ────────────────────────────────────────────────────────────────
const MediaCard: React.FC<{ item:any; onClick:(i:any)=>void; localImg?:string }> =
({ item, onClick, localImg }) => {
  const [hov, setHov] = useState(false);
  const poster = localImg || imgUrl(item.poster_path);
  const t = mediaTitle(item);
  const tv = isTV(item);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "";
  const hasVF = !!(item.frembed_link || item.version);
  const inL = isInListe(item.id, item.media_type||"movie");
  const prog = getProgress()[String(item.id)];

  return (
    <motion.div whileHover={{ scale:1.06 }} transition={{ duration:0.2 }}
      onClick={()=>onClick(item)} onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      style={{ flexShrink:0, width:140, borderRadius:14, overflow:"hidden", position:"relative",
        cursor:"pointer", boxShadow:hov?"0 24px 56px rgba(0,0,0,0.8)":"0 4px 16px rgba(0,0,0,0.5)" }}>

      {poster
        ? <img src={poster} alt={t} loading="lazy" style={{ width:140, height:210, objectFit:"cover", display:"block" }}/>
        : <div style={{ width:140, height:210, background:"rgba(255,255,255,0.04)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:8 }}>
            <span style={{ fontSize:9, color:C.soft, textAlign:"center" }}>{t}</span>
          </div>}

      <motion.div animate={{ opacity:hov?1:0 }}
        style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.2) 55%,transparent 100%)",
          display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"10px 8px" }}>
        <p style={{ fontSize:11, fontWeight:600, color:C.text, lineHeight:1.3, marginBottom:2 }}>{t}</p>
        <p style={{ fontSize:9, color:C.muted, marginBottom:8 }}>{tv?"Série":"Film"}</p>
        <div style={{ display:"flex", justifyContent:"center" }}>
          <div style={{ width:34, height:34, borderRadius:99, background:C.yellow,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Play size={12} color="#000" fill="#000"/>
          </div>
        </div>
      </motion.div>

      {/* VF badge */}
      {hasVF && (
        <div style={{ position:"absolute", top:7, left:7, background:"rgba(0,133,63,0.88)",
          backdropFilter:"blur(8px)", borderRadius:5, padding:"2px 6px",
          fontSize:7, fontWeight:800, color:"#fff", letterSpacing:"0.12em" }}>
          {item.version||"VF"}
        </div>
      )}

      {/* Rating (when no VF badge) */}
      {rating && !hasVF && (
        <div style={{ position:"absolute", top:7, left:7, background:"rgba(0,0,0,0.65)",
          borderRadius:6, padding:"2px 6px", display:"flex", alignItems:"center", gap:3 }}>
          <Star size={8} color={C.yellow} fill={C.yellow}/>
          <span style={{ fontSize:8, fontWeight:700, color:C.yellow }}>{rating}</span>
        </div>
      )}

      {/* Type badge */}
      <div style={{ position:"absolute", top:7, right:7,
        background:tv?"rgba(0,133,63,0.18)":"rgba(255,255,255,0.07)",
        border:`1px solid ${tv?"rgba(0,133,63,0.4)":C.border}`,
        borderRadius:6, padding:"2px 6px", fontSize:7, fontWeight:700,
        color:tv?C.green:C.muted, textTransform:"uppercase" }}>{tv?"TV":"Film"}</div>

      {/* Bookmark */}
      {inL && (
        <div style={{ position:"absolute", top:27, right:7, width:18, height:18,
          borderRadius:5, background:"rgba(253,239,66,0.9)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <BookmarkCheck size={10} color="#000"/>
        </div>
      )}

      {/* Progress bar */}
      {prog?.pct > 2 && (
        <div style={{ position:"absolute", bottom:2, left:0, right:0, height:3, background:"rgba(0,0,0,0.5)" }}>
          <div style={{ width:`${prog.pct}%`, height:"100%", background:C.yellow, borderRadius:"0 2px 2px 0" }}/>
        </div>
      )}

      <div style={{ position:"absolute", bottom:prog?.pct>2?5:0, left:0, right:0, height:2, display:"flex" }}>
        <div style={{ flex:1, background:C.green, opacity:hov?1:0.28, transition:"opacity 0.2s" }}/>
        <div style={{ flex:1, background:C.yellow, opacity:hov?1:0.28, transition:"opacity 0.2s" }}/>
        <div style={{ flex:1, background:C.red, opacity:hov?1:0.28, transition:"opacity 0.2s" }}/>
      </div>
    </motion.div>
  );
};

// ── MEDIA ROW ─────────────────────────────────────────────────────────────────
const MediaRow: React.FC<{ label:string; items:any[]; loading:boolean; onCardClick:(i:any)=>void }> =
({ label, items, loading, onCardClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ marginBottom:40 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <FlagStripe width={18} height={2}/>
          <h2 style={{ fontSize:11, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:C.muted }}>{label}</h2>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["‹","›"].map((ch,i)=>(
            <button key={i} onClick={()=>ref.current?.scrollBy({left:i===0?-380:380,behavior:"smooth"})}
              style={{ width:26, height:26, borderRadius:99, background:C.glass, border:`1px solid ${C.border}`,
                color:C.muted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=C.borderHi;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=C.border;}}>{ch}</button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
        {loading ? Array.from({length:10}).map((_,i)=><Skel key={i}/>)
          : items.map((item,i)=><MediaCard key={`${item.id}-${i}`} item={item} onClick={onCardClick}/>)}
      </div>
    </div>
  );
};

// ── HERO — auto-slide 8s ──────────────────────────────────────────────────────
const HeroBanner: React.FC<{ items:any[]; onPlay:(i:any)=>void; onDetail:(i:any)=>void }> =
({ items, onPlay, onDetail }) => {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const pool = items.length > 0 ? items : FEATURED;

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>setIdx(i=>(i+1)%pool.length), 8000);
  }, [pool.length]);

  useEffect(()=>{ restart(); return ()=>{ if(timerRef.current) clearInterval(timerRef.current); }; }, [restart]);

  const goTo = (i:number) => { setIdx(i); restart(); };
  const f = pool[idx]||pool[0];
  const isLocal = !!(f as any).img;
  const backdrop = isLocal ? (f as any).img : imgUrl(f.backdrop_path,"original");
  const t = isLocal ? (f as any).title : mediaTitle(f);
  const y = isLocal ? (f as any).year : mediaYear(f);
  const tv = !isLocal && isTV(f);
  const rating = !isLocal && f.vote_average ? f.vote_average.toFixed(1) : "";
  const overview = isLocal ? (f as any).overview : (f.overview||"");
  const hasVF = !!(f as any).frembed_link || isLocal;

  return (
    <div style={{ position:"relative", height:440, borderRadius:24, overflow:"hidden", marginBottom:40 }}>
      <AnimatePresence mode="sync">
        <motion.div key={idx} initial={{ opacity:0, scale:1.04 }} animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0 }} transition={{ duration:0.7 }}
          style={{ position:"absolute", inset:0 }}>
          {backdrop && <img src={backdrop} alt={t}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 20%" }}/>}
        </motion.div>
      </AnimatePresence>

      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to right,rgba(12,10,8,0.95) 0%,rgba(12,10,8,0.55) 55%,transparent 100%)" }}/>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to top,rgba(12,10,8,0.92) 0%,transparent 55%)" }}/>

      <motion.div key={`c${idx}`} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, delay:0.2 }}
        style={{ position:"absolute", inset:0, padding:"36px 44px",
          display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>

        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <FlagStripe width={26}/>
          {hasVF && <span style={{ fontSize:8, fontWeight:800, color:"#fff",
            background:"rgba(0,133,63,0.88)", borderRadius:99, padding:"2px 8px", letterSpacing:"0.15em" }}>VF</span>}
          {rating && (
            <div style={{ display:"flex", alignItems:"center", gap:3,
              background:`${C.yellow}18`, border:`1px solid ${C.yellow}30`, borderRadius:99, padding:"2px 8px" }}>
              <Star size={8} color={C.yellow} fill={C.yellow}/>
              <span style={{ fontSize:9, fontWeight:700, color:C.yellow }}>{rating}</span>
            </div>
          )}
          {y && <span style={{ fontSize:9, color:C.soft, background:"rgba(255,255,255,0.06)", borderRadius:99, padding:"2px 8px" }}>{y}</span>}
          {!isLocal && <span style={{ fontSize:7, fontWeight:700, padding:"2px 8px", borderRadius:99,
            background:tv?"rgba(0,133,63,0.15)":"rgba(255,255,255,0.06)",
            border:`1px solid ${tv?"rgba(0,133,63,0.35)":C.border}`,
            color:tv?C.green:C.muted, textTransform:"uppercase" }}>{tv?"SÉRIE":"FILM"}</span>}
        </div>

        <h1 style={{ fontSize:"clamp(26px,4vw,52px)", fontWeight:800,
          letterSpacing:"-0.04em", color:C.text, lineHeight:1, marginBottom:10 }}>{t}</h1>
        {overview && (
          <p style={{ fontSize:12, color:C.muted, lineHeight:1.65, maxWidth:460, marginBottom:20,
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{overview}</p>
        )}

        <div style={{ display:"flex", gap:12 }}>
          <button onClick={()=>onPlay(f)}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 26px",
              borderRadius:99, background:C.yellow, color:"#000", fontSize:12, fontWeight:700,
              cursor:"pointer", border:"none", transition:"transform 0.2s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.04)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";}}>
            <Play size={13} fill="currentColor"/> Regarder
          </button>
          <button onClick={()=>onDetail(f)}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 22px",
              borderRadius:99, background:C.glass, backdropFilter:"blur(12px)",
              border:`1px solid ${C.border}`, color:C.muted, fontSize:12, cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=C.borderHi; (e.currentTarget as HTMLElement).style.color=C.text; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=C.border; (e.currentTarget as HTMLElement).style.color=C.muted; }}>
            <Plus size={13}/> Ma liste
          </button>
        </div>
      </motion.div>

      {/* Dots */}
      <div style={{ position:"absolute", bottom:14, right:20, display:"flex", gap:5, alignItems:"center" }}>
        {pool.slice(0,Math.min(pool.length,8)).map((_,i)=>(
          <button key={i} onClick={()=>goTo(i)}
            style={{ width:idx===i?20:6, height:6, borderRadius:99, padding:0,
              background:idx===i?C.yellow:"rgba(255,255,255,0.25)",
              border:"none", cursor:"pointer", transition:"all 0.3s" }}/>
        ))}
      </div>

      {/* Timer bar */}
      <motion.div key={`t${idx}`} initial={{ scaleX:0 }} animate={{ scaleX:1 }}
        transition={{ duration:8, ease:"linear" }}
        style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
          background:C.yellow, opacity:0.35, transformOrigin:"left" }}/>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, display:"flex" }}>
        <div style={{ flex:1, background:C.green }}/><div style={{ flex:1, background:C.yellow }}/><div style={{ flex:1, background:C.red }}/>
      </div>
    </div>
  );
};

// ── FEATURED ROW ──────────────────────────────────────────────────────────────
const FeaturedRow: React.FC<{ onCardClick:(i:any)=>void }> = ({ onCardClick }) => (
  <div style={{ marginBottom:40 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
      <FlagStripe width={18} height={2}/>
      <h2 style={{ fontSize:11, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:C.muted }}>⭐ Films à ne pas manquer</h2>
    </div>
    <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
      {FEATURED.map((f,i)=><MediaCard key={i} item={{...f}} localImg={f.img} onClick={onCardClick}/>)}
    </div>
  </div>
);

// ── PLAYER — auto-fallback ────────────────────────────────────────────────────
const PlayerModal: React.FC<{ item:any; onClose:()=>void }> = ({ item, onClose }) => {
  const [season, setSeason]   = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasons, setSeasons] = useState<number[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [si, setSi]           = useState(0);
  const [fallbackBanner, setFallbackBanner] = useState(false);
  const fbTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const tv = isTV(item);
  const t = (item as any).title || mediaTitle(item);
  const isLocal = !!(item as any).img;

  useEffect(()=>{
    if (!tv||isLocal) return;
    tmdb(`/tv/${item.id}`).then(d=>{ if(d) setSeasons(Array.from({length:d.number_of_seasons||1},(_,i)=>i+1)); });
  },[item.id,tv]);

  useEffect(()=>{ if (!tv||isLocal) return; tmdb(`/tv/${item.id}/season/${season}`).then(d=>setEpisodes(d?.episodes||[])); },[item.id,tv,season]);

  // Auto-fallback: show banner after 12s if Frembed selected
  useEffect(()=>{
    setFallbackBanner(false);
    if (fbTimer.current) clearTimeout(fbTimer.current);
    if (si===0 && !isLocal) fbTimer.current = setTimeout(()=>setFallbackBanner(true), 12000);
    return ()=>{ if(fbTimer.current) clearTimeout(fbTimer.current); };
  },[si, season, episode]);

  const src = isLocal
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(t+" bande annonce")}`
    : embedSrc(item, si, season, episode);

  const epList = episodes.length > 0 ? episodes : Array.from({length:12},(_,i)=>({episode_number:i+1,name:`Épisode ${i+1}`}));

  // Save progress on play
  useEffect(()=>{ saveProgress(String(item.id),{ pct:10, title:t, season:tv?season:undefined, episode:tv?episode:undefined, updatedAt:Date.now() }); },[]);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"#000", display:"flex", flexDirection:"column" }}>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 20px", borderBottom:`1px solid ${C.border}`, flexShrink:0, background:"rgba(8,6,4,0.97)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Logo size={20}/>
          <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.18em", textTransform:"uppercase", color:C.text }}>KAYSETANE</span>
          <span style={{ color:C.soft }}>›</span>
          <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{t}</span>
          {tv&&!isLocal&&<span style={{ fontSize:10, color:C.muted, background:"rgba(255,255,255,0.06)", padding:"3px 8px", borderRadius:6 }}>S{season}·E{episode}</span>}
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {!isLocal && (
            <div style={{ display:"flex", gap:4, padding:"4px 6px", borderRadius:99, background:C.glass, border:`1px solid ${C.border}` }}>
              {SOURCES.map((s,i)=>(
                <button key={i} onClick={()=>{ setSi(i); setFallbackBanner(false); }}
                  style={{ padding:"4px 12px", borderRadius:99, fontSize:10, fontWeight:600,
                    cursor:"pointer", background:si===i?C.yellow:"transparent",
                    color:si===i?"#000":C.muted, border:"none", transition:"all 0.15s" }}>{s.name}</button>
              ))}
            </div>
          )}
          <a href={src} target="_blank" rel="noreferrer"
            style={{ padding:"6px 14px", borderRadius:8, background:C.glass, border:`1px solid ${C.border}`, color:C.muted, fontSize:11, textDecoration:"none" }}>↗ Ouvrir</a>
          <button onClick={onClose}
            style={{ width:32, height:32, borderRadius:99, background:C.glass, border:`1px solid ${C.border}`,
              color:C.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={14}/>
          </button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden", position:"relative" }}>
        <div style={{ flex:1, position:"relative" }}>
          {isLocal ? (
            <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:24, background:"rgba(12,10,8,0.95)" }}>
              <img src={(item as any).img} alt={t} style={{ width:220, borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.8)" }}/>
              <p style={{ fontSize:14, color:C.muted, textAlign:"center", maxWidth:340, lineHeight:1.7 }}>{(item as any).overview}</p>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(t+" bande annonce")}`}
                target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 28px",
                  borderRadius:99, background:C.yellow, color:"#000", fontSize:12, fontWeight:700, textDecoration:"none" }}>
                <Play size={13} fill="#000"/> Voir la bande annonce
              </a>
            </div>
          ) : (
            <iframe src={src} width="100%" height="100%" frameBorder="0"
              allowFullScreen allow="autoplay;fullscreen;picture-in-picture;encrypted-media"
              style={{ display:"block", border:"none", width:"100%", height:"100%" }}
              onLoad={()=>{ if(fbTimer.current) clearTimeout(fbTimer.current); setFallbackBanner(false); }}/>
          )}

          {/* Auto-fallback banner */}
          <AnimatePresence>
            {fallbackBanner && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ position:"absolute", inset:0, background:"rgba(8,6,4,0.92)", backdropFilter:"blur(8px)",
                  display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", gap:16, zIndex:10 }}>
                <p style={{ fontSize:13, color:C.muted, textAlign:"center", maxWidth:320 }}>
                  Frembed VF ne répond pas pour ce titre.<br/>
                  <span style={{ color:C.soft, fontSize:11 }}>Basculer automatiquement sur Source 2 ?</span>
                </p>
                <div style={{ display:"flex", gap:12 }}>
                  <button onClick={()=>{ setSi(1); setFallbackBanner(false); }}
                    style={{ padding:"10px 24px", borderRadius:99, background:C.yellow,
                      color:"#000", fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>
                    ✓ Utiliser Source 2
                  </button>
                  <button onClick={()=>setFallbackBanner(false)}
                    style={{ padding:"10px 24px", borderRadius:99, background:C.glass,
                      border:`1px solid ${C.border}`, color:C.muted, fontSize:12, cursor:"pointer" }}>
                    Patienter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Episode sidebar */}
        {tv && !isLocal && (
          <div style={{ width:252, background:"rgba(6,4,2,0.99)", borderLeft:`1px solid ${C.border}`,
            display:"flex", flexDirection:"column", flexShrink:0 }}>
            {seasons.length > 1 && (
              <div style={{ padding:12, borderBottom:`1px solid ${C.border}` }}>
                <p style={{ fontSize:8, fontWeight:600, color:C.soft, textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:8 }}>Saison</p>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {seasons.map(s=>(
                    <button key={s} onClick={()=>{ setSeason(s); setEpisode(1); }}
                      style={{ padding:"4px 11px", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer",
                        background:season===s?C.yellow:C.glass, color:season===s?"#000":C.muted,
                        border:season===s?"none":`1px solid ${C.border}`, transition:"all 0.15s" }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ flex:1, overflowY:"auto", padding:8 }}>
              {epList.map((ep:any)=>{
                const n=ep.episode_number||1; const active=episode===n;
                const prog = getProgress()[`${item.id}_s${season}e${n}`];
                return (
                  <div key={n} onClick={()=>{ setEpisode(n); saveProgress(`${item.id}_s${season}e${n}`,{ pct:10, title:t, season, episode:n, updatedAt:Date.now() }); }}
                    style={{ padding:"9px 11px", borderRadius:10, marginBottom:3, cursor:"pointer",
                      display:"flex", gap:9, alignItems:"center",
                      background:active?"rgba(253,239,66,0.08)":"transparent",
                      border:`1px solid ${active?"rgba(253,239,66,0.2)":"transparent"}`, transition:"all 0.15s" }}>
                    <div style={{ width:28, height:28, borderRadius:7, flexShrink:0,
                      background:active?C.yellow:C.glass, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {active?<Play size={10} color="#000" fill="#000"/>:<span style={{ fontSize:9, fontWeight:600, color:C.soft }}>{n}</span>}
                    </div>
                    <div style={{ flex:1, overflow:"hidden" }}>
                      <p style={{ fontSize:11, fontWeight:active?600:400, color:active?C.yellow:C.text,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{ep.name||`Épisode ${n}`}</p>
                      {ep.runtime&&<p style={{ fontSize:9, color:C.soft, marginTop:1 }}>{ep.runtime} min</p>}
                      {prog?.pct>2&&<div style={{ marginTop:4, height:2, borderRadius:99, background:"rgba(255,255,255,0.1)" }}>
                        <div style={{ width:`${prog.pct}%`, height:"100%", borderRadius:99, background:C.yellow }}/></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
  const tv = isTV(item); const isLocal = !!(item as any).img;

  useEffect(()=>{
    setInL(isInListe(item.id, item.media_type||"movie"));
    if (isLocal) return;
    Promise.all([tmdbFB(`/${tv?"tv":"movie"}/${item.id}`), tmdb(`/${tv?"tv":"movie"}/${item.id}/similar`)])
      .then(([d,s])=>{ setInfo(d);
        setSimilar((s?.results||[]).filter((r:any)=>r.poster_path).slice(0,8)
          .map((r:any)=>({...r,media_type:tv?"tv":"movie"}))); });
  },[item.id,tv,isLocal]);

  const data=info||item;
  const backdrop=isLocal?(item as any).img:imgUrl(data.backdrop_path,"original");
  const poster=isLocal?(item as any).img:imgUrl(data.poster_path,"w500");
  const t=isLocal?(item as any).title:mediaTitle(data);
  const rating=!isLocal&&data.vote_average?data.vote_average.toFixed(1):"";
  const y=isLocal?(item as any).year:mediaYear(data);
  const hasVF=!!(item.frembed_link||(item as any).img);
  const prog=getProgress()[String(item.id)];

  const toggleL=()=>{ if(inL){removeFromListe(item.id,item.media_type||"movie");setInL(false);}
    else{addToListe({...item,...(info||{})});setInL(true);} };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, zIndex:900, background:"rgba(0,0,0,0.78)",
        backdropFilter:"blur(8px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <motion.div initial={{ y:60 }} animate={{ y:0 }}
        style={{ width:"100%", maxWidth:860, maxHeight:"90vh", overflowY:"auto",
          background:"rgba(14,11,8,0.98)", backdropFilter:"blur(32px)", borderRadius:"24px 24px 0 0",
          scrollbarWidth:"none", border:`1px solid ${C.border}`, borderBottom:"none" }}>

        <div style={{ position:"relative", height:280, overflow:"hidden", borderRadius:"24px 24px 0 0" }}>
          {backdrop&&<img src={backdrop} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:isLocal?"center top":"center 30%" }} alt=""/>}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(14,11,8,0.98) 0%,transparent 55%)" }}/>
          <button onClick={onClose}
            style={{ position:"absolute", top:14, right:14, width:36, height:36, borderRadius:99,
              background:"rgba(0,0,0,0.6)", border:`1px solid ${C.border}`, color:C.text,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={16}/>
          </button>
        </div>

        <div style={{ padding:"0 28px 36px" }}>
          <div style={{ display:"flex", gap:20, marginTop:-52, position:"relative", zIndex:1 }}>
            {poster&&<img src={poster} style={{ width:96, borderRadius:12, flexShrink:0, objectFit:"cover", boxShadow:"0 16px 40px rgba(0,0,0,0.8)" }} alt=""/>}
            <div style={{ flex:1, paddingTop:58 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <h2 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", color:C.text, lineHeight:1.1 }}>{t}</h2>
                <button onClick={toggleL}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:99,
                    background:inL?`${C.yellow}18`:C.glass, border:`1px solid ${inL?C.yellow+"44":C.border}`,
                    color:inL?C.yellow:C.muted, fontSize:10, fontWeight:600, cursor:"pointer",
                    transition:"all 0.2s", flexShrink:0, marginLeft:12 }}>
                  {inL?<><BookmarkCheck size={12}/> Sauvegardé</>:<><Bookmark size={12}/> Ma liste</>}
                </button>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginTop:8, marginBottom:8 }}>
                {hasVF&&<span style={{ fontSize:8, fontWeight:800, color:"#fff", background:"rgba(0,133,63,0.88)", borderRadius:99, padding:"2px 8px" }}>VF</span>}
                {rating&&<div style={{ display:"flex", alignItems:"center", gap:4 }}><Star size={10} color={C.yellow} fill={C.yellow}/><span style={{ fontSize:11, color:C.yellow, fontWeight:700 }}>{rating}</span></div>}
                {y&&<span style={{ fontSize:11, color:C.muted }}>· {y}</span>}
                <FlagStripe width={18} height={2}/>
              </div>
              {prog?.pct>2&&(
                <div style={{ marginBottom:8 }}>
                  <div style={{ height:3, borderRadius:99, background:"rgba(255,255,255,0.08)" }}>
                    <div style={{ width:`${prog.pct}%`, height:"100%", borderRadius:99, background:C.yellow }}/>
                  </div>
                  <p style={{ fontSize:9, color:C.soft, marginTop:3 }}>{prog.pct}% regardé{prog.season?` · S${prog.season} E${prog.episode}`:""}</p>
                </div>
              )}
              {!isLocal&&info?.genres?.length>0&&(
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {info.genres.slice(0,4).map((g:any)=>(
                    <span key={g.id} style={{ fontSize:9, padding:"3px 9px", borderRadius:99, background:C.glass, border:`1px solid ${C.border}`, color:C.muted }}>{g.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(isLocal?(item as any).overview:(data.overview||""))&&(
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.8, marginTop:18 }}>
              {isLocal?(item as any).overview:data.overview}
            </p>
          )}

          <div style={{ marginTop:20 }}>
            <button onClick={()=>{ onClose(); onPlay(item); }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 24px",
                borderRadius:99, background:C.yellow, color:"#000", fontSize:12, fontWeight:700,
                cursor:"pointer", border:"none", transition:"transform 0.2s" }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.03)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";}}>
              <Play size={13} fill="currentColor"/> {prog?.pct>2?"Reprendre":"Regarder"}
            </button>
          </div>

          {similar.length>0&&(
            <div style={{ marginTop:28 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <FlagStripe width={14} height={2}/>
                <h3 style={{ fontSize:9, fontWeight:600, letterSpacing:"0.25em", textTransform:"uppercase", color:C.soft }}>Similaires</h3>
              </div>
              <div style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none" }}>
                {similar.map((s,i)=><MediaCard key={s.id||i} item={s} onClick={it=>{ onClose(); setTimeout(()=>onPlay(it),100); }}/>)}
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

  if (liste.length===0) return (
    <div style={{ paddingTop:60, textAlign:"center" }}>
      <Bookmark size={40} color={C.soft} style={{ margin:"0 auto 16px" }}/>
      <p style={{ fontSize:16, color:C.muted, fontWeight:600 }}>Sa liste dafa selu.</p>
      <p style={{ fontSize:12, color:C.soft, marginTop:8, lineHeight:1.7 }}>
        Ajoute des films et séries depuis leur page de détail.<br/>Clique sur "Ma liste" pour sauvegarder.
      </p>
    </div>
  );

  return (
    <div style={{ paddingTop:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <FlagStripe/>
        <span style={{ fontSize:11, color:C.muted, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>
          {liste.length} titre{liste.length>1?"s":""} sauvegardé{liste.length>1?"s":""}
        </span>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
        {liste.map((item,i)=>(
          <div key={`${item.id}-${i}`} style={{ position:"relative" }}>
            <MediaCard item={item} onClick={onCardClick}/>
            <button onClick={()=>remove(item.id,item.media_type)}
              style={{ position:"absolute", top:-7, left:-7, width:22, height:22, borderRadius:99,
                background:C.red, border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 8px rgba(0,0,0,0.5)", zIndex:10 }}>
              <Trash2 size={10} color="#fff"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV = [
  { id:"accueil",   label:"Accueil",   icon:Home },
  { id:"films",     label:"Films",     icon:Film },
  { id:"series",    label:"Séries",    icon:Tv },
  { id:"tendances", label:"Tendances", icon:TrendingUp },
  { id:"maListe",   label:"Ma liste",  icon:Eye },
];

const Sidebar: React.FC<{ active:string; setActive:(s:string)=>void; listeCount:number }> =
({ active, setActive, listeCount }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  return (
    <motion.aside animate={{ width:open?196:58 }} transition={{ type:"spring", stiffness:280, damping:28 }}
      style={{ position:"relative", display:"flex", flexDirection:"column", flexShrink:0, height:"100%",
        background:"rgba(8,6,4,0.72)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
        borderRight:`1px solid ${C.border}` }}>

      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"26px 14px 28px" }}>
        <Logo size={22}/>
        <AnimatePresence>
          {open&&<motion.div initial={{ opacity:0,x:-6 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.22em", textTransform:"uppercase", color:C.text, lineHeight:1 }}>KAYSETANE</div>
            <FlagStripe width={58}/>
          </motion.div>}
        </AnimatePresence>
      </div>

      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2, padding:"0 7px" }}>
        {NAV.map(item=>{
          const on=active===item.id; const Icon=item.icon;
          return (
            <button key={item.id} onClick={()=>setActive(item.id)}
              style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 11px", borderRadius:12,
                width:"100%", cursor:"pointer", transition:"all 0.15s", position:"relative",
                background:on?C.glassMd:"transparent", border:on?`1px solid ${C.border}`:"1px solid transparent" }}>
              <Icon size={15} color={on?C.text:C.soft} style={{ flexShrink:0 }}/>
              <AnimatePresence>
                {open&&<motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ fontSize:12, fontWeight:on?600:400, color:on?C.text:C.soft, whiteSpace:"nowrap", flex:1 }}>
                  {item.label}
                </motion.span>}
              </AnimatePresence>
              {item.id==="maListe"&&listeCount>0&&(
                <div style={{ position:"absolute", right:on?22:3, top:7, minWidth:16, height:16,
                  borderRadius:99, background:C.yellow, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:8, fontWeight:800, color:"#000", padding:"0 4px" }}>
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
        {open&&<div style={{ borderRadius:10, overflow:"hidden", height:60, position:"relative", marginBottom:8 }}>
          <img src={imgMosque} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.4 }}/>
          <div style={{ position:"absolute", bottom:4, left:8, fontSize:7, color:C.soft, fontWeight:500, letterSpacing:"0.1em" }}>Made in Dakar 🇸🇳</div>
        </div>}
      </div>

      <div style={{ padding:"8px 7px 22px", borderTop:`1px solid ${C.border}` }}>
        <button onClick={()=>navigate("/")}
          style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 11px", borderRadius:12,
            width:"100%", cursor:"pointer", background:"transparent", border:"none", color:C.soft, transition:"color 0.15s" }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=C.muted;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=C.soft;}}>
          <ArrowLeft size={15} style={{ flexShrink:0 }}/>
          {open&&<span style={{ fontSize:12 }}>Déconnexion</span>}
        </button>
      </div>

      <button onClick={()=>setOpen(!open)}
        style={{ position:"absolute", right:-11, top:30, width:22, height:22, borderRadius:99,
          background:C.yellow, border:"none", cursor:"pointer", display:"flex", alignItems:"center",
          justifyContent:"center", boxShadow:"0 2px 10px rgba(0,0,0,0.5)", zIndex:10 }}>
        <motion.div animate={{ rotate:open?0:180 }}><ChevronRight size={11} color="#000"/></motion.div>
      </button>
    </motion.aside>
  );
};

// ── TABS ──────────────────────────────────────────────────────────────────────
const FREMBED_ROWS: Record<string,{ label:string; loader:()=>Promise<any[]> }> = {
  vfMovies:  { label:"🇫🇷 Films en VF — Disponibles maintenant", loader:()=>frembedMovies(1,"popular") },
  vfMovies2: { label:"🆕 Films VF — Les plus récents",            loader:()=>frembedMovies(1,"latest")  },
  vfTV:      { label:"🇫🇷 Séries en VF — Disponibles maintenant",loader:()=>frembedTV(1,"popular")     },
  vfTV2:     { label:"🆕 Séries VF — Les plus récentes",          loader:()=>frembedTV(1,"latest")      },
};

const TABS: Record<string,any[]> = {
  accueil: [
    { k:"trW",  p:"/trending/all/week",  label:"🔥 Tendances cette semaine" },
    { k:"popM", p:"/movie/popular",      label:"🎬 Films populaires" },
    { k:"popTV",p:"/tv/popular",         label:"📺 Séries populaires" },
    { k:"topM", p:"/movie/top_rated",    label:"⭐ Mieux notés" },
    { k:"nowM", p:"/movie/now_playing",  label:"🎭 Au cinéma" },
  ],
  films: [
    { k:"vfMovies",  p:"", label:"🇫🇷 Films en VF maintenant", type:"frembed" },
    { k:"vfMovies2", p:"", label:"🆕 Films VF — Récents",       type:"frembed" },
    { k:"fpop", p:"/movie/popular",      label:"🔥 Populaires" },
    { k:"ftop", p:"/movie/top_rated",    label:"⭐ Les mieux notés" },
    { k:"fact", p:"/discover/movie",     label:"💥 Action",  params:{ with_genres:"28" } },
    { k:"fcom", p:"/discover/movie",     label:"😂 Comédie", params:{ with_genres:"35" } },
    { k:"fhor", p:"/discover/movie",     label:"👻 Horreur", params:{ with_genres:"27" } },
    { k:"fsci", p:"/discover/movie",     label:"🚀 Sci-Fi",  params:{ with_genres:"878" } },
  ],
  series: [
    { k:"vfTV",  p:"", label:"🇫🇷 Séries en VF maintenant", type:"frembed" },
    { k:"vfTV2", p:"", label:"🆕 Séries VF — Récentes",      type:"frembed" },
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

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab]           = useState("accueil");
  const [rows, setRows]         = useState<Record<string,any[]>>({});
  const [busy, setBusy]         = useState<Record<string,boolean>>({});
  const [heroItems, setHeroItems] = useState<any[]>([]);
  const [query, setQuery]       = useState("");
  const [searchRes, setSearchRes] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [player, setPlayer]     = useState<any>(null);
  const [detail, setDetail]     = useState<any>(null);
  const [stimer, setStimer]     = useState<ReturnType<typeof setTimeout>|null>(null);
  const [listeCount, setListeCount] = useState(getListe().length);

  const refreshListe = () => setListeCount(getListe().length);

  const loadTab = useCallback(async (t:string) => {
    const cfg = TABS[t]||[];
    for (const row of cfg) {
      const { k, p, params={}, type } = row as any;
      if (rows[k]!==undefined) continue;
      setBusy(prev=>({...prev,[k]:true}));
      if (type==="frembed") {
        const items = FREMBED_ROWS[k] ? await FREMBED_ROWS[k].loader() : [];
        setRows(prev=>({...prev,[k]:items}));
        setBusy(prev=>({...prev,[k]:false}));
      } else {
        const d = await tmdb(p, params);
        const items = (d?.results||[]).filter((r:any)=>r.poster_path).slice(0,20)
          .map((r:any)=>({...r, media_type:r.media_type||(p.includes("/tv")||p.includes("discover/tv")?"tv":"movie")}));
        setRows(prev=>({...prev,[k]:items}));
        setBusy(prev=>({...prev,[k]:false}));
        if (t==="accueil"&&k==="trW"&&items.length&&heroItems.length===0)
          setHeroItems(items.slice(0,8));
      }
    }
  }, [rows, heroItems]);

  useEffect(()=>{ loadTab(tab); }, [tab]);

  const doSearch = async (q:string) => {
    if (!q.trim()) { setSearchRes([]); setSearching(false); return; }
    setSearching(true);
    const [mv,tv] = await Promise.all([tmdb("/search/movie",{query:q}), tmdb("/search/tv",{query:q})]);
    setSearchRes([
      ...(mv?.results||[]).filter((r:any)=>r.poster_path).slice(0,12).map((r:any)=>({...r,media_type:"movie"})),
      ...(tv?.results||[]).filter((r:any)=>r.poster_path).slice(0,12).map((r:any)=>({...r,media_type:"tv"})),
    ]);
    setSearching(false);
  };

  const handleSearch=(q:string)=>{ setQuery(q); if(stimer) clearTimeout(stimer);
    if(q) setStimer(setTimeout(()=>doSearch(q),400)); else setSearchRes([]); };

  const PAGE: Record<string,string> = { accueil:"Accueil", films:"Films yi", series:"Série yi", tendances:"Tendances", maListe:"Sa liste" };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden",
      fontFamily:"'DM Sans','Satoshi',sans-serif", color:C.text, background:C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        *{box-sizing:border-box;} ::-webkit-scrollbar{display:none;}
      `}</style>

      <div style={{ position:"fixed", inset:0, zIndex:0, background:"linear-gradient(160deg,#100b06 0%,#0c0a08 50%,#080608 100%)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 90% 55% at 50% 0%,rgba(0,133,63,0.05) 0%,transparent 60%)" }}/>

      <div style={{ position:"relative", zIndex:10, display:"flex", width:"100%", height:"100%" }}>
        <Sidebar active={tab} listeCount={listeCount}
          setActive={t=>{ setTab(t); setQuery(""); setSearchRes([]); refreshListe(); }}/>

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ flexShrink:0, padding:"14px 24px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <FlagStripe width={18} height={2}/>
              <h1 style={{ fontSize:11, fontWeight:500, color:C.soft, letterSpacing:"0.1em", textTransform:"uppercase" }}>{PAGE[tab]}</h1>
            </div>
            <motion.div initial={{ opacity:0,y:-12 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5 }}
              style={{ display:"flex", alignItems:"center", gap:2, background:C.glass, backdropFilter:"blur(32px)",
                WebkitBackdropFilter:"blur(32px)", border:`1px solid ${C.border}`, borderRadius:99,
                padding:"5px 7px", boxShadow:"0 8px 32px rgba(0,0,0,0.3),0 1px 0 rgba(255,255,255,0.05) inset" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 13px", borderRadius:99,
                background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}` }}>
                <Search size={11} color={C.muted}/>
                <input type="text" placeholder="Seet film, série…" value={query}
                  onChange={e=>handleSearch(e.target.value)}
                  style={{ background:"transparent", border:"none", outline:"none", width:150, fontSize:11, color:C.text }}/>
                {query&&<button onClick={()=>{ setQuery(""); setSearchRes([]); }}
                  style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:0, display:"flex" }}>
                  <X size={10}/></button>}
              </div>
              <div style={{ width:1, height:18, background:C.border, margin:"0 2px" }}/>
              <button style={{ position:"relative", width:32, height:32, borderRadius:99,
                background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`,
                display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Bell size={12} color={C.muted}/>
                <span style={{ position:"absolute", top:7, right:7, width:4, height:4, borderRadius:99, background:C.yellow }}/>
              </button>
              <div style={{ width:32, height:32, borderRadius:99, marginLeft:2, background:C.yellow,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800,
                color:"#000", cursor:"pointer", boxShadow:`0 2px 8px rgba(253,239,66,0.3)` }}>MN</div>
            </motion.div>
          </div>

          <main style={{ flex:1, overflowY:"auto", padding:"0 24px 24px", scrollbarWidth:"none" }}>
            <AnimatePresence mode="wait">
              <motion.div key={tab+query} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.22 }}>
                {query ? (
                  <div style={{ paddingTop:28 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                      <FlagStripe/>
                      <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:C.soft }}>
                        {searching?"Seet…":`${searchRes.length} résultat${searchRes.length>1?"s":""} — "${query}"`}
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
                      <div style={{ paddingTop:22 }}>
                        <HeroBanner items={heroItems} onPlay={setPlayer} onDetail={setDetail}/>
                        <FeaturedRow onCardClick={setDetail}/>
                        {Object.entries(FREMBED_ROWS).map(([k,{label}])=>(
                          <MediaRow key={k} label={label}
                            items={rows[k]||[]} loading={!!busy[k]&&!rows[k]?.length}
                            onCardClick={setDetail}/>
                        ))}
                      </div>
                    )}
                    <div style={{ paddingTop:tab!=="accueil"?28:0 }}>
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
          </main>
        </div>
      </div>

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