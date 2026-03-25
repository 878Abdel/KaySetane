"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Search, Star, Tv, Film, TrendingUp, Home, Eye, X,
  Bookmark, BookmarkCheck, Trash2, ArrowLeft, ChevronRight,
  Radio, Zap, ChevronLeft, ChevronDown,
  Globe, List,
} from "lucide-react";

// ── ASSETS ───────────────────────────────────────────────────────────────────
import imgStatuette       from "../assets/anaterate-few-2919164_1920.png";
import imgMosque          from "../assets/mariams-fisherman-mosque-246976_1920.jpg";
import posterSuperman     from "../assets/Superman.jpg";
import posterTrumanShow   from "../assets/The_Truman_Show.jpg";
import posterJoker        from "../assets/JOKER_poster_fan-art_-_NIMROD___.jpg";
import posterOppenheimer  from "../assets/Oppenheimer_movie_poster.jpg";
import posterInterstellar from "../assets/Interstellar.jpg";

// ── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  green:"#00853F", yellow:"#FDEF42", red:"#E31B23",
  glass:"rgba(255,255,255,0.055)", glassMd:"rgba(255,255,255,0.09)",
  border:"rgba(255,255,255,0.09)", text:"#F5EFE6",
  muted:"rgba(245,239,230,0.55)", soft:"rgba(245,239,230,0.30)",
  bg:"#0C0A08",
};

// ── HOOKS ────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [v, setV] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return v;
}

// ── ATOMS ────────────────────────────────────────────────────────────────────
const FlagStripe = ({ w=36, h=2 }: { w?:number; h?:number }) => (
  <div style={{ display:"flex", height:h, borderRadius:99, overflow:"hidden", width:w, flexShrink:0 }}>
    <div style={{ flex:1, background:C.green }}/>
    <div style={{ flex:1, background:C.yellow }}/>
    <div style={{ flex:1, background:C.red }}/>
  </div>
);

const Logo = ({ size=28 }: { size?:number }) => (
  <img src={imgStatuette} alt="KaySetane" style={{
    width:size, height:Math.round(size*1.6), objectFit:"contain",
    objectPosition:"center top", filter:"brightness(0.9) contrast(1.1) sepia(0.1)",
    mixBlendMode:"screen", flexShrink:0,
  }}/>
);

// ── STORAGE ──────────────────────────────────────────────────────────────────
const LISTE_KEY = "ks_liste_v3";
const PROG_KEY  = "ks_prog_v3";
const getListe  = (): any[] => { try { return JSON.parse(localStorage.getItem(LISTE_KEY)||"[]"); } catch { return []; } };
const saveListe = (l:any[]) => localStorage.setItem(LISTE_KEY, JSON.stringify(l));
const addToListe = (item:any) => {
  const l = getListe();
  if (l.find((i:any)=>i.id===item.id && i.media_type===item.media_type)) return;
  saveListe([{ id:item.id, title:mediaTitle(item), poster_path:item.poster_path,
    media_type:item.media_type||"movie", year:mediaYear(item), vote_average:item.vote_average,
    savedAt:Date.now() }, ...l]);
};
const removeFromListe = (id:any, mt:string) => saveListe(getListe().filter((i:any)=>!(i.id===id&&i.media_type===mt)));
const isInListe = (id:any, mt:string) => getListe().some((i:any)=>i.id===id&&i.media_type===mt);
const getProgress = (): Record<string,any> => { try { return JSON.parse(localStorage.getItem(PROG_KEY)||"{}"); } catch { return {}; } };
const saveProgress = (key:string,data:any) => {
  const p=getProgress(); p[key]={...p[key],...data,updatedAt:Date.now()};
  localStorage.setItem(PROG_KEY,JSON.stringify(p));
};

// ── TMDB ─────────────────────────────────────────────────────────────────────
const TMDB_KEY  = "7340fd92d1c2bdec987f215f33c56717";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG       = "https://image.tmdb.org/t/p/";

async function tmdb(path:string, params:Record<string,string>={}) {
  try {
    const u = new URL(TMDB_BASE+path);
    u.searchParams.set("api_key",TMDB_KEY);
    u.searchParams.set("language","fr-FR");
    u.searchParams.set("region","FR");
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    const r = await fetch(u.toString());
    if(!r.ok) throw r.status;
    return r.json();
  } catch(e) { return null; }
}
async function tmdbFB(path:string, p:Record<string,string>={}) {
  const d = await tmdb(path,p);
  if(d && !d.overview) {
    const fb = await tmdb(path,{...p,language:"en-US"});
    if(fb?.overview) d.overview=fb.overview;
  }
  return d;
}
const imgUrl = (path?:string|null, size="w342") => {
  if(!path) return null;
  return path.startsWith("http") ? path : IMG+size+path;
};
const mediaTitle = (item:any) => item?.title||item?.name||"";
const mediaYear  = (item:any) => (item?.release_date||item?.first_air_date||"").slice(0,4);
const isTV       = (item:any) => item?.media_type==="tv"||item?.type==="tv";
const isAnime    = (item:any) => item?.media_type==="anime";

// ── SOURCES — sans pub, FR en priorité ────────────────────────────────────────
// Architecture: Frembed (VF natif) → VidLink (0 pub, 50+ langs) → AutoEmbed → Embed.su
const VL_COLOR = "FDEF42";
const SOURCES = [
  {
    id:"frembed", name:"🇫🇷 VF", zero_pub:true,
    fn:(id:number,tv:boolean,s=1,e=1)=>
      tv ? `https://frembed.bond/embed/serie/${id}?sa=${s}&epi=${e}&lang=fr`
         : `https://frembed.bond/embed/movie/${id}?lang=fr`,
  },
  {
    id:"vidlink", name:"⚡ VidLink", zero_pub:true,
    fn:(id:number,tv:boolean,s=1,e=1)=>
      tv ? `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=${VL_COLOR}&secondaryColor=${VL_COLOR}&iconColor=${VL_COLOR}&autoplay=true&nextbutton=true`
         : `https://vidlink.pro/movie/${id}?primaryColor=${VL_COLOR}&secondaryColor=${VL_COLOR}&iconColor=${VL_COLOR}&autoplay=true`,
  },
  {
    id:"autoembed", name:"AutoEmbed", zero_pub:true,
    fn:(id:number,tv:boolean,s=1,e=1)=>
      tv ? `https://autoembed.cc/tv/tmdb/${id}-${s}-${e}`
         : `https://autoembed.cc/movie/tmdb/${id}`,
  },
  {
    id:"embedsu", name:"Embed.su", zero_pub:true,
    fn:(id:number,tv:boolean,s=1,e=1)=>
      tv ? `https://embed.su/embed/tv/${id}/${s}/${e}`
         : `https://embed.su/embed/movie/${id}`,
  },
  {
    id:"vidsrc2", name:"VidSrc", zero_pub:false,
    fn:(id:number,tv:boolean,s=1,e=1)=>
      tv ? `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
         : `https://vidsrc.cc/v2/embed/movie/${id}`,
  },
];

// Anime: VidLink MAL ou anime-sama embed
const animeEmbed=(mal_id:number,ep=1)=>
  `https://vidlink.pro/anime/${mal_id}/${ep}?primaryColor=${VL_COLOR}&secondaryColor=${VL_COLOR}&iconColor=${VL_COLOR}&autoplay=true&nextbutton=true`;

const getEmbedSrc = (item:any, sourceId:string, s=1, e=1): string => {
  if(isAnime(item)) return animeEmbed(item.mal_id||item.id, e);
  const src = SOURCES.find(x=>x.id===sourceId) || SOURCES[0];
  return src.fn(item.id, isTV(item), s, e);
};

// ── FREMBED API ───────────────────────────────────────────────────────────────
const FB_API = "https://frembed.bond/api/public/v1";
async function fbMovies(page=1,order="popular") {
  try {
    const r = await fetch(`${FB_API}/movies?limit=20&page=${page}&order=${order}`);
    const d = await r.json();
    return (d?.result?.items||[]).map((i:any)=>({
      id:Number(i.tmdb), title:i.title,
      release_date:i.year?`${i.year}-01-01`:"",
      poster_path:i.poster||null, vote_average:0,
      media_type:"movie", frembed_link:i.link, version:i.version||"VF",
    }));
  } catch { return []; }
}
async function fbTV(page=1,order="popular") {
  try {
    const r = await fetch(`${FB_API}/tv?limit=20&page=${page}&order=${order}`);
    const d = await r.json();
    const seen = new Set<string>();
    return (d?.result?.items||[])
      .filter((i:any)=>{ if(seen.has(i.tmdb)) return false; seen.add(i.tmdb); return true; })
      .map((i:any)=>({
        id:Number(i.tmdb), name:i.title,
        first_air_date:i.year?`${i.year}-01-01`:"",
        poster_path:null, vote_average:0,
        media_type:"tv", frembed_link:i.link, version:i.version||"VF",
      }));
  } catch { return []; }
}

// ── JIKAN (MAL) ──────────────────────────────────────────────────────────────
async function jikan(path:string, params:Record<string,string>={}) {
  try {
    const u = new URL("https://api.jikan.moe/v4"+path);
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    const r = await fetch(u.toString()); if(!r.ok) throw r.status;
    return r.json();
  } catch { return null; }
}
const jikanToItem = (a:any) => ({
  id:a.mal_id, mal_id:a.mal_id,
  title:a.title_french||a.title_english||a.title||"",
  poster_path:a.images?.jpg?.large_image_url||a.images?.jpg?.image_url||null,
  vote_average:a.score||0,
  media_type:"anime",
  overview:a.synopsis||"",
  year:a.aired?.prop?.from?.year||"",
  total_episodes:a.episodes||"?",
  genres:a.genres?.map((g:any)=>g.name)||[],
});

// ── LIVE TV ───────────────────────────────────────────────────────────────────
// Chaînes FR avec embeds qui fonctionnent sans VPN
/* Commenté - Bientôt disponible
const LIVE_CHANNELS = [
  // Généralistes
  { id:"tf1",      name:"TF1",         logo:"🔵", cat:"Généraliste",
    embed:"https://www.tf1.fr/tf1/direct",        note:"Direct TF1" },
  { id:"tmc",      name:"TMC",         logo:"🟣", cat:"Généraliste",
    embed:"https://www.tf1.fr/tmc/direct",         note:"Direct TMC" },
  { id:"tf1series",name:"TF1 Séries",  logo:"🟡", cat:"Généraliste",
    embed:"https://www.tf1.fr/tfx/direct",         note:"Direct TFX" },
  { id:"m6",       name:"M6",          logo:"🟠", cat:"Généraliste",
    embed:"https://www.6play.fr/m6",               note:"Connexion M6 requise" },
  { id:"arte",     name:"ARTE",        logo:"🔴", cat:"Culture",
    embed:"https://www.arte.tv/fr/direct/",        note:"Direct ARTE — sans inscription" },
  { id:"france5",  name:"France 5",    logo:"🟤", cat:"Culture",
    embed:"https://www.france.tv/france-5/direct", note:"Direct France 5" },
  // Info
  { id:"bfmtv",    name:"BFM TV",      logo:"⚫", cat:"Info",
    embed:"https://www.bfmtv.com/en-direct/",      note:"Direct BFM" },
  { id:"lcpan",    name:"LCP",         logo:"⚪", cat:"Info",
    embed:"https://www.lcp.fr/direct",             note:"Direct LCP" },
  // Sports via DaddyLive (fonctionne sans pub)
  { id:"sport1",   name:"Sports Live 1", logo:"⚽", cat:"Sport",
    embed:"https://daddylive.dad/embed/stream-1.php", note:"Stream sport international" },
  { id:"sport2",   name:"Sports Live 2", logo:"🏀", cat:"Sport",
    embed:"https://daddylive.dad/embed/stream-2.php", note:"Stream sport international" },
  { id:"sport3",   name:"Sports Live 3", logo:"🎾", cat:"Sport",
    embed:"https://daddylive.dad/embed/stream-3.php", note:"Stream sport international" },
  // Internationales
  { id:"euronews", name:"Euronews FR", logo:"🌍", cat:"Info",
    embed:"https://fr.euronews.com/live",          note:"Direct Euronews en français" },
  { id:"tv5monde", name:"TV5 Monde",   logo:"🇫🇷", cat:"Généraliste",
    embed:"https://www.tv5monde.com/tv/direct",    note:"Direct TV5 Monde" },
  { id:"rfi",      name:"RFI",         logo:"📻", cat:"Info",
    embed:"https://www.rfi.fr/fr/",               note:"Radio/TV RFI" },
  { id:"molotov",  name:"Molotov",     logo:"📱", cat:"Généraliste",
    embed:"https://www.molotov.tv/watch/free",     note:"Toutes chaînes FR gratuites" },
];
*/

// ── FEATURED ─────────────────────────────────────────────────────────────────
const FEATURED = [
  { id:807,    title:"Superman",        year:"2025", img:posterSuperman,     media_type:"movie", accent:C.yellow, overview:"Le Héros de Krypton revient dans une aventure épique signée James Gunn." },
  { id:37165,  title:"The Truman Show", year:"1998", img:posterTrumanShow,   media_type:"movie", accent:C.green,  overview:"Un homme découvre que toute sa vie est un show télévisé diffusé en direct." },
  { id:475557, title:"Joker",           year:"2019", img:posterJoker,        media_type:"movie", accent:C.red,    overview:"L'origine sombre du clown criminel le plus célèbre de Gotham." },
  { id:872585, title:"Oppenheimer",     year:"2023", img:posterOppenheimer,  media_type:"movie", accent:C.yellow, overview:"Le père de la bombe atomique — un drame historique de Christopher Nolan." },
  { id:157336, title:"Interstellar",    year:"2014", img:posterInterstellar, media_type:"movie", accent:C.green,  overview:"Un voyage à travers les étoiles pour sauver l'humanité." },
];

// ── SKELETON ─────────────────────────────────────────────────────────────────
const Skel = ({ w=130, h=195 }: { w?:number; h?:number }) => (
  <div style={{ flexShrink:0, width:w, height:h, borderRadius:12,
    background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize:"600px 100%", animation:"shimmer 1.4s infinite" }}/>
);

// ── MEDIA CARD ────────────────────────────────────────────────────────────────
const CARD_W=130, CARD_H=195;

const MediaCard = ({ item, onClick, localImg }: { item:any; onClick:(i:any)=>void; localImg?:string }) => {
  const [hov,setHov]=useState(false);
  const poster=localImg||imgUrl(item.poster_path);
  const t=mediaTitle(item);
  const tv=isTV(item), anime=isAnime(item);
  const rating=item.vote_average?Number(item.vote_average).toFixed(1):"";
  const hasVF=!!(item.frembed_link||item.version);
  const inL=isInListe(item.id,item.media_type||"movie");
  const prog=getProgress()[String(item.id)];

  return (
    <motion.div whileHover={{ scale:1.04 }} transition={{ duration:0.18 }}
      onTouchStart={()=>setHov(true)} onTouchEnd={()=>setTimeout(()=>setHov(false),500)}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      onClick={()=>onClick(item)}
      style={{ flexShrink:0, width:CARD_W, borderRadius:12, overflow:"hidden",
        position:"relative", cursor:"pointer",
        boxShadow:hov?"0 16px 40px rgba(0,0,0,0.8)":"0 4px 16px rgba(0,0,0,0.5)" }}>

      {poster
        ? <img src={poster} alt={t} loading="lazy" style={{ width:CARD_W, height:CARD_H, objectFit:"cover", display:"block" }}/>
        : <div style={{ width:CARD_W, height:CARD_H, background:"rgba(255,255,255,0.04)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:8 }}>
            <span style={{ fontSize:10, color:C.soft, textAlign:"center", lineHeight:1.4 }}>{t}</span>
          </div>}

      <motion.div animate={{ opacity:hov?1:0 }}
        style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.1) 50%,transparent 100%)",
          display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"8px 8px 10px" }}>
        <p style={{ fontSize:10, fontWeight:700, color:C.text, lineHeight:1.3, marginBottom:4 }}>{t}</p>
        <div style={{ display:"flex", justifyContent:"center" }}>
          <div style={{ width:32, height:32, borderRadius:99, background:C.yellow,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Play size={12} color="#000" fill="#000"/>
          </div>
        </div>
      </motion.div>

      {/* Badges top-left */}
      {hasVF && <div style={{ position:"absolute", top:6, left:6, background:"rgba(0,133,63,0.92)",
        borderRadius:5, padding:"2px 6px", fontSize:7, fontWeight:800, color:"#fff" }}>
        {item.version||"VF"}</div>}
      {anime && !hasVF && <div style={{ position:"absolute", top:6, left:6, background:"rgba(233,79,55,0.92)",
        borderRadius:5, padding:"2px 6px", fontSize:7, fontWeight:800, color:"#fff" }}>ANIME</div>}
      {rating && !hasVF && !anime && <div style={{ position:"absolute", top:6, left:6,
        background:"rgba(0,0,0,0.72)", borderRadius:5, padding:"2px 6px",
        display:"flex", alignItems:"center", gap:2 }}>
        <Star size={7} color={C.yellow} fill={C.yellow}/><span style={{ fontSize:7, fontWeight:700, color:C.yellow }}>{rating}</span></div>}

      {/* Type badge top-right */}
      <div style={{ position:"absolute", top:6, right:6,
        background:anime?"rgba(233,79,55,0.15)":tv?"rgba(0,133,63,0.15)":"rgba(0,0,0,0.6)",
        border:`1px solid ${anime?"rgba(233,79,55,0.35)":tv?"rgba(0,133,63,0.35)":C.border}`,
        borderRadius:5, padding:"2px 5px", fontSize:6, fontWeight:700,
        color:anime?"#e94f37":tv?C.green:C.muted, textTransform:"uppercase" }}>
        {anime?"Anime":tv?"Série":"Film"}
      </div>

      {/* Bookmark indicator */}
      {inL && <div style={{ position:"absolute", top:26, right:6, width:16, height:16,
        borderRadius:4, background:"rgba(253,239,66,0.95)",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <BookmarkCheck size={9} color="#000"/></div>}

      {/* Progress bar */}
      {prog?.pct>2 && <div style={{ position:"absolute", bottom:2, left:0, right:0, height:3, background:"rgba(0,0,0,0.5)" }}>
        <div style={{ width:`${Math.min(prog.pct,100)}%`, height:"100%", background:C.yellow, borderRadius:"0 2px 2px 0" }}/>
      </div>}

      {/* Flag stripe bottom */}
      <div style={{ position:"absolute", bottom:prog?.pct>2?5:0, left:0, right:0, height:2, display:"flex" }}>
        <div style={{ flex:1, background:C.green, opacity:hov?1:0.2, transition:"opacity 0.2s" }}/>
        <div style={{ flex:1, background:C.yellow, opacity:hov?1:0.2, transition:"opacity 0.2s" }}/>
        <div style={{ flex:1, background:C.red, opacity:hov?1:0.2, transition:"opacity 0.2s" }}/>
      </div>
    </motion.div>
  );
};

// ── MEDIA ROW ─────────────────────────────────────────────────────────────────
const MediaRow = ({ label, items, loading, onCardClick }: {
  label:string; items:any[]; loading:boolean; onCardClick:(i:any)=>void;
}) => {
  const ref=useRef<HTMLDivElement>(null);
  const isMobile=useIsMobile();
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:10, padding:isMobile?"0 16px":"0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <FlagStripe w={12} h={2}/>
          <h2 style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em",
            textTransform:"uppercase", color:C.muted }}>{label}</h2>
        </div>
        {!isMobile&&(
          <div style={{ display:"flex", gap:4 }}>
            {[ChevronLeft,ChevronRight].map((Icon,i)=>(
              <button key={i} onClick={()=>ref.current?.scrollBy({left:i===0?-300:300,behavior:"smooth"})}
                style={{ width:22, height:22, borderRadius:99, background:C.glass,
                  border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon size={11}/>
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={ref} style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none",
        paddingBottom:4, paddingLeft:isMobile?16:0, paddingRight:isMobile?16:0,
        scrollSnapType:isMobile?"x mandatory":"none", WebkitOverflowScrolling:"touch" }}>
        {loading
          ? Array.from({length:8}).map((_,i)=><Skel key={i}/>)
          : items.map((item,i)=>(
            <div key={`${item.id}-${i}`} style={{ scrollSnapAlign:isMobile?"start":"none" }}>
              <MediaCard item={item} onClick={onCardClick}/>
            </div>
          ))}
      </div>
    </div>
  );
};

// ── HERO BANNER ───────────────────────────────────────────────────────────────
const HeroBanner = ({ items, onPlay, onDetail }: {
  items:any[]; onPlay:(i:any)=>void; onDetail:(i:any)=>void;
}) => {
  const [idx,setIdx]=useState(0);
  const timer=useRef<any>(null);
  const isMobile=useIsMobile();
  const pool=items.length>0?items:FEATURED;

  const restart=useCallback(()=>{
    if(timer.current) clearInterval(timer.current);
    timer.current=setInterval(()=>setIdx(i=>(i+1)%pool.length),7000);
  },[pool.length]);

  useEffect(()=>{ restart(); return()=>{ if(timer.current) clearInterval(timer.current); }; },[restart]);
  const goTo=(i:number)=>{ setIdx(i); restart(); };

  const f=pool[idx]||pool[0];
  const isLocal=!!(f as any).img;
  const bg=isLocal?(f as any).img:imgUrl(f.backdrop_path,"original");
  const t=isLocal?(f as any).title:mediaTitle(f);
  const y=isLocal?(f as any).year:mediaYear(f);
  const tv=!isLocal&&isTV(f);
  const rating=f.vote_average?Number(f.vote_average).toFixed(1):"";
  const overview=isLocal?(f as any).overview:(f.overview||"");
  const hasVF=!!(f as any).frembed_link||isLocal;

  return (
    <div style={{ position:"relative", height:isMobile?"56vw":"400px", minHeight:isMobile?220:340,
      borderRadius:isMobile?14:18, overflow:"hidden", marginBottom:isMobile?18:28 }}>
      <AnimatePresence mode="sync">
        <motion.div key={idx} initial={{ opacity:0, scale:1.03 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
          transition={{ duration:0.6 }} style={{ position:"absolute", inset:0 }}>
          {bg
            ? <img src={bg} alt={t} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:isLocal?"center top":"center 25%" }}/>
            : <div style={{ width:"100%", height:"100%", background:"#1a1208" }}/>}
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(to top,rgba(12,10,8,0.98) 0%,rgba(12,10,8,0.35) 45%,transparent 70%)" }}/>
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(to right,rgba(12,10,8,0.6) 0%,transparent 55%)" }}/>
        </motion.div>
      </AnimatePresence>

      <div style={{ position:"absolute", bottom:isMobile?12:24, left:isMobile?14:24, zIndex:2, maxWidth:isMobile?"68%":"45%" }}>
        {hasVF&&<div style={{ display:"inline-flex", alignItems:"center", gap:4,
          background:"rgba(0,133,63,0.88)", borderRadius:99,
          padding:"2px 9px", fontSize:8, fontWeight:800, color:"#fff", marginBottom:6 }}>🇫🇷 VF</div>}
        <h2 style={{ fontSize:isMobile?19:30, fontWeight:800, color:C.text,
          lineHeight:1.1, letterSpacing:"-0.02em", marginBottom:4,
          textShadow:"0 2px 16px rgba(0,0,0,0.9)" }}>{t}</h2>
        <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:isMobile?10:14, flexWrap:"wrap" }}>
          {y&&<span style={{ fontSize:10, color:C.muted }}>{y}</span>}
          {tv&&<span style={{ fontSize:8, color:C.green, fontWeight:700,
            background:"rgba(0,133,63,0.15)", padding:"2px 6px", borderRadius:99 }}>Série</span>}
          {rating&&<div style={{ display:"flex", alignItems:"center", gap:2 }}>
            <Star size={9} color={C.yellow} fill={C.yellow}/><span style={{ fontSize:9, color:C.yellow, fontWeight:700 }}>{rating}</span></div>}
        </div>
        {!isMobile&&overview&&<p style={{ fontSize:12, color:C.muted, lineHeight:1.7, marginBottom:16,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", maxWidth:320 }}>
          {overview}</p>}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>onPlay(f)} style={{ display:"flex", alignItems:"center", gap:6,
            padding:isMobile?"8px 16px":"10px 20px", borderRadius:99, background:C.yellow, color:"#000",
            fontSize:isMobile?11:12, fontWeight:700, cursor:"pointer", border:"none",
            boxShadow:"0 4px 18px rgba(253,239,66,0.28)" }}>
            <Play size={isMobile?10:11} fill="currentColor"/> Regarder
          </button>
          <button onClick={()=>onDetail(f)} style={{ display:"flex", alignItems:"center", gap:6,
            padding:isMobile?"8px 12px":"10px 16px", borderRadius:99,
            background:"rgba(255,255,255,0.12)", color:C.text,
            fontSize:isMobile?11:12, fontWeight:600, cursor:"pointer",
            border:`1px solid ${C.border}`, backdropFilter:"blur(8px)" }}>
            + Détails
          </button>
        </div>
      </div>

      {/* Indicators */}
      <div style={{ position:"absolute", bottom:isMobile?12:24, right:12, zIndex:2,
        display:"flex", gap:4, flexDirection:"column" }}>
        {pool.slice(0,6).map((_,i)=>(
          <button key={i} onClick={()=>goTo(i)} style={{
            width:2.5, height:i===idx?20:7, borderRadius:99, padding:0, border:"none",
            background:i===idx?C.yellow:"rgba(255,255,255,0.22)", cursor:"pointer", transition:"all 0.3s" }}/>
        ))}
      </div>
    </div>
  );
};

// ── PLAYER MODAL — mobile-first, 0 pub ────────────────────────────────────────
const PlayerModal = ({ item, onClose }: { item:any; onClose:()=>void }) => {
  const [season,setSeason]=useState(1);
  const [episode,setEpisode]=useState(1);
  const [seasons,setSeasons]=useState<number[]>([]);
  const [epList,setEpList]=useState<any[]>([]);
  const [sourceId,setSourceId]=useState("frembed"); // Frembed VF par défaut
  const [fallback,setFallback]=useState(false);
  const [showEpPanel,setShowEpPanel]=useState(false);
  const [showSrcPanel,setShowSrcPanel]=useState(false);
  const fbTimer=useRef<any>(null);
  const isMobile=useIsMobile();

  const tv=isTV(item), anime=isAnime(item), isLocal=!!(item as any).img;
  const t=(item as any).title||mediaTitle(item);

  // postMessage VidLink → progress tracking
  useEffect(()=>{
    const handler=(e:MessageEvent)=>{
      try {
        const d=typeof e.data==="string"?JSON.parse(e.data):e.data;
        if(d?.currentTime&&d?.duration&&d.duration>0) {
          const pct=Math.round((d.currentTime/d.duration)*100);
          saveProgress(String(item.id),{ pct, title:t, season:tv?season:undefined, episode:tv?episode:undefined });
        }
      } catch {}
    };
    window.addEventListener("message",handler);
    return()=>window.removeEventListener("message",handler);
  },[item.id,season,episode,tv,t]);

  useEffect(()=>{
    if(!tv||isLocal||anime) return;
    tmdb(`/tv/${item.id}`).then(d=>{
      if(d) setSeasons(Array.from({length:d.number_of_seasons||1},(_,i)=>i+1));
    });
  },[item.id,tv]);

  useEffect(()=>{
    if(!tv||isLocal||anime) return;
    tmdb(`/tv/${item.id}/season/${season}`).then(d=>setEpList(d?.episodes||[]));
  },[item.id,tv,season]);

  // Fallback timer
  useEffect(()=>{
    setFallback(false);
    if(fbTimer.current) clearTimeout(fbTimer.current);
    fbTimer.current=setTimeout(()=>setFallback(true), 18000);
    return()=>{ if(fbTimer.current) clearTimeout(fbTimer.current); };
  },[sourceId,season,episode]);

  const src=isLocal?null:getEmbedSrc(item,sourceId,season,episode);
  const epData=epList.length>0?epList:Array.from({length:12},(_,i)=>({episode_number:i+1,name:`Épisode ${i+1}`}));

  useEffect(()=>{
    saveProgress(String(item.id),{ pct:5, title:t, season:tv?season:undefined, episode:tv?episode:undefined });
  },[]);

  const allSources=anime?[SOURCES[1]]:(SOURCES);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"#000", display:"flex", flexDirection:"column" }}>

      {/* ── TOP BAR ── */}
      <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:isMobile?"10px 14px":"10px 20px",
        background:"rgba(8,6,4,0.97)", borderBottom:`1px solid ${C.border}` }}>

        <div style={{ display:"flex", alignItems:"center", gap:8, overflow:"hidden", flex:1, minWidth:0 }}>
          <Logo size={16}/>
          <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase", color:C.text, flexShrink:0 }}>
            KAYSETANE
          </span>
          <span style={{ color:C.soft, fontSize:10, flexShrink:0 }}>›</span>
          <span style={{ fontSize:11, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {t}
          </span>
          {(tv||anime)&&!isLocal&&(
            <span style={{ fontSize:9, color:C.muted, background:"rgba(255,255,255,0.06)",
              padding:"2px 6px", borderRadius:5, flexShrink:0 }}>
              {anime?`EP${episode}`:`S${season}·E${episode}`}
            </span>
          )}
        </div>

        <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
          {/* Source button (compact) */}
          {!isLocal&&(
            <button onClick={()=>setShowSrcPanel(!showSrcPanel)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8,
                background:C.glass, border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer", fontSize:10 }}>
              <Globe size={10}/>
              {!isMobile&&<span>{allSources.find(s=>s.id===sourceId)?.name||"Source"}</span>}
              <ChevronDown size={9}/>
            </button>
          )}
          {/* Episodes button (mobile only) */}
          {(tv||anime)&&!isLocal&&isMobile&&(
            <button onClick={()=>setShowEpPanel(!showEpPanel)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8,
                background:C.glass, border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer", fontSize:10 }}>
              <List size={10}/>
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

      {/* Source dropdown */}
      <AnimatePresence>
        {showSrcPanel&&!isLocal&&(
          <motion.div initial={{ opacity:0,y:-6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }}
            style={{ flexShrink:0, padding:"8px 12px", background:"rgba(14,11,8,0.98)",
              borderBottom:`1px solid ${C.border}`, display:"flex", flexWrap:"wrap", gap:6 }}>
            {allSources.map(s=>(
              <button key={s.id} onClick={()=>{ setSourceId(s.id); setShowSrcPanel(false); setFallback(false); }}
                style={{ padding:"6px 12px", borderRadius:8, fontSize:11, fontWeight:s.id===sourceId?700:400,
                  cursor:"pointer", border:"none",
                  background:s.id===sourceId?C.yellow:C.glass,
                  color:s.id===sourceId?"#000":C.muted,
                  outline:s.id===sourceId?"none":`1px solid ${C.border}` }}>
                {s.name}
                {s.zero_pub&&<span style={{ marginLeft:4, fontSize:8, opacity:0.7 }}>✓ sans pub</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div style={{ display:"flex", flex:1, overflow:"hidden",
        flexDirection:isMobile?"column":"row" }}>
        <div style={{ flex:1, position:"relative" }}>
          {isLocal ? (
            /* Local / Featured item */
            <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:20, background:"rgba(12,10,8,0.95)", padding:24 }}>
              <img src={(item as any).img} alt={t}
                style={{ width:isMobile?160:200, borderRadius:14, boxShadow:"0 16px 48px rgba(0,0,0,0.8)" }}/>
              <p style={{ fontSize:13, color:C.muted, textAlign:"center", maxWidth:300, lineHeight:1.7 }}>
                {(item as any).overview}
              </p>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(t+" bande annonce VF")}`}
                target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px",
                  borderRadius:99, background:C.yellow, color:"#000", fontSize:12, fontWeight:700, textDecoration:"none" }}>
                <Play size={12} fill="#000"/> Bande annonce VF
              </a>
            </div>
          ) : (
            <>
              <iframe
                key={`${sourceId}-${season}-${episode}`}
                src={src||""}
                width="100%" height="100%"
                frameBorder="0" allowFullScreen
                allow="autoplay;fullscreen;picture-in-picture;encrypted-media"
                style={{ display:"block", border:"none", width:"100%", height:"100%" }}
                onLoad={()=>{ if(fbTimer.current) clearTimeout(fbTimer.current); setFallback(false); }}
              />

              {/* Fallback overlay */}
              <AnimatePresence>
                {fallback&&(
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ position:"absolute", inset:0, background:"rgba(8,6,4,0.93)",
                      backdropFilter:"blur(10px)", display:"flex", flexDirection:"column",
                      alignItems:"center", justifyContent:"center", gap:16, padding:24, zIndex:20 }}>
                    <p style={{ fontSize:13, color:C.muted, textAlign:"center", maxWidth:300, lineHeight:1.8 }}>
                      La source prend du temps ou ne répond pas.<br/>
                      <span style={{ fontSize:11, color:C.soft }}>Essayer une autre ?</span>
                    </p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
                      {allSources.filter(s=>s.id!==sourceId).map(s=>(
                        <button key={s.id}
                          onClick={()=>{ setSourceId(s.id); setFallback(false); }}
                          style={{ padding:"9px 18px", borderRadius:99,
                            background:s.id==="vidlink"?C.yellow:C.glass,
                            color:s.id==="vidlink"?"#000":C.muted,
                            fontSize:11, fontWeight:700, cursor:"pointer", border:"none" }}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>setFallback(false)} style={{ fontSize:10, color:C.soft,
                      background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>
                      Continuer d'attendre
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Episode sidebar — desktop */}
        {(tv||anime)&&!isLocal&&!isMobile&&(
          <div style={{ width:220, background:"rgba(6,4,2,0.99)",
            borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
            {!anime&&seasons.length>1&&(
              <div style={{ padding:10, borderBottom:`1px solid ${C.border}` }}>
                <p style={{ fontSize:8, color:C.soft, textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:7, fontWeight:600 }}>Saison</p>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  {seasons.map(s=>(
                    <button key={s} onClick={()=>{ setSeason(s); setEpisode(1); }}
                      style={{ padding:"4px 10px", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer",
                        background:season===s?C.yellow:C.glass, color:season===s?"#000":C.muted,
                        border:season===s?"none":`1px solid ${C.border}` }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <p style={{ fontSize:8, color:C.soft, textTransform:"uppercase", letterSpacing:"0.2em",
              fontWeight:600, padding:"8px 10px 4px" }}>Épisodes</p>
            <div style={{ flex:1, overflowY:"auto", padding:"0 6px 6px" }}>
              {epData.map((ep:any)=>{
                const n=ep.episode_number||1; const active=episode===n;
                return (
                  <div key={n} onClick={()=>{ setEpisode(n); saveProgress(`${item.id}_s${season}e${n}`,{ pct:5, title:t }); }}
                    style={{ padding:"8px 10px", borderRadius:9, marginBottom:3, cursor:"pointer",
                      display:"flex", gap:8, alignItems:"center",
                      background:active?"rgba(253,239,66,0.07)":"transparent",
                      border:`1px solid ${active?"rgba(253,239,66,0.18)":"transparent"}` }}>
                    <div style={{ width:24, height:24, borderRadius:6, flexShrink:0,
                      background:active?C.yellow:C.glass,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {active?<Play size={9} color="#000" fill="#000"/>
                        :<span style={{ fontSize:9, color:C.soft }}>{n}</span>}
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

        {/* Episode panel — mobile */}
        <AnimatePresence>
          {(tv||anime)&&!isLocal&&isMobile&&showEpPanel&&(
            <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", stiffness:310, damping:32 }}
              style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:30,
                background:"rgba(10,8,6,0.99)", borderRadius:"20px 20px 0 0",
                border:`1px solid ${C.border}`, borderBottom:"none",
                maxHeight:"65%", display:"flex", flexDirection:"column" }}>
              {/* Handle */}
              <div style={{ display:"flex", justifyContent:"center", paddingTop:10 }}>
                <div style={{ width:36, height:4, borderRadius:99, background:"rgba(255,255,255,0.15)" }}/>
              </div>
              <div style={{ padding:"8px 16px 4px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em" }}>
                  Épisodes
                </span>
                <button onClick={()=>setShowEpPanel(false)} style={{ background:"none", border:"none", cursor:"pointer", color:C.soft }}>
                  <X size={14}/>
                </button>
              </div>
              {!anime&&seasons.length>1&&(
                <div style={{ padding:"0 16px 10px", display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none" }}>
                  {seasons.map(s=>(
                    <button key={s} onClick={()=>{ setSeason(s); setEpisode(1); }}
                      style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer",
                        flexShrink:0, background:season===s?C.yellow:C.glass, color:season===s?"#000":C.muted,
                        border:season===s?"none":`1px solid ${C.border}` }}>{s}</button>
                  ))}
                </div>
              )}
              <div style={{ flex:1, overflowY:"auto", padding:"0 12px 20px" }}>
                {epData.map((ep:any)=>{
                  const n=ep.episode_number||1; const active=episode===n;
                  return (
                    <div key={n} onClick={()=>{ setEpisode(n); setShowEpPanel(false); }}
                      style={{ padding:"11px 12px", borderRadius:10, marginBottom:5, cursor:"pointer",
                        display:"flex", gap:10, alignItems:"center",
                        background:active?"rgba(253,239,66,0.07)":"transparent",
                        border:`1px solid ${active?"rgba(253,239,66,0.18)":"transparent"}` }}>
                      <div style={{ width:32, height:32, borderRadius:8, flexShrink:0,
                        background:active?C.yellow:C.glass,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {active?<Play size={10} color="#000" fill="#000"/>
                          :<span style={{ fontSize:10, color:C.soft }}>{n}</span>}
                      </div>
                      <p style={{ fontSize:13, fontWeight:active?600:400,
                        color:active?C.yellow:C.text, flex:1,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
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
const DetailModal = ({ item, onClose, onPlay }: {
  item:any; onClose:()=>void; onPlay:(i:any)=>void;
}) => {
  const [info,setInfo]=useState<any>(null);
  const [similar,setSimilar]=useState<any[]>([]);
  const [inL,setInL]=useState(false);
  const isMobile=useIsMobile();
  const tv=isTV(item), anime=isAnime(item), isLocal=!!(item as any).img;

  useEffect(()=>{
    setInL(isInListe(item.id,item.media_type||"movie"));
    if(isLocal||anime) return;
    Promise.all([
      tmdbFB(`/${tv?"tv":"movie"}/${item.id}`),
      tmdb(`/${tv?"tv":"movie"}/${item.id}/similar`),
    ]).then(([d,s])=>{
      setInfo(d);
      setSimilar((s?.results||[]).filter((r:any)=>r.poster_path).slice(0,8)
        .map((r:any)=>({...r,media_type:tv?"tv":"movie"})));
    });
  },[item.id,tv,isLocal,anime]);

  const data=info||item;
  const backdrop=isLocal?(item as any).img:(anime?item.poster_path:imgUrl(data.backdrop_path,"original"));
  const poster=isLocal?(item as any).img:imgUrl(item.poster_path||data.poster_path,"w500");
  const t=isLocal?(item as any).title:mediaTitle(data);
  const rating=data.vote_average?Number(data.vote_average).toFixed(1):"";
  const y=isLocal?(item as any).year:mediaYear(data);
  const hasVF=!!(item.frembed_link||(item as any).img);
  const prog=getProgress()[String(item.id)];
  const toggleL=()=>{
    if(inL){removeFromListe(item.id,item.media_type||"movie");setInL(false);}
    else{addToListe({...item,...(info||{})});setInL(true);}
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, zIndex:900, background:"rgba(0,0,0,0.78)",
        backdropFilter:"blur(10px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>

      <motion.div initial={{ y:60 }} animate={{ y:0 }}
        style={{ width:"100%", maxWidth:isMobile?"100%":820,
          maxHeight:isMobile?"93vh":"88vh", overflowY:"auto",
          background:"rgba(14,11,8,0.99)", backdropFilter:"blur(32px)",
          borderRadius:"20px 20px 0 0", scrollbarWidth:"none",
          border:`1px solid ${C.border}`, borderBottom:"none" }}>

        {/* Backdrop */}
        <div style={{ position:"relative", height:isMobile?"44vw":260,
          minHeight:isMobile?190:210, overflow:"hidden", borderRadius:"20px 20px 0 0" }}>
          {isMobile&&<div style={{ position:"absolute", top:8, left:"50%", transform:"translateX(-50%)",
            width:36, height:4, borderRadius:99, background:"rgba(255,255,255,0.18)", zIndex:5 }}/>}
          {backdrop&&<img src={backdrop} alt="" style={{ width:"100%", height:"100%", objectFit:"cover",
            objectPosition:isLocal||anime?"center top":"center 30%" }}/>}
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(to top,rgba(14,11,8,0.99) 0%,transparent 55%)" }}/>
          <button onClick={onClose}
            style={{ position:"absolute", top:12, right:12, width:32, height:32, borderRadius:99,
              background:"rgba(0,0,0,0.6)", border:`1px solid ${C.border}`, color:C.text,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:5 }}>
            <X size={14}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:isMobile?"0 16px 36px":"0 24px 36px" }}>
          {/* Header with poster */}
          <div style={{ display:"flex", gap:14, marginTop:-44, position:"relative", zIndex:1 }}>
            {poster&&<img src={poster} alt="" style={{ width:isMobile?78:90, borderRadius:10,
              flexShrink:0, objectFit:"cover", boxShadow:"0 12px 32px rgba(0,0,0,0.8)",
              alignSelf:"flex-end" }}/>}
            <div style={{ flex:1, paddingTop:isMobile?48:52 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                <h2 style={{ fontSize:isMobile?17:22, fontWeight:800, color:C.text,
                  letterSpacing:"-0.02em", lineHeight:1.15, flex:1 }}>{t}</h2>
                <button onClick={toggleL}
                  style={{ display:"flex", alignItems:"center", gap:4,
                    padding:isMobile?"6px 10px":"6px 12px", borderRadius:99,
                    background:inL?`${C.yellow}18`:C.glass,
                    border:`1px solid ${inL?C.yellow+"44":C.border}`,
                    color:inL?C.yellow:C.muted, fontSize:10, fontWeight:600, cursor:"pointer",
                    flexShrink:0, whiteSpace:"nowrap" }}>
                  {inL?<><BookmarkCheck size={11}/> Sauvé</>:<><Bookmark size={11}/> Liste</>}
                </button>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", marginTop:7 }}>
                {hasVF&&<span style={{ fontSize:7, fontWeight:800, color:"#fff",
                  background:"rgba(0,133,63,0.9)", borderRadius:99, padding:"2px 8px" }}>🇫🇷 VF</span>}
                {anime&&<span style={{ fontSize:7, fontWeight:800, color:"#fff",
                  background:"rgba(233,79,55,0.9)", borderRadius:99, padding:"2px 8px" }}>ANIME</span>}
                {/* Sources disponibles */}
                <span style={{ fontSize:7, color:C.green, background:"rgba(0,133,63,0.1)",
                  border:`1px solid rgba(0,133,63,0.25)`, borderRadius:99, padding:"2px 8px",
                  display:"flex", alignItems:"center", gap:3 }}>
                  <Zap size={7}/> 0 pub · FR sub · 5 sources
                </span>
                {rating&&<div style={{ display:"flex", alignItems:"center", gap:2 }}>
                  <Star size={9} color={C.yellow} fill={C.yellow}/>
                  <span style={{ fontSize:9, color:C.yellow, fontWeight:700 }}>{rating}</span>
                </div>}
                {y&&<span style={{ fontSize:10, color:C.muted }}>· {y}</span>}
                {anime&&item.total_episodes&&<span style={{ fontSize:10, color:C.muted }}>· {item.total_episodes} éps.</span>}
                <FlagStripe w={14} h={2}/>
              </div>
            </div>
          </div>

          {/* Progress */}
          {prog?.pct>2&&(
            <div style={{ marginTop:14 }}>
              <div style={{ height:3, borderRadius:99, background:"rgba(255,255,255,0.07)" }}>
                <div style={{ width:`${Math.min(prog.pct,100)}%`, height:"100%", borderRadius:99, background:C.yellow }}/>
              </div>
              <p style={{ fontSize:9, color:C.soft, marginTop:3 }}>{prog.pct}% regardé</p>
            </div>
          )}

          {/* Genres */}
          {!isLocal&&!anime&&info?.genres?.length>0&&(
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:13 }}>
              {info.genres.slice(0,4).map((g:any)=>(
                <span key={g.id} style={{ fontSize:9, padding:"3px 8px", borderRadius:99,
                  background:C.glass, border:`1px solid ${C.border}`, color:C.muted }}>{g.name}</span>
              ))}
            </div>
          )}
          {anime&&item.genres?.length>0&&(
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:13 }}>
              {item.genres.map((g:string,i:number)=>(
                <span key={i} style={{ fontSize:9, padding:"3px 8px", borderRadius:99,
                  background:"rgba(233,79,55,0.07)", border:`1px solid rgba(233,79,55,0.18)`,
                  color:"#e94f37" }}>{g}</span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {(isLocal?(item as any).overview:data.overview)&&(
            <p style={{ fontSize:isMobile?12:13, color:C.muted, lineHeight:1.8, marginTop:14 }}>
              {isLocal?(item as any).overview:data.overview}
            </p>
          )}

          {/* CTA */}
          <button onClick={()=>{ onClose(); onPlay(item); }}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"13px 0", width:"100%", borderRadius:14, background:C.yellow,
              color:"#000", fontSize:13, fontWeight:700, cursor:"pointer", border:"none", marginTop:18 }}>
            <Play size={13} fill="currentColor"/>
            {prog?.pct>2?"Reprendre":"Regarder"}
          </button>

          {/* Similaires */}
          {similar.length>0&&(
            <div style={{ marginTop:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <FlagStripe w={10} h={2}/>
                <h3 style={{ fontSize:9, fontWeight:600, letterSpacing:"0.22em",
                  textTransform:"uppercase", color:C.soft }}>Similaires</h3>
              </div>
              <div style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
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
const PageMaListe = ({ onCardClick, onRefresh }: { onCardClick:(i:any)=>void; onRefresh:()=>void }) => {
  const [liste,setListe]=useState<any[]>([]);
  useEffect(()=>setListe(getListe()),[]);
  const remove=(id:any,mt:string)=>{ removeFromListe(id,mt); setListe(getListe()); onRefresh(); };

  if(!liste.length) return (
    <div style={{ padding:"64px 24px", textAlign:"center" }}>
      <Bookmark size={36} color={C.soft} style={{ margin:"0 auto 16px", display:"block" }}/>
      <p style={{ fontSize:15, color:C.muted, fontWeight:600 }}>Ta liste est vide.</p>
      <p style={{ fontSize:12, color:C.soft, marginTop:8, lineHeight:1.7 }}>
        Ajoute des films ou séries depuis leur fiche.<br/>Appuie sur "Liste" pour sauvegarder.
      </p>
    </div>
  );

  return (
    <div style={{ paddingTop:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"0 16px" }}>
        <FlagStripe w={14} h={2}/>
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

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
const BottomNav = ({ active, setActive, listeCount }: {
  active:string; setActive:(s:string)=>void; listeCount:number;
}) => {
  const NAV=[
    { id:"accueil",   label:"Accueil",  Icon:Home },
    { id:"films",     label:"Films",    Icon:Film },
    { id:"series",    label:"Séries",   Icon:Tv },
    { id:"anime",     label:"Anime",    Icon:Zap },
    { id:"live",      label:"Live",     Icon:Radio },
    { id:"maListe",   label:"Liste",    Icon:Eye },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      background:"rgba(8,6,4,0.96)", backdropFilter:"blur(24px)",
      borderTop:`1px solid ${C.border}`,
      display:"flex", paddingBottom:"env(safe-area-inset-bottom,6px)" }}>
      {NAV.map(({ id,label,Icon })=>{
        const on=active===id;
        return (
          <button key={id} onClick={()=>setActive(id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              gap:3, padding:"9px 0 7px", background:"transparent", border:"none",
              cursor:"pointer", position:"relative", minWidth:0 }}>
            <Icon size={18} color={on?C.yellow:C.soft}/>
            <span style={{ fontSize:8, fontWeight:on?700:400, color:on?C.yellow:C.soft,
              letterSpacing:"0.03em", whiteSpace:"nowrap" }}>{label}</span>
            {id==="maListe"&&listeCount>0&&(
              <div style={{ position:"absolute", top:6, right:"calc(50% - 18px)",
                minWidth:14, height:14, borderRadius:99, background:C.yellow,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:7, fontWeight:800, color:"#000", padding:"0 3px" }}>
                {listeCount}
              </div>
            )}
            {on&&<motion.div layoutId="bnav-dot"
              style={{ position:"absolute", bottom:0, width:18, height:2,
                borderRadius:99, background:C.yellow }}/>}
          </button>
        );
      })}
    </div>
  );
};

// ── DESKTOP SIDEBAR ───────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, listeCount }: {
  active:string; setActive:(s:string)=>void; listeCount:number;
}) => {
  const [open,setOpen]=useState(true);
  const navigate=useNavigate();
  const NAV=[
    { id:"accueil",   label:"Accueil",   Icon:Home },
    { id:"films",     label:"Films",     Icon:Film },
    { id:"series",    label:"Séries",    Icon:Tv },
    { id:"anime",     label:"Anime",     Icon:Zap },
    { id:"live",      label:"TV Live",   Icon:Radio },
    { id:"tendances", label:"Tendances", Icon:TrendingUp },
    { id:"maListe",   label:"Ma liste",  Icon:Eye },
  ];
  return (
    <motion.aside animate={{ width:open?188:52 }} transition={{ type:"spring", stiffness:280, damping:28 }}
      style={{ position:"relative", display:"flex", flexDirection:"column", flexShrink:0, height:"100%",
        background:"rgba(8,6,4,0.72)", backdropFilter:"blur(32px)",
        borderRight:`1px solid ${C.border}` }}>

      <div style={{ display:"flex", alignItems:"center", gap:9, padding:"22px 12px 24px" }}>
        <Logo size={20}/>
        <AnimatePresence>
          {open&&<motion.div initial={{ opacity:0,x:-5 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", color:C.text, lineHeight:1 }}>KAYSETANE</div>
            <FlagStripe w={54} h={2}/>
          </motion.div>}
        </AnimatePresence>
      </div>

      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2, padding:"0 6px" }}>
        {NAV.map(({ id,label,Icon })=>{
          const on=active===id;
          return (
            <button key={id} onClick={()=>setActive(id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:11,
                width:"100%", cursor:"pointer", background:on?"rgba(255,255,255,0.07)":"transparent",
                border:on?`1px solid ${C.border}`:"1px solid transparent", position:"relative" }}>
              <Icon size={14} color={on?C.text:C.soft} style={{ flexShrink:0 }}/>
              <AnimatePresence>
                {open&&<motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ fontSize:12, fontWeight:on?600:400, color:on?C.text:C.soft, whiteSpace:"nowrap", flex:1, textAlign:"left" }}>
                  {label}
                </motion.span>}
              </AnimatePresence>
              {id==="maListe"&&listeCount>0&&(
                <div style={{ position:"absolute", right:on?20:2, top:7, minWidth:14, height:14,
                  borderRadius:99, background:C.yellow, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:7, fontWeight:800, color:"#000", padding:"0 3px" }}>
                  {listeCount}
                </div>
              )}
              {on&&<motion.div layoutId="snav-dot"
                style={{ position:"absolute", right:7, width:2, height:14, borderRadius:99, background:C.yellow }}/>}
            </button>
          );
        })}
      </nav>

      {/* Info card */}
      {open&&(
        <div style={{ padding:"0 7px 8px" }}>
          <div style={{ borderRadius:9, background:"rgba(0,133,63,0.07)",
            border:`1px solid rgba(0,133,63,0.18)`, padding:"8px 10px", marginBottom:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>
              <Zap size={9} color={C.green}/>
              <span style={{ fontSize:8, fontWeight:700, color:C.green, textTransform:"uppercase", letterSpacing:"0.1em" }}>Sans publicité</span>
            </div>
            <p style={{ fontSize:7, color:C.soft, lineHeight:1.5 }}>
              Frembed VF · VidLink · AutoEmbed<br/>
              Embed.su · sous-titres FR intégrés
            </p>
          </div>
          <div style={{ borderRadius:9, overflow:"hidden", height:50, position:"relative" }}>
            <img src={imgMosque} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.35 }}/>
            <div style={{ position:"absolute", bottom:4, left:8, fontSize:7, color:C.soft }}>Made in Dakar 🇸🇳</div>
          </div>
        </div>
      )}

      <div style={{ padding:"6px 7px 20px", borderTop:`1px solid ${C.border}` }}>
        <button onClick={()=>navigate("/")}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 11px", borderRadius:11,
            width:"100%", cursor:"pointer", background:"transparent", border:"none", color:C.soft }}>
          <ArrowLeft size={14} style={{ flexShrink:0 }}/>
          {open&&<span style={{ fontSize:12 }}>Déconnexion</span>}
        </button>
      </div>

      <button onClick={()=>setOpen(!open)}
        style={{ position:"absolute", right:-11, top:26, width:22, height:22, borderRadius:99,
          background:C.yellow, border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}>
        <motion.div animate={{ rotate:open?0:180 }}><ChevronRight size={11} color="#000"/></motion.div>
      </button>
    </motion.aside>
  );
};

// ── TABS CONFIG ───────────────────────────────────────────────────────────────
const FB_ROWS: Record<string,{label:string;loader:()=>Promise<any[]>}> = {
  vfMovies:  { label:"🇫🇷 Films VF — Populaires",     loader:()=>fbMovies(1,"popular") },
  vfMovies2: { label:"🆕 Films VF — Récents",           loader:()=>fbMovies(1,"latest")  },
  vfTV:      { label:"🇫🇷 Séries VF — Populaires",    loader:()=>fbTV(1,"popular")     },
  vfTV2:     { label:"🆕 Séries VF — Récentes",         loader:()=>fbTV(1,"latest")      },
};

const TABS: Record<string,any[]> = {
  accueil: [
    { k:"trW",   p:"/trending/all/week",   label:"🔥 Tendances" },
    { k:"popM",  p:"/movie/popular",       label:"🎬 Films populaires" },
    { k:"popTV", p:"/tv/popular",          label:"📺 Séries populaires" },
    { k:"topM",  p:"/movie/top_rated",     label:"⭐ Mieux notés" },
    { k:"nowM",  p:"/movie/now_playing",   label:"🎭 Au cinéma" },
  ],
  films: [
    { k:"vfMovies", type:"fb", label:"🇫🇷 Films VF maintenant" },
    { k:"vfMovies2",type:"fb", label:"🆕 Films VF récents" },
    { k:"fpop",  p:"/movie/popular",       label:"🔥 Populaires" },
    { k:"ftop",  p:"/movie/top_rated",     label:"⭐ Mieux notés" },
    { k:"fact",  p:"/discover/movie",      label:"💥 Action",   params:{ with_genres:"28" } },
    { k:"fcom",  p:"/discover/movie",      label:"😂 Comédie",  params:{ with_genres:"35" } },
    { k:"fhor",  p:"/discover/movie",      label:"👻 Horreur",  params:{ with_genres:"27" } },
    { k:"fsci",  p:"/discover/movie",      label:"🚀 Sci-Fi",   params:{ with_genres:"878" } },
    { k:"fdra",  p:"/discover/movie",      label:"🎭 Drame",    params:{ with_genres:"18" } },
  ],
  series: [
    { k:"vfTV",  type:"fb", label:"🇫🇷 Séries VF maintenant" },
    { k:"vfTV2", type:"fb", label:"🆕 Séries VF récentes" },
    { k:"spop",  p:"/tv/popular",          label:"🔥 Populaires" },
    { k:"stop",  p:"/tv/top_rated",        label:"⭐ Mieux notées" },
    { k:"sair",  p:"/tv/on_the_air",       label:"📡 En diffusion" },
    { k:"sanim", p:"/discover/tv",         label:"🎌 Animation", params:{ with_genres:"16" } },
    { k:"scrim", p:"/discover/tv",         label:"🔍 Crime",     params:{ with_genres:"80" } },
    { k:"sdoc",  p:"/discover/tv",         label:"📖 Documentaire", params:{ with_genres:"99" } },
  ],
  tendances: [
    { k:"tdW",   p:"/trending/all/week",   label:"Cette semaine" },
    { k:"tdMW",  p:"/trending/movie/week", label:"Films · semaine" },
    { k:"tdTW",  p:"/trending/tv/week",    label:"Séries · semaine" },
    { k:"tdMD",  p:"/trending/movie/day",  label:"Films · aujourd'hui" },
  ],
  anime:[], live:[], maListe:[],
};

// ── SEARCH BAR ────────────────────────────────────────────────────────────────
const SearchBar = ({ query, onChange, isMobile }: { query:string; onChange:(q:string)=>void; isMobile:boolean }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 13px", borderRadius:12,
    background:C.glass, border:`1px solid ${C.border}`, width:isMobile?"100%":210 }}>
    <Search size={13} color={C.muted}/>
    <input type="text" placeholder="Films, séries, anime…" value={query}
      onChange={e=>onChange(e.target.value)}
      style={{ background:"transparent", border:"none", outline:"none", flex:1, fontSize:12, color:C.text }}/>
    {query&&<button onClick={()=>onChange("")}
      style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:0, display:"flex" }}>
      <X size={11}/></button>}
  </div>
);

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab,setTab]             = useState("accueil");
  const [rows,setRows]           = useState<Record<string,any[]>>({});
  const [busy,setBusy]           = useState<Record<string,boolean>>({});
  const [heroItems,setHeroItems] = useState<any[]>([]);
  const [query,setQuery]         = useState("");
  const [searchRes,setSearchRes] = useState<any[]>([]);
  const [searching,setSearching] = useState(false);
  const [player,setPlayer]       = useState<any>(null);
  const [detail,setDetail]       = useState<any>(null);
  const [listeCount,setListeCount]   = useState(getListe().length);
  const [showSearch,setShowSearch]   = useState(false);
  const stimer = useRef<any>(null);
  const isMobile = useIsMobile();

  const refreshListe = () => setListeCount(getListe().length);

  // Load tab data
  const loadTab = useCallback(async (t:string) => {
    const cfg = TABS[t]||[];
    for (const row of cfg) {
      const { k,p,params={},type } = row as any;
      if(rows[k]!==undefined) continue;
      setBusy(prev=>({...prev,[k]:true}));
      if(type==="fb") {
        const items = FB_ROWS[k] ? await FB_ROWS[k].loader() : [];
        setRows(prev=>({...prev,[k]:items}));
        setBusy(prev=>({...prev,[k]:false}));
      } else {
        const d = await tmdb(p,params);
        const items = (d?.results||[]).filter((r:any)=>r.poster_path).slice(0,20)
          .map((r:any)=>({...r,media_type:r.media_type||(p.includes("/tv")||p.includes("discover/tv")?"tv":"movie")}));
        setRows(prev=>({...prev,[k]:items}));
        setBusy(prev=>({...prev,[k]:false}));
        if(t==="accueil"&&k==="trW"&&items.length&&heroItems.length===0) setHeroItems(items.slice(0,8));
      }
    }
  },[rows,heroItems]);

  useEffect(()=>{ loadTab(tab); },[tab]);

  // Search: films + séries + anime
  const doSearch = async(q:string) => {
    if(!q.trim()){setSearchRes([]);setSearching(false);return;}
    setSearching(true);
    const [mv,tv,ani] = await Promise.all([
      tmdb("/search/movie",{query:q}),
      tmdb("/search/tv",{query:q}),
      jikan("/anime",{q,limit:"10"}),
    ]);
    setSearchRes([
      ...(mv?.results||[]).filter((r:any)=>r.poster_path).slice(0,10).map((r:any)=>({...r,media_type:"movie"})),
      ...(tv?.results||[]).filter((r:any)=>r.poster_path).slice(0,10).map((r:any)=>({...r,media_type:"tv"})),
      ...(ani?.data||[]).map(jikanToItem).filter((a:any)=>a.poster_path).slice(0,8),
    ]);
    setSearching(false);
  };

  const handleSearch = (q:string) => {
    setQuery(q);
    if(stimer.current) clearTimeout(stimer.current);
    if(q) stimer.current=setTimeout(()=>doSearch(q),420); else setSearchRes([]);
  };

  const PAGE: Record<string,string> = {
    accueil:"Accueil", films:"Films", series:"Séries",
    anime:"Anime", live:"TV en direct", tendances:"Tendances", maListe:"Ma liste",
  };

  const mainContent = (
    <AnimatePresence mode="wait">
      <motion.div key={tab+query} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        transition={{ duration:0.18 }}>
        {query ? (
          /* Search results */
          <div style={{ padding:isMobile?"16px 16px 0":"16px 0 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <FlagStripe w={12} h={2}/>
              <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.16em",
                textTransform:"uppercase", color:C.soft }}>
                {searching?"Recherche…":`${searchRes.length} résultat${searchRes.length>1?"s":""}`}
              </p>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {searchRes.map((item,i)=><MediaCard key={`${item.id}-${i}`} item={item} onClick={setDetail}/>)}
            </div>
          </div>
        ) : tab==="maListe" ? (
          <PageMaListe onCardClick={setDetail} onRefresh={refreshListe}/>
        ) : tab==="anime" ? (
          /* Anime section - Bientôt disponible */
          <div style={{ padding:isMobile?"16px 16px 0":"16px 0 0", display:"flex", alignItems:"center", justifyContent:"center", minHeight:"400px" }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:16, fontWeight:700, color:C.yellow, marginBottom:10 }}>Bientôt disponible</p>
              <p style={{ fontSize:12, color:C.muted }}>Les animes seront disponibles très bientôt</p>
            </div>
          </div>
        ) : tab==="live" ? (
          /* Live TV section - Bientôt disponible */
          <div style={{ padding:isMobile?"16px 16px 0":"16px 0 0", display:"flex", alignItems:"center", justifyContent:"center", minHeight:"400px" }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:16, fontWeight:700, color:C.yellow, marginBottom:10 }}>Bientôt disponible</p>
              <p style={{ fontSize:12, color:C.muted }}>La TV en direct sera disponible très bientôt</p>
            </div>
          </div>
        ) : (
          <>
            {tab==="accueil"&&(
              <div style={{ padding:isMobile?"10px 0 0":"14px 0 0" }}>
                <div style={{ padding:isMobile?"0 16px":"0" }}>
                  <HeroBanner items={heroItems} onPlay={setPlayer} onDetail={setDetail}/>
                </div>
                {/* VF rows on accueil */}
                {Object.entries(FB_ROWS).map(([k,{label}])=>(
                  <MediaRow key={k} label={label} items={rows[k]||[]}
                    loading={!!busy[k]&&!rows[k]?.length} onCardClick={setDetail}/>
                ))}
              </div>
            )}
            <div style={{ paddingTop:tab!=="accueil"?isMobile?12:18:0 }}>
              {(TABS[tab]||[]).map(({k,label})=>(
                <MediaRow key={k} label={label} items={rows[k]||[]}
                  loading={!!busy[k]&&!rows[k]?.length} onCardClick={setDetail}/>
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap');
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        *{box-sizing:border-box;} ::-webkit-scrollbar{display:none;}
        button{font-family:inherit;cursor:pointer;} input{font-family:inherit;}
        a{color:inherit;}
      `}</style>

      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0,
        background:"linear-gradient(160deg,#100b06 0%,#0c0a08 50%,#080608 100%)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 90% 50% at 50% 0%,rgba(0,133,63,0.05) 0%,transparent 60%)" }}/>

      <div style={{ position:"relative", zIndex:10, display:"flex", width:"100%", height:"100%" }}>
        {/* Desktop sidebar */}
        {!isMobile&&(
          <Sidebar active={tab} listeCount={listeCount}
            setActive={t=>{ setTab(t); setQuery(""); setSearchRes([]); refreshListe(); }}/>
        )}

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden",
          paddingBottom:isMobile?62:0 }}>

          {/* Header */}
          <div style={{ flexShrink:0,
            padding:isMobile?"11px 16px 8px":"11px 24px 0",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            background:isMobile?"rgba(8,6,4,0.92)":"transparent",
            backdropFilter:isMobile?"blur(24px)":"none",
            borderBottom:isMobile?`1px solid ${C.border}`:"none",
            position:isMobile?"sticky":"relative", top:0, zIndex:50 }}>

            {isMobile ? (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Logo size={19}/>
                  <div>
                    <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.18em",
                      textTransform:"uppercase", color:C.text, lineHeight:1 }}>KAYSETANE</div>
                    <FlagStripe w={46} h={2}/>
                  </div>
                </div>
                <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                  <button onClick={()=>setShowSearch(!showSearch)}
                    style={{ width:34, height:34, borderRadius:10, background:C.glass,
                      border:`1px solid ${C.border}`, color:C.muted,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Search size={15}/>
                  </button>
                  <div style={{ width:32, height:32, borderRadius:99, background:C.yellow,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:800, color:"#000" }}>MN</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <FlagStripe w={14} h={2}/>
                  <h1 style={{ fontSize:11, fontWeight:500, color:C.soft,
                    letterSpacing:"0.1em", textTransform:"uppercase" }}>{PAGE[tab]||tab}</h1>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <SearchBar query={query} onChange={handleSearch} isMobile={false}/>
                  <div style={{ width:32, height:32, borderRadius:99, background:C.yellow,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:800, color:"#000", cursor:"pointer" }}>MN</div>
                </div>
              </>
            )}
          </div>

          {/* Mobile search expand */}
          <AnimatePresence>
            {isMobile&&showSearch&&(
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                exit={{ height:0, opacity:0 }}
                style={{ padding:"8px 16px", background:"rgba(8,6,4,0.92)",
                  backdropFilter:"blur(24px)", borderBottom:`1px solid ${C.border}`, overflow:"hidden" }}>
                <SearchBar query={query}
                  onChange={q=>{ handleSearch(q); if(!q) setShowSearch(false); }}
                  isMobile={true}/>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll area */}
          <main style={{ flex:1, overflowY:"auto", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
            {mainContent}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      {isMobile&&(
        <BottomNav active={tab} listeCount={listeCount}
          setActive={t=>{ setTab(t); setQuery(""); setSearchRes([]); setShowSearch(false); refreshListe(); }}/>
      )}

      {/* Modals */}
      <AnimatePresence>
        {detail&&<DetailModal key="detail" item={detail}
          onClose={()=>{ setDetail(null); refreshListe(); }}
          onPlay={it=>{ setDetail(null); setPlayer(it); }}/>}
      </AnimatePresence>
      <AnimatePresence>
        {player&&<PlayerModal key="player" item={player} onClose={()=>setPlayer(null)}/>}
      </AnimatePresence>
      {/* LivePlayerModal - Commenté - Bientôt disponible */}
      {/* 
      <AnimatePresence>
        {liveChannel&&<LivePlayerModal key="live" channel={liveChannel}
          allChannels={LIVE_CHANNELS}
          onClose={()=>setLiveChannel(null)}
          onSwitch={(ch:any)=>setLiveChannel(ch)}/>}
      </AnimatePresence>
      */}
    </div>
  );
}