"use client";
import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, ChevronRight } from "lucide-react";

// ── ASSETS — Photos Sénégal ───────────────────────────────────────────────────
import bgVideo         from "../assets/low.mp4";
import imgMonument     from "../assets/mariams-monument-246975_1920.jpg";
import imgMosque       from "../assets/mariams-fisherman-mosque-246976_1920.jpg";
import imgBridge       from "../assets/christianyanndiedhiou-senegalbridge-4737659_1920.jpg";
import imgFlag         from "../assets/kaufdex-senegal-2702722_1920.jpg";
import imgBeach        from "../assets/7929e082-3435-4ff8-ac9a-f77ff9944872.jpg";
import imgStreet       from "../assets/60385759-973a-4780-9c16-5da0b7f2b148.jpg";
import imgWoman        from "../assets/3bbb2f3f-f9d3-4495-8ad8-ee3c6a311e29.jpg";
import imgMarket       from "../assets/d78c08a5-8d6a-4db6-8649-afc1db917a32.jpg";
import imgGradient     from "../assets/c814ccce-500d-4346-a9a4-deb5da731e89.jpg";
import imgStatuette    from "../assets/anaterate-few-2919164_1920.png";

// ── FILM ARTWORKS ─────────────────────────────────────────────────────────────
import posterSuperman    from "../assets/Superman.jpg";
import posterTrumanShow  from "../assets/The_Truman_Show.jpg";
import posterJoker       from "../assets/JOKER_poster_fan-art_-_NIMROD___.jpg";
import posterOppenheimer from "../assets/Oppenheimer_movie_poster.jpg";
import posterInterstellar from "../assets/Interstellar.jpg";

// ── PALETTE ───────────────────────────────────────────────────────────────────
const C = {
  green:   "#00853F",
  yellow:  "#FDEF42",
  red:     "#E31B23",
  glass:   "rgba(10,8,6,0.45)",
  glassMd: "rgba(10,8,6,0.62)",
  glassLt: "rgba(255,255,255,0.06)",
  border:  "rgba(255,255,255,0.10)",
  borderHi:"rgba(255,255,255,0.22)",
  text:    "#F5EFE6",
  muted:   "rgba(245,239,230,0.58)",
  soft:    "rgba(245,239,230,0.32)",
  bg:      "#0C0A08",
};

// ── FLAG STRIPE ───────────────────────────────────────────────────────────────
const FlagStripe: React.FC<{ width?: number; height?: number }> = ({ width = 44, height = 2 }) => (
  <div style={{ display:"flex", height, borderRadius:99, overflow:"hidden", width, flexShrink:0 }}>
    <div style={{ flex:1, background:C.green }}/>
    <div style={{ flex:1, background:C.yellow }}/>
    <div style={{ flex:1, background:C.red }}/>
  </div>
);

// ── LOGO — statuette réelle en PNG ────────────────────────────────────────────
const Logo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <img src={imgStatuette} alt="KaySetane"
    style={{ width:size, height:Math.round(size*1.6), objectFit:"contain",
      objectPosition:"center top", filter:"brightness(0.9) contrast(1.1)",
      mixBlendMode:"screen" }}/>
);

// ── GLASS CARD ────────────────────────────────────────────────────────────────
const GlassCard: React.FC<{ children:React.ReactNode; style?:React.CSSProperties; hover?:boolean }> =
({ children, style, hover }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>hover&&setHov(true)} onMouseLeave={()=>hover&&setHov(false)}
      style={{ background: hov ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.055)",
        backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
        border:`1px solid ${hov ? C.borderHi : C.border}`, borderRadius:20,
        transition:"all 0.3s ease", ...style }}>
      {children}
    </div>
  );
};

// ── TYPING WOLOF ──────────────────────────────────────────────────────────────
const TypingWolof: React.FC = () => {
  const phrases = ["Xool ci kaw.", "Dem sa bàkk.", "Stream libre.", "Cinéma bu bees."];
  const [wi, setWi] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    let ms = del ? 48 : 98;
    if (!del && txt === phrases[wi]) ms = 2400;
    const t = setTimeout(() => {
      if (!del && txt !== phrases[wi])      setTxt(phrases[wi].slice(0, txt.length+1));
      else if (!del && txt === phrases[wi]) setDel(true);
      else if (del && txt.length > 0)       setTxt(phrases[wi].slice(0, txt.length-1));
      else { setDel(false); setWi(p=>(p+1)%phrases.length); }
    }, ms);
    return () => clearTimeout(t);
  }, [txt, del, wi]);
  return <span>{txt}<span style={{ color:C.yellow, opacity:0.8 }}>|</span></span>;
};

// ── NAVBAR ────────────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.6 }}
      style={{ position:"fixed", top:16, left:0, right:0, zIndex:200,
        display:"flex", justifyContent:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:4,
        background: scrolled ? "rgba(8,6,4,0.90)" : "rgba(8,6,4,0.50)",
        backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
        border:`1px solid ${C.border}`, borderRadius:99,
        padding:"6px 10px", transition:"all 0.4s",
        boxShadow: scrolled ? "0 12px 48px rgba(0,0,0,0.6)" : "none" }}>

        <div style={{ display:"flex", alignItems:"center", gap:10,
          paddingRight:14, borderRight:`1px solid ${C.border}`, marginRight:4 }}>
          <Logo size={24} />
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.22em",
              textTransform:"uppercase", color:C.text, lineHeight:1 }}>KAYSETANE</div>
            <FlagStripe width={64}/>
          </div>
        </div>

        {[["Vision","#vision"],["Catalogue","#catalogue"],["Tarifs","#tarifs"]].map(([l,h])=>(
          <a key={l} href={h} style={{ fontSize:11, fontWeight:400, color:C.muted,
            padding:"6px 13px", borderRadius:99, textDecoration:"none", transition:"color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.color=C.text)}
            onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}>{l}</a>
        ))}

        <button onClick={()=>navigate("/KaySetane")}
          style={{ marginLeft:4, padding:"8px 20px", borderRadius:99,
            background:C.yellow, color:"#000", fontSize:11, fontWeight:700,
            border:"none", cursor:"pointer", transition:"all 0.2s",
            display:"flex", alignItems:"center", gap:6 }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#fff";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=C.yellow;}}>
          <Play size={10} fill="#000"/> Xool leegi
        </button>
      </div>
    </motion.nav>
  );
};

// ── HERO — vidéo low.mp4 en fond ──────────────────────────────────────────────
const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.22], [1, 0.9]);

  const films = [
    { title:"Superman",     year:"2025", img:posterSuperman,    color:"#0d2a45" },
    { title:"The Truman Show", year:"1998", img:posterTrumanShow, color:"#1a3a4a" },
    { title:"Joker",        year:"2019", img:posterJoker,       color:"#2a0a0a" },
  ];

  return (
    <section style={{ position:"relative", height:"100vh", overflow:"hidden", zIndex:10 }}>

      {/* VIDEO BACKGROUND */}
      <div style={{ position:"absolute", inset:0, zIndex:0 }}>
        <video autoPlay muted loop playsInline
          style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.55 }}>
          <source src={bgVideo} type="video/mp4"/>
        </video>
        {/* Overlays */}
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom, rgba(12,10,8,0.3) 0%, transparent 30%, rgba(12,10,8,0.7) 100%)" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to right, rgba(12,10,8,0.85) 0%, rgba(12,10,8,0.3) 55%, transparent 100%)" }}/>
        {/* Flag color glow */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, display:"flex" }}>
          <div style={{ flex:1, background:C.green }}/>
          <div style={{ flex:1, background:C.yellow }}/>
          <div style={{ flex:1, background:C.red }}/>
        </div>
      </div>

      {/* CONTENT */}
      <motion.div style={{ scale:heroScale, opacity:heroOpacity,
        position:"relative", zIndex:2, height:"100%",
        display:"grid", gridTemplateColumns:"1fr 1fr", gap:48,
        alignItems:"center", maxWidth:1200, margin:"0 auto", padding:"0 48px" }}>

        {/* LEFT TEXT */}
        <div>
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.2 }}
            style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <FlagStripe/>
            <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.36em",
              textTransform:"uppercase", color:C.soft }}>Streaming bu Sénégal wi</span>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.35, duration:0.85 }}
            style={{ fontSize:"clamp(44px,5.5vw,76px)", fontWeight:800,
              letterSpacing:"-0.04em", lineHeight:1.0, color:C.text,
              marginBottom:22, fontStyle:"italic" }}>
            <TypingWolof/>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.5 }}
            style={{ fontSize:14, color:C.muted, lineHeight:1.85, maxWidth:420,
              marginBottom:36, fontWeight:400 }}>
            Films, séries, cinéma africain —
            {" "}<span style={{ color:C.yellow, fontWeight:600 }}>sans interruption</span>,
            sans abonnement forcé.
          </motion.p>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.65 }}
            style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button onClick={()=>navigate("/KaySetane")}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 28px",
                borderRadius:99, background:C.yellow, color:"#000",
                fontSize:12, fontWeight:700, letterSpacing:"0.06em",
                border:"none", cursor:"pointer", transition:"transform 0.2s" }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.04)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";}}>
              <Play size={12} fill="#000"/> Wax ci kaw — Gratis
            </button>
            <button style={{ padding:"13px 22px", borderRadius:99,
              background:"rgba(255,255,255,0.08)", backdropFilter:"blur(12px)",
              border:`1px solid ${C.border}`, color:C.muted, fontSize:12,
              cursor:"pointer", transition:"all 0.2s",
              display:"flex", alignItems:"center", gap:6 }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.color=C.text;
                (e.currentTarget as HTMLElement).style.borderColor=C.borderHi; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.color=C.muted;
                (e.currentTarget as HTMLElement).style.borderColor=C.border; }}>
              Xool catalogue →
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
            style={{ display:"flex", gap:36, marginTop:48 }}>
            {[
              { val:"12k+", label:"Films ak série yi", c:C.yellow },
              { val:"4K",   label:"Ultra HD natif",    c:C.green  },
              { val:"0 F",  label:"Frais cachés",      c:C.red    },
            ].map((s,i)=>(
              <div key={i}>
                <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", color:s.c }}>{s.val}</div>
                <div style={{ fontSize:9, fontWeight:500, color:C.soft,
                  textTransform:"uppercase", letterSpacing:"0.2em", marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Film poster cards */}
        <div style={{ position:"relative", height:480 }}>
          {films.map((f,i)=>(
            <motion.div key={i}
              initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.4+i*0.18, duration:0.9, ease:"easeOut" }}
              style={{ position:"absolute",
                top:[0,90,205][i], left:[20,110,5][i],
                width:[200,185,195][i],
                rotate:([-5,0,6][i]) as any,
                zIndex:3-i }}>
              <GlassCard hover style={{ overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.7)" }}>
                <div style={{ position:"relative" }}>
                  <img src={f.img} alt={f.title}
                    style={{ width:"100%", height:[260,240,250][i],
                      objectFit:"cover", display:"block" }}/>
                  {/* Overlay gradient */}
                  <div style={{ position:"absolute", inset:0,
                    background:"linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }}/>
                  {/* Flag color left bar */}
                  <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%",
                    background:[C.green,C.yellow,C.red][i] }}/>
                  {/* Play button hover */}
                  <div style={{ position:"absolute", inset:0, display:"flex",
                    alignItems:"center", justifyContent:"center", opacity:0.6 }}>
                    <div style={{ width:36, height:36, borderRadius:99,
                      background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Play size={14} color={C.yellow} fill={C.yellow}/>
                    </div>
                  </div>
                </div>
                <div style={{ padding:"10px 13px" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{f.title}</div>
                  <div style={{ fontSize:9, color:C.soft, marginTop:2 }}>{f.year}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          {/* Glow */}
          <div style={{ position:"absolute", top:"35%", left:"30%", width:200, height:200,
            borderRadius:"50%", background:`radial-gradient(circle, rgba(0,133,63,0.12) 0%, transparent 70%)`,
            pointerEvents:"none" }}/>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:8, zIndex:10 }}>
        <motion.div animate={{ y:[0,6,0] }} transition={{ duration:2.2, repeat:Infinity }}>
          <ChevronRight size={13} color={C.soft} style={{ transform:"rotate(90deg)" }}/>
        </motion.div>
        <span style={{ fontSize:7, textTransform:"uppercase", letterSpacing:"0.6em", color:C.soft }}>Scroll</span>
      </div>
    </section>
  );
};

// ── TICKER ────────────────────────────────────────────────────────────────────
const Ticker: React.FC = () => {
  const items = ["Xool ci kaw","·","Films yi","·","Série yi","·",
    "Cinéma Afrique","·","4K Ultra HD","·","Gratis","·","Sénégal","·","Xam xam","·"];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${C.border}`,
      borderBottom:`1px solid ${C.border}`, padding:"12px 0",
      background:"rgba(255,255,255,0.012)", position:"relative", zIndex:10 }}>
      <motion.div animate={{ x:["0%","-50%"] }}
        transition={{ duration:30, repeat:Infinity, ease:"linear" }}
        style={{ display:"flex", gap:52, whiteSpace:"nowrap" }}>
        {[...items,...items].map((item,i)=>(
          <span key={i} style={{ fontSize:9, fontWeight:600, textTransform:"uppercase",
            letterSpacing:"0.3em", color:item==="·"?C.yellow:C.soft }}>{item}</span>
        ))}
      </motion.div>
    </div>
  );
};

// ── VISION SECTION — photos Sénégal en grid ───────────────────────────────────
const VisionSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="vision" style={{ position:"relative", zIndex:10,
      padding:"120px 48px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start", marginBottom:72 }}>
        <div style={{ position:"sticky", top:80 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <FlagStripe/>
            <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.36em",
              textTransform:"uppercase", color:C.soft }}>Ci kanam — Notre vision</span>
          </div>
          <h2 style={{ fontSize:"clamp(36px,5vw,58px)", fontWeight:800,
            letterSpacing:"-0.04em", lineHeight:1.05, color:C.text, marginBottom:24 }}>
            Dafa am<br/>
            <span style={{ color:C.soft, fontStyle:"italic" }}>xam xam.</span>
          </h2>
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.85, maxWidth:400, marginBottom:32 }}>
            Le Sénégal a une âme. Ses films, sa musique, ses histoires méritent d'être vus
            dans la meilleure qualité possible — par chaque Sénégalais, partout dans le monde.
          </p>
          <div style={{ display:"flex", gap:4, marginBottom:32 }}>
            <FlagStripe width={20} height={3}/>
            <FlagStripe width={20} height={3}/>
            <FlagStripe width={20} height={3}/>
          </div>
          <button onClick={()=>navigate("/KaySetane")}
            style={{ display:"inline-flex", alignItems:"center", gap:8,
              padding:"12px 24px", borderRadius:99, background:C.yellow, color:"#000",
              fontSize:11, fontWeight:700, border:"none", cursor:"pointer", transition:"transform 0.2s" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.04)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";}}>
            <Play size={11} fill="#000"/> Xool leegi
          </button>
        </div>

        {/* Photo grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {/* Big photo */}
          <div style={{ gridColumn:"1 / 3", position:"relative", borderRadius:18, overflow:"hidden", height:220 }}>
            <img src={imgMosque} alt="Mosquée des Divinités"
              style={{ width:"100%", height:"100%", objectFit:"cover",
                filter:"brightness(0.85) contrast(1.05)" }}/>
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(to top, rgba(12,10,8,0.7) 0%, transparent 60%)" }}/>
            <div style={{ position:"absolute", bottom:14, left:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <FlagStripe width={24}/>
                <span style={{ fontSize:9, color:C.soft, fontWeight:500, letterSpacing:"0.15em" }}>
                  Mosquée des Divinités · Dakar
                </span>
              </div>
            </div>
          </div>

          {[imgMonument, imgBridge, imgBeach, imgWoman].map((src, i)=>(
            <div key={i} style={{ position:"relative", borderRadius:14, overflow:"hidden", height:130 }}>
              <img src={src} alt=""
                style={{ width:"100%", height:"100%", objectFit:"cover",
                  filter:"brightness(0.8) contrast(1.05)" }}/>
              <div style={{ position:"absolute", inset:0,
                background:"linear-gradient(to top, rgba(12,10,8,0.5) 0%, transparent 60%)" }}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── FEATURES ──────────────────────────────────────────────────────────────────
const Features: React.FC = () => {
  const feats = [
    { num:"01", title:"Cinéma Sénégalais", sub:"Sembène — bi ñu sant",
      desc:"Céddo, Moolaadé, Xala, Touki Bouki — les chefs-d'œuvre africains en HD.", accent:C.yellow },
    { num:"02", title:"Stream bi dafa yomb", sub:"Qualité sans effort",
      desc:"HD sur mobile, 4K sur grand écran. S'adapte à ta connexion sans coupure.", accent:C.green },
    { num:"03", title:"Dafa am solo", sub:"Tout le continent",
      desc:"Nigéria, Côte d'Ivoire, Mali, Ghana — meilleur du cinéma ouest-africain.", accent:C.red },
    { num:"04", title:"Offline — Mbedd wi", sub:"Sans connexion",
      desc:"Télécharge et regarde dans le bus, le train. Pensé pour la réalité du Sénégal.", accent:C.yellow },
    { num:"05", title:"Dafa soxor", sub:"0 publicité",
      desc:"Aucune coupure, aucun pop-up. Ton film, du début à la fin.", accent:C.green },
    { num:"06", title:"Waaxi — Gratuit", sub:"Bëgëne la",
      desc:"Accès de base 100% gratuit. Aucune carte bancaire pour commencer.", accent:C.red },
  ];

  return (
    <section id="catalogue" style={{ position:"relative", zIndex:10,
      padding:"60px 48px 120px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ marginBottom:64 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <FlagStripe/>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.36em",
            textTransform:"uppercase", color:C.soft }}>Fonctionnalités</span>
        </div>
        <h2 style={{ fontSize:"clamp(36px,5vw,58px)", fontWeight:800,
          letterSpacing:"-0.04em", lineHeight:1.05, color:C.text }}>
          Xam xam bi<br/>
          <span style={{ color:C.soft, fontStyle:"italic" }}>dafa am solo.</span>
        </h2>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {feats.map((f,i)=>(
          <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:i*0.07 }}>
            <GlassCard hover style={{ padding:"32px 28px", height:"100%",
              borderTop:`2px solid ${f.accent}22` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
                <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.25em",
                  textTransform:"uppercase", color:C.soft }}>{f.sub}</span>
                <span style={{ fontSize:11, fontWeight:700, color:`${f.accent}55` }}>{f.num}</span>
              </div>
              <div style={{ width:26, height:2, background:f.accent, borderRadius:99, marginBottom:14 }}/>
              <h3 style={{ fontSize:17, fontWeight:700, color:C.text,
                letterSpacing:"-0.02em", marginBottom:10, lineHeight:1.25 }}>{f.title}</h3>
              <p style={{ fontSize:12, color:C.muted, lineHeight:1.8 }}>{f.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ── FILM SHOWCASE — posters avec noms ─────────────────────────────────────────
const FilmShowcase: React.FC = () => {
  const navigate = useNavigate();
  const films = [
    { title:"Superman",          year:"2025", img:posterSuperman,     accent:C.yellow },
    { title:"The Truman Show",   year:"1998", img:posterTrumanShow,   accent:C.green  },
    { title:"Joker",             year:"2019", img:posterJoker,        accent:C.red    },
    { title:"Oppenheimer",       year:"2023", img:posterOppenheimer,  accent:C.yellow },
    { title:"Interstellar",      year:"2014", img:posterInterstellar, accent:C.green  },
  ];

  return (
    <section style={{ position:"relative", zIndex:10,
      padding:"40px 0 80px", overflow:"hidden" }}>
      {/* BG — photo marché */}
      <div style={{ position:"absolute", inset:0 }}>
        <img src={imgMarket} alt="" style={{ width:"100%", height:"100%",
          objectFit:"cover", opacity:0.12, filter:"blur(4px) saturate(0.6)" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom, rgba(12,10,8,1) 0%, rgba(12,10,8,0.7) 50%, rgba(12,10,8,1) 100%)" }}/>
      </div>

      <div style={{ position:"relative", zIndex:2, maxWidth:1200, margin:"0 auto", padding:"0 48px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <FlagStripe/>
            <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.36em",
              textTransform:"uppercase", color:C.soft }}>Films populaires</span>
          </div>
          <button onClick={()=>navigate("/KaySetane")}
            style={{ fontSize:10, color:C.muted, background:"none", border:"none",
              cursor:"pointer", letterSpacing:"0.1em", display:"flex", alignItems:"center", gap:4 }}>
            Xool yëpp → 
          </button>
        </div>

        <div style={{ display:"flex", gap:16, overflowX:"auto", scrollbarWidth:"none", paddingBottom:8 }}>
          {films.map((f,i)=>(
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.08 }}
              onClick={()=>navigate("/KaySetane")}
              style={{ flexShrink:0, width:175, cursor:"pointer" }}>
              <div style={{ position:"relative", borderRadius:14, overflow:"hidden",
                height:260, marginBottom:10,
                boxShadow:"0 12px 40px rgba(0,0,0,0.7)",
                transition:"transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e=>{
                  (e.currentTarget as HTMLElement).style.transform="scale(1.05) translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow="0 24px 60px rgba(0,0,0,0.8)";
                }}
                onMouseLeave={e=>{
                  (e.currentTarget as HTMLElement).style.transform="scale(1) translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow="0 12px 40px rgba(0,0,0,0.7)";
                }}>
                <img src={f.img} alt={f.title}
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                <div style={{ position:"absolute", inset:0,
                  background:"linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)" }}/>
                {/* Flag accent */}
                <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%",
                  background:f.accent }}/>
                {/* Play */}
                <div style={{ position:"absolute", inset:0, display:"flex",
                  alignItems:"center", justifyContent:"center", opacity:0 }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.opacity="1";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.opacity="0";}}>
                  <div style={{ width:44, height:44, borderRadius:99,
                    background:C.yellow, display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:`0 4px 20px ${C.yellow}66` }}>
                    <Play size={16} color="#000" fill="#000"/>
                  </div>
                </div>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:2 }}>{f.title}</div>
              <div style={{ fontSize:9, color:C.soft }}>{f.year}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── SENEGAL BAND — photo flag + bridge ────────────────────────────────────────
const SenegalBand: React.FC = () => (
  <div style={{ position:"relative", height:280, overflow:"hidden", zIndex:10 }}>
    <div style={{ display:"flex", height:"100%" }}>
      <div style={{ flex:1, overflow:"hidden" }}>
        <img src={imgFlag} alt="Drapeau Sénégal"
          style={{ width:"100%", height:"100%", objectFit:"cover",
            filter:"brightness(0.7) saturate(1.2)" }}/>
      </div>
      <div style={{ flex:1, overflow:"hidden" }}>
        <img src={imgBridge} alt="Pont Faidherbe"
          style={{ width:"100%", height:"100%", objectFit:"cover",
            filter:"brightness(0.7)" }}/>
      </div>
      <div style={{ flex:1, overflow:"hidden" }}>
        <img src={imgStreet} alt="Saint-Louis"
          style={{ width:"100%", height:"100%", objectFit:"cover",
            filter:"brightness(0.7)" }}/>
      </div>
    </div>
    <div style={{ position:"absolute", inset:0,
      background:"linear-gradient(to bottom, rgba(12,10,8,0.6) 0%, rgba(12,10,8,0.3) 50%, rgba(12,10,8,0.6) 100%)" }}/>
    {/* Center text */}
    <div style={{ position:"absolute", inset:0, display:"flex",
      alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", gap:8 }}>
        <FlagStripe width={32} height={3}/>
        <FlagStripe width={32} height={3}/>
        <FlagStripe width={32} height={3}/>
      </div>
      <p style={{ fontSize:"clamp(20px,3vw,36px)", fontWeight:800, color:C.text,
        letterSpacing:"-0.03em", fontStyle:"italic", textAlign:"center" }}>
        Cinéma bu Sénégal wi
      </p>
      <p style={{ fontSize:11, color:C.muted, letterSpacing:"0.3em", textTransform:"uppercase" }}>
        Films · Séries · Patrimoine
      </p>
    </div>
    {/* Flag bottom strip */}
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, display:"flex" }}>
      <div style={{ flex:1, background:C.green }}/>
      <div style={{ flex:1, background:C.yellow }}/>
      <div style={{ flex:1, background:C.red }}/>
    </div>
  </div>
);

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
const Testimonials: React.FC = () => {
  const items = [
    { name:"Aminata Diallo", role:"Étudiante · Dakar",
      text:"Rekk wax 'Touki Bouki' yëgël na ma — je cherchais ce film depuis 2 ans. KaySetane l'a en HD." },
    { name:"Moussa Ba", role:"Développeur · Abidjan",
      text:"Interface bi dafa yomb lool. Aucune pub, rapide, et le cinéma africain est enfin mis en avant." },
    { name:"Fatou Sow", role:"Professeure · Saint-Louis",
      text:"Mes étudiants regardent Sembène Ousmane en cours. Notre patrimoine enfin accessible digitalement." },
    { name:"Ibrahima Fall", role:"Entrepreneur · Thiès",
      text:"Offline mode — nekk ci autobus, xool sa film. Dafa dëkk ci réalité bu Sénégal wi." },
  ];
  return (
    <section style={{ position:"relative", zIndex:10, padding:"100px 48px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ marginBottom:52 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <FlagStripe/>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.36em",
            textTransform:"uppercase", color:C.soft }}>Ñu wax</span>
        </div>
        <h2 style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:800,
          letterSpacing:"-0.04em", color:C.text }}>
          Xam xam bi<br/><span style={{ color:C.soft, fontStyle:"italic" }}>ñu jox.</span>
        </h2>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
        {items.map((t,i)=>(
          <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:i*0.08 }}>
            <GlassCard style={{ padding:"32px 28px" }}>
              <div style={{ display:"flex", gap:4, marginBottom:18 }}>
                {[C.green,C.yellow,C.red].map((c,j)=>(
                  <div key={j} style={{ width:4, height:4, borderRadius:99, background:c }}/>
                ))}
              </div>
              <p style={{ fontSize:13, color:C.muted, lineHeight:1.85,
                fontWeight:400, marginBottom:22, fontStyle:"italic" }}>"{t.text}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:99,
                  background:`${[C.green,C.yellow,C.red,C.green][i]}18`,
                  border:`1px solid ${[C.green,C.yellow,C.red,C.green][i]}38`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700, color:[C.green,C.yellow,C.red,C.green][i] }}>
                  {t.name.split(" ").map(w=>w[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{t.name}</div>
                  <div style={{ fontSize:9, color:C.soft, marginTop:2 }}>{t.role}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ── PRICING ───────────────────────────────────────────────────────────────────
const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const plans = [
    { name:"Bëgg", sub:"Gratuit", price:"0",
      features:["500 titres","SD 480p","1 profil","Avec pubs","Xool ci kaw"],
      accent:C.green, highlight:false },
    { name:"Yomb", sub:"Standard", price:"2 500",
      features:["12 000+ titres","HD 1080p","3 profils","Amul pub","Téléchargement","Wave · OM"],
      accent:C.yellow, highlight:true },
    { name:"Dëkk", sub:"Premium", price:"4 500",
      features:["Yomb yëf yi","4K Ultra HD","5 profils","Dolby Audio","Accès anticipé","Support 24h"],
      accent:C.red, highlight:false },
  ];

  return (
    <section id="tarifs" style={{ position:"relative", zIndex:10,
      padding:"100px 48px 140px", maxWidth:1200, margin:"0 auto" }}>
      {/* BG gradient — couleurs sénégal */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <img src={imgGradient} alt="" style={{ width:"100%", height:"100%",
          objectFit:"cover", opacity:0.04, filter:"blur(2px)" }}/>
      </div>
      <div style={{ position:"relative", zIndex:2 }}>
        <div style={{ textAlign:"center", marginBottom:72 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:20 }}>
            <FlagStripe/><FlagStripe/><FlagStripe/>
          </div>
          <h2 style={{ fontSize:"clamp(36px,5vw,56px)", fontWeight:800,
            letterSpacing:"-0.04em", color:C.text }}>
            Simple.{" "}<span style={{ color:C.soft, fontStyle:"italic" }}>Soxor.</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {plans.map((plan,i)=>(
            <motion.div key={i} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.1 }}>
              <GlassCard style={{ padding:"40px 32px", position:"relative", overflow:"hidden",
                border: plan.highlight ? `1px solid ${plan.accent}40` : `1px solid ${C.border}` }}>
                {plan.highlight && (
                  <div style={{ position:"absolute", top:18, right:18,
                    background:plan.accent, color:"#000", fontSize:7, fontWeight:800,
                    padding:"3px 10px", borderRadius:99, textTransform:"uppercase", letterSpacing:"0.2em" }}>
                    Dafa bees
                  </div>
                )}
                <div style={{ width:"100%", height:2, borderRadius:99, marginBottom:28,
                  background:`linear-gradient(to right, ${plan.accent}, transparent)` }}/>
                <div style={{ fontSize:9, fontWeight:600, letterSpacing:"0.3em",
                  textTransform:"uppercase", color:plan.accent, marginBottom:6 }}>{plan.sub}</div>
                <div style={{ fontSize:40, fontWeight:800, letterSpacing:"-0.04em",
                  color:C.text, lineHeight:1, marginBottom:4 }}>{plan.price}</div>
                <div style={{ fontSize:11, color:C.soft, marginBottom:32 }}>
                  {plan.price==="0" ? "ci kanam — waaw" : "F CFA / def"}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:11, marginBottom:32 }}>
                  {plan.features.map((f,j)=>(
                    <div key={j} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:4, height:4, borderRadius:99, background:plan.accent, flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:C.muted }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>navigate("/KaySetane")}
                  style={{ width:"100%", padding:"12px 0", borderRadius:99,
                    background: plan.highlight ? plan.accent : "rgba(255,255,255,0.055)",
                    backdropFilter:"blur(8px)",
                    color: plan.highlight ? "#000" : C.text,
                    fontSize:11, fontWeight:700, letterSpacing:"0.08em",
                    border: plan.highlight ? "none" : `1px solid ${C.border}`,
                    cursor:"pointer", transition:"all 0.2s" }}>
                  {plan.price==="0" ? "Tàkk leegi" : "Saytu 30 fan"}
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── CTA FINAL ─────────────────────────────────────────────────────────────────
const CtaFinal: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section style={{ position:"relative", zIndex:10, padding:"120px 48px", textAlign:"center", overflow:"hidden" }}>
      {/* BG — monument silhouette */}
      <div style={{ position:"absolute", inset:0 }}>
        <img src={imgMonument} alt="" style={{ width:"100%", height:"100%",
          objectFit:"cover", opacity:0.18, filter:"blur(2px) grayscale(0.4)" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom, rgba(12,10,8,0.85) 0%, rgba(12,10,8,0.65) 50%, rgba(12,10,8,0.9) 100%)" }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, display:"flex" }}>
          <div style={{ flex:1, background:C.green }}/>
          <div style={{ flex:1, background:C.yellow }}/>
          <div style={{ flex:1, background:C.red }}/>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, maxWidth:620, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, scale:0.92 }} whileInView={{ opacity:1, scale:1 }}
          viewport={{ once:true }} transition={{ duration:0.7 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
            <Logo size={56}/>
          </div>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
            <FlagStripe width={72} height={3}/>
          </div>
          <h2 style={{ fontSize:"clamp(44px,7vw,80px)", fontWeight:800,
            letterSpacing:"-0.05em", color:C.text, lineHeight:0.95, marginBottom:20 }}>
            Dem sa bàkk.<br/>
            <span style={{ color:C.yellow }}>Xool leegi.</span>
          </h2>
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, marginBottom:40 }}>
            Rejoins des milliers de spectateurs au Sénégal.<br/>
            <span style={{ color:C.soft, fontSize:12 }}>Cinéma bi ñu bëgg — yépp, ci sa tëlëfon.</span>
          </p>
          <button onClick={()=>navigate("/KaySetane")}
            style={{ background:C.yellow, color:"#000", padding:"14px 36px",
              borderRadius:99, fontSize:13, fontWeight:700, letterSpacing:"0.04em",
              cursor:"pointer", border:"none", transition:"transform 0.2s",
              display:"inline-flex", alignItems:"center", gap:8 }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.05)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";}}>
            <Play size={13} fill="#000"/> Tàkk compte — Gratis
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// ── FOOTER ────────────────────────────────────────────────────────────────────
const Footer: React.FC = () => (
  <footer style={{ position:"relative", zIndex:10, padding:"32px 48px 48px",
    borderTop:`1px solid ${C.border}` }}>
    <div style={{ maxWidth:1200, margin:"0 auto",
      display:"flex", flexWrap:"wrap", justifyContent:"space-between",
      alignItems:"center", gap:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <Logo size={20}/>
        <div>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.22em",
            textTransform:"uppercase", color:`${C.text}3A` }}>KAYSETANE</div>
          <FlagStripe/>
        </div>
      </div>
      <div style={{ display:"flex", gap:28 }}>
        {["Confidentialité","CGU","Contact","FAQ"].map(l=>(
          <a key={l} href="#" style={{ fontSize:10, color:C.soft, textDecoration:"none",
            letterSpacing:"0.1em", transition:"color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.color=C.muted)}
            onMouseLeave={e=>(e.currentTarget.style.color=C.soft)}>{l}</a>
        ))}
      </div>
      <span style={{ fontSize:9, color:`${C.soft}66`, letterSpacing:"0.2em", textTransform:"uppercase" }}>
        Made in Dakar 🇸🇳
      </span>
    </div>
    <p style={{ textAlign:"center", marginTop:32, fontSize:8, letterSpacing:"0.4em",
      textTransform:"uppercase", color:`${C.soft}33` }}>
      © 2026 KAYSETANE — Cinéma bu Sénégal wi
    </p>
  </footer>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background:C.bg, color:C.text, overflowX:"hidden",
      fontFamily:"'DM Sans', 'Satoshi', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400;1,9..40,700&display=swap');
        *{box-sizing:border-box;} ::-webkit-scrollbar{display:none;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>
      <Navbar/>
      <Hero/>
      <Ticker/>
      <VisionSection/>
      <FilmShowcase/>
      <SenegalBand/>
      <Features/>
      <Testimonials/>
      <Pricing/>
      <CtaFinal/>
      <Footer/>
    </main>
  );
}