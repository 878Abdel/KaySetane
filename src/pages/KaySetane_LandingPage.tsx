"use client";
import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, ChevronRight, X, Menu } from "lucide-react";

// ── ASSETS ────────────────────────────────────────────────────────────────────
import bgVideo            from "../assets/low.mp4";
import imgMonument        from "../assets/mariams-monument-246975_1920.jpg";
import imgMosque          from "../assets/mariams-fisherman-mosque-246976_1920.jpg";
import imgBridge          from "../assets/christianyanndiedhiou-senegalbridge-4737659_1920.jpg";
import imgBeach           from "../assets/7929e082-3435-4ff8-ac9a-f77ff9944872.jpg";
import imgStatuette       from "../assets/anaterate-few-2919164_1920.png";
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
const FlagStripe: React.FC<{ width?:number; height?:number }> = ({ width=44, height=2 }) => (
  <div style={{ display:"flex", height, borderRadius:99, overflow:"hidden", width, flexShrink:0 }}>
    <div style={{ flex:1, background:C.green }}/>
    <div style={{ flex:1, background:C.yellow }}/>
    <div style={{ flex:1, background:C.red }}/>
  </div>
);

const Logo: React.FC<{ size?:number }> = ({ size=28 }) => (
  <img src={imgStatuette} alt="KaySetane"
    style={{ width:size, height:Math.round(size*1.6), objectFit:"contain",
      objectPosition:"center top", filter:"brightness(0.9) contrast(1.1) sepia(0.1)",
      mixBlendMode:"screen" }}/>
);

const GlassCard: React.FC<{ children:React.ReactNode; style?:React.CSSProperties }> =
({ children, style }) => (
  <div style={{ background:C.glass, backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
    border:`1px solid ${C.border}`, borderRadius:16, ...style }}>
    {children}
  </div>
);

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
      if (!del && txt !== phrases[wi])      setTxt(phrases[wi].slice(0,txt.length+1));
      else if (!del && txt === phrases[wi]) setDel(true);
      else if (del && txt.length > 0)       setTxt(phrases[wi].slice(0,txt.length-1));
      else { setDel(false); setWi(p=>(p+1)%phrases.length); }
    }, ms);
    return () => clearTimeout(t);
  }, [txt, del, wi]);
  return <span>{txt}<span style={{ color:C.yellow, opacity:0.8 }}>|</span></span>;
};

// ── NAVBAR ────────────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <motion.nav initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6 }}
        style={{ position:"fixed", top:0, left:0, right:0, zIndex:200,
          background: scrolled ? "rgba(8,6,4,0.95)" : "rgba(8,6,4,0.7)",
          backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
          borderBottom: scrolled ? `1px solid ${C.border}` : "none",
          transition:"all 0.3s" }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding: isMobile ? "12px 16px" : "12px 32px", maxWidth:1200, margin:"0 auto" }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Logo size={isMobile ? 20 : 24}/>
            <div>
              <div style={{ fontSize: isMobile ? 10 : 11, fontWeight:800,
                letterSpacing:"0.2em", textTransform:"uppercase", color:C.text, lineHeight:1 }}>
                KAYSETANE
              </div>
              <FlagStripe width={50} height={2}/>
            </div>
          </div>

          {/* Desktop links */}
          {!isMobile && (
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              {[["Vision","#vision"],["Catalogue","#catalogue"],["Tarifs","#tarifs"]].map(([l,h])=>(
                <a key={l} href={h} style={{ fontSize:11, color:C.muted, padding:"6px 14px",
                  borderRadius:99, textDecoration:"none", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color=C.text)}
                  onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}>{l}</a>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={()=>navigate("/KaySetane")}
              style={{ padding: isMobile ? "8px 16px" : "8px 20px", borderRadius:99,
                background:C.yellow, color:"#000", fontSize: isMobile ? 11 : 11, fontWeight:700,
                border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Play size={10} fill="#000"/> {isMobile ? "Xool" : "Xool leegi"}
            </button>
            {isMobile && (
              <button onClick={()=>setMenuOpen(!menuOpen)}
                style={{ width:36, height:36, borderRadius:10, background:C.glass,
                  border:`1px solid ${C.border}`, color:C.text, display:"flex",
                  alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                {menuOpen ? <X size={16}/> : <Menu size={16}/>}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobile && menuOpen && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
              exit={{ opacity:0, height:0 }}
              style={{ borderTop:`1px solid ${C.border}`, overflow:"hidden" }}>
              <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:4 }}>
                {[["Vision","#vision"],["Catalogue","#catalogue"],["Tarifs","#tarifs"]].map(([l,h])=>(
                  <a key={l} href={h} onClick={()=>setMenuOpen(false)}
                    style={{ fontSize:14, color:C.muted, padding:"12px 16px", borderRadius:12,
                      textDecoration:"none", display:"block",
                      background:"rgba(255,255,255,0.03)" }}>{l}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

// ── HERO ──────────────────────────────────────────────────────────────────────
const Hero: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.2], [1, 0.92]);

  const films = [
    { title:"Atlantique",    year:"Sénégal · Drame",  color:"#0d2a45" },
    { title:"Touki Bouki",   year:"Classique · 1973", color:"#3d1a0a" },
    { title:"Joker",         year:"2019 · Thriller",  color:"#2a0a0a" },
  ];

  return (
    <section style={{ position:"relative", minHeight:"100vh", overflow:"hidden",
      display:"flex", alignItems:"center" }}>

      {/* Video BG */}
      <div style={{ position:"absolute", inset:0, zIndex:0 }}>
        <video autoPlay muted loop playsInline
          style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.5 }}>
          <source src={bgVideo} type="video/mp4"/>
        </video>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom,rgba(12,10,8,0.4) 0%,rgba(12,10,8,0.2) 40%,rgba(12,10,8,0.85) 100%)" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to right,rgba(12,10,8,0.9) 0%,rgba(12,10,8,0.3) 60%,transparent 100%)" }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, display:"flex" }}>
          <div style={{ flex:1, background:C.green }}/><div style={{ flex:1, background:C.yellow }}/><div style={{ flex:1, background:C.red }}/>
        </div>
      </div>

      <motion.div style={{ scale:heroScale, opacity:heroOpacity, position:"relative", zIndex:2,
        width:"100%", maxWidth:1200, margin:"0 auto",
        padding: isMobile ? "100px 20px 60px" : "120px 48px 80px" }}>

        {isMobile ? (
          /* ── MOBILE LAYOUT ── */
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              style={{ display:"flex", alignItems:"center", gap:10 }}>
              <FlagStripe width={32}/>
              <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.3em",
                textTransform:"uppercase", color:C.soft }}>Streaming bu Sénégal wi</span>
            </motion.div>

            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.3, duration:0.7 }}
              style={{ fontSize:"clamp(38px,10vw,58px)", fontWeight:800,
                letterSpacing:"-0.03em", lineHeight:1.0, color:C.text, fontStyle:"italic" }}>
              <TypingWolof/>
            </motion.h1>

            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
              style={{ fontSize:14, color:C.muted, lineHeight:1.8 }}>
              Films, séries, cinéma africain —
              {" "}<span style={{ color:C.yellow, fontWeight:600 }}>sans interruption</span>,
              sans abonnement forcé.
            </motion.p>

            {/* Stats row */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
              style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { val:"12k+", label:"Films & Séries", c:C.yellow },
                { val:"4K",   label:"Ultra HD", c:C.green },
                { val:"0 F",  label:"Frais cachés", c:C.red },
              ].map((s,i)=>(
                <GlassCard key={i} style={{ padding:"14px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:s.c, letterSpacing:"-0.02em" }}>{s.val}</div>
                  <div style={{ fontSize:8, color:C.soft, textTransform:"uppercase",
                    letterSpacing:"0.15em", marginTop:4 }}>{s.label}</div>
                </GlassCard>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.7 }}
              style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={()=>navigate("/KaySetane")}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  padding:"15px", borderRadius:14, background:C.yellow, color:"#000",
                  fontSize:14, fontWeight:700, border:"none", cursor:"pointer",
                  letterSpacing:"0.04em" }}>
                <Play size={14} fill="#000"/> Wax ci kaw — Gratis
              </button>
              <button style={{ padding:"14px", borderRadius:14,
                background:C.glass, backdropFilter:"blur(12px)",
                border:`1px solid ${C.border}`, color:C.muted,
                fontSize:14, cursor:"pointer" }}>
                Xool catalogue →
              </button>
            </motion.div>

            {/* Film cards row mobile */}
            <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none",
              paddingBottom:4, marginLeft:-20, paddingLeft:20, marginRight:-20, paddingRight:20 }}>
              {films.map((f,i)=>(
                <motion.div key={i}
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.5+i*0.1 }}
                  style={{ flexShrink:0, width:130 }}>
                  <GlassCard style={{ overflow:"hidden" }}>
                    <div style={{ height:160, background:f.color, position:"relative",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Play size={22} color="rgba(255,255,255,0.3)"/>
                      <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%",
                        background:[C.green,C.yellow,C.red][i] }}/>
                    </div>
                    <div style={{ padding:"10px 12px" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:C.text }}>{f.title}</div>
                      <div style={{ fontSize:8, color:C.soft, marginTop:2 }}>{f.year}</div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* ── DESKTOP LAYOUT ── */
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
            <div>
              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.2 }}
                style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
                <FlagStripe/>
                <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.36em",
                  textTransform:"uppercase", color:C.soft }}>Streaming bu Sénégal wi</span>
              </motion.div>

              <motion.h1 initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.35, duration:0.85 }}
                style={{ fontSize:"clamp(44px,5.5vw,76px)", fontWeight:800,
                  letterSpacing:"-0.04em", lineHeight:1.0, color:C.text,
                  marginBottom:24, fontStyle:"italic" }}>
                <TypingWolof/>
              </motion.h1>

              <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.5 }}
                style={{ fontSize:14, color:C.muted, lineHeight:1.85, maxWidth:420, marginBottom:36 }}>
                Films, séries, cinéma africain —
                {" "}<span style={{ color:C.yellow, fontWeight:600 }}>sans interruption</span>,
                sans abonnement forcé.
              </motion.p>

              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.65 }} style={{ display:"flex", gap:12, marginBottom:48 }}>
                <button onClick={()=>navigate("/KaySetane")}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 28px",
                    borderRadius:99, background:C.yellow, color:"#000",
                    fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>
                  <Play size={12} fill="#000"/> Wax ci kaw — Gratis
                </button>
                <button style={{ padding:"13px 22px", borderRadius:99,
                  background:C.glass, backdropFilter:"blur(12px)",
                  border:`1px solid ${C.border}`, color:C.muted, fontSize:12, cursor:"pointer" }}>
                  Xool catalogue →
                </button>
              </motion.div>

              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
                style={{ display:"flex", gap:36 }}>
                {[
                  { val:"12k+", label:"Films ak série yi", c:C.yellow },
                  { val:"4K",   label:"Ultra HD natif", c:C.green },
                  { val:"0 F",  label:"Frais cachés", c:C.red },
                ].map((s,i)=>(
                  <div key={i}>
                    <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", color:s.c }}>{s.val}</div>
                    <div style={{ fontSize:9, fontWeight:500, color:C.soft,
                      textTransform:"uppercase", letterSpacing:"0.2em", marginTop:3 }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div style={{ position:"relative", height:480 }}>
              {films.map((f,i)=>(
                <motion.div key={i}
                  initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.4+i*0.15, duration:0.8 }}
                  style={{ position:"absolute", top:[0,90,210][i], left:[30,110,10][i],
                    width:[260,235,250][i], rotate:([-4,0,5][i]) as any }}>
                  <GlassCard style={{ overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.7)" }}>
                    <div style={{ height:[165,145,155][i], background:f.color, position:"relative",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Play size={26} color="rgba(255,255,255,0.28)"/>
                      <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%",
                        background:[C.green,C.yellow,C.red][i] }}/>
                    </div>
                    <div style={{ padding:"12px 14px" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{f.title}</div>
                      <div style={{ fontSize:9, color:C.soft, marginTop:2 }}>{f.year}</div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Scroll indicator - desktop only */}
      {!isMobile && (
        <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:8, zIndex:10 }}>
          <motion.div animate={{ y:[0,6,0] }} transition={{ duration:2.2, repeat:Infinity }}>
            <ChevronRight size={13} color={C.soft} style={{ transform:"rotate(90deg)" }}/>
          </motion.div>
          <span style={{ fontSize:7, textTransform:"uppercase", letterSpacing:"0.6em", color:C.soft }}>Scroll</span>
        </div>
      )}
    </section>
  );
};

// ── TICKER ────────────────────────────────────────────────────────────────────
const Ticker: React.FC = () => {
  const items = ["Xool ci kaw","·","Films yi","·","Série yi","·","Cinéma Afrique","·","4K","·","Gratis","·","Sénégal","·"];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`,
      padding:"10px 0", background:"rgba(255,255,255,0.012)", zIndex:10, position:"relative" }}>
      <motion.div animate={{ x:["0%","-50%"] }} transition={{ duration:25, repeat:Infinity, ease:"linear" }}
        style={{ display:"flex", gap:40, whiteSpace:"nowrap" }}>
        {[...items,...items].map((item,i)=>(
          <span key={i} style={{ fontSize:9, fontWeight:600, textTransform:"uppercase",
            letterSpacing:"0.3em", color:item==="·"?C.yellow:C.soft }}>{item}</span>
        ))}
      </motion.div>
    </div>
  );
};

// ── FILM SHOWCASE ─────────────────────────────────────────────────────────────
const FilmShowcase: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const films = [
    { title:"Superman",        year:"2025", img:posterSuperman,     accent:C.yellow },
    { title:"The Truman Show", year:"1998", img:posterTrumanShow,   accent:C.green  },
    { title:"Joker",           year:"2019", img:posterJoker,        accent:C.red    },
    { title:"Oppenheimer",     year:"2023", img:posterOppenheimer,  accent:C.yellow },
    { title:"Interstellar",    year:"2014", img:posterInterstellar, accent:C.green  },
  ];

  return (
    <section style={{ position:"relative", zIndex:10, padding: isMobile ? "48px 0" : "60px 0" }}>
      <div style={{ padding: isMobile ? "0 16px 0" : "0 48px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20,
          paddingRight: isMobile ? 16 : 0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FlagStripe width={20} height={2}/>
            <span style={{ fontSize: isMobile ? 10 : 11, fontWeight:700, letterSpacing:"0.14em",
              textTransform:"uppercase", color:C.muted }}>⭐ Films à ne pas manquer</span>
          </div>
          <button onClick={()=>navigate("/KaySetane")}
            style={{ fontSize:10, color:C.muted, background:"none", border:"none", cursor:"pointer" }}>
            Tout voir →
          </button>
        </div>

        <div style={{ display:"flex", gap:12, overflowX:"auto", scrollbarWidth:"none",
          paddingBottom:8, paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0 }}>
          {films.map((f,i)=>(
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.07 }}
              onClick={()=>navigate("/KaySetane")}
              style={{ flexShrink:0, width: isMobile ? 130 : 175, cursor:"pointer" }}>
              <div style={{ position:"relative", borderRadius:12, overflow:"hidden",
                height: isMobile ? 195 : 260, marginBottom:8,
                boxShadow:"0 8px 32px rgba(0,0,0,0.7)", transition:"transform 0.2s" }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform="scale(1.04) translateY(-3px)"; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform="scale(1) translateY(0)"; }}>
                <img src={f.img} alt={f.title}
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                <div style={{ position:"absolute", inset:0,
                  background:"linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)" }}/>
                <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:f.accent }}/>
                <div style={{ position:"absolute", bottom:8, left:10, right:10 }}>
                  <div style={{ fontSize: isMobile ? 11 : 12, fontWeight:700, color:C.text }}>{f.title}</div>
                  <div style={{ fontSize:9, color:C.soft, marginTop:2 }}>{f.year}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── FEATURES ──────────────────────────────────────────────────────────────────
const Features: React.FC = () => {
  const isMobile = useIsMobile();
  const feats = [
    { num:"01", title:"Cinéma Sénégalais", sub:"Sembène — bi ñu sant",
      desc:"Céddo, Moolaadé, Xala, Touki Bouki — les chefs-d'œuvre africains en HD.", accent:C.yellow },
    { num:"02", title:"Stream bi dafa yomb", sub:"Sans coupure",
      desc:"HD sur mobile, 4K sur TV. S'adapte à ta connexion automatiquement.", accent:C.green },
    { num:"03", title:"Offline — Mbedd wi", sub:"Sans connexion",
      desc:"Télécharge et regarde dans le bus. Pensé pour la réalité du Sénégal.", accent:C.red },
    { num:"04", title:"Dafa soxor", sub:"0 publicité",
      desc:"Aucune coupure. Ton film, du début à la fin.", accent:C.yellow },
    { num:"05", title:"Cinéma Africain", sub:"Tout le continent",
      desc:"Nigéria, Côte d'Ivoire, Mali, Ghana — meilleur du cinéma ouest-africain.", accent:C.green },
    { num:"06", title:"Waaxi — Gratuit", sub:"Bëgëne la",
      desc:"Accès de base 100% gratuit. Aucune carte bancaire pour commencer.", accent:C.red },
  ];

  return (
    <section id="catalogue" style={{ position:"relative", zIndex:10,
      padding: isMobile ? "48px 16px" : "100px 48px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ marginBottom: isMobile ? 32 : 60 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
          <FlagStripe/>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:"0.32em",
            textTransform:"uppercase", color:C.soft }}>Fonctionnalités</span>
        </div>
        <h2 style={{ fontSize: isMobile ? "clamp(28px,8vw,42px)" : "clamp(36px,5vw,58px)",
          fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.05, color:C.text }}>
          Xam xam bi<br/>
          <span style={{ color:C.soft, fontStyle:"italic" }}>dafa am solo.</span>
        </h2>
      </div>

      <div style={{ display:"grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 14 }}>
        {feats.map((f,i)=>(
          <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:i*0.06 }}>
            <GlassCard style={{ padding: isMobile ? "18px 14px" : "28px 24px",
              height:"100%", borderTop:`2px solid ${f.accent}20` }}>
              <div style={{ width:20, height:2, background:f.accent, borderRadius:99, marginBottom:10 }}/>
              <div style={{ fontSize:8, fontWeight:600, letterSpacing:"0.2em",
                textTransform:"uppercase", color:C.soft, marginBottom:6 }}>{f.sub}</div>
              <h3 style={{ fontSize: isMobile ? 13 : 16, fontWeight:700, color:C.text,
                letterSpacing:"-0.01em", marginBottom:8, lineHeight:1.25 }}>{f.title}</h3>
              {!isMobile && <p style={{ fontSize:12, color:C.muted, lineHeight:1.75 }}>{f.desc}</p>}
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ── SENEGAL PHOTOS BAND ───────────────────────────────────────────────────────
const SenegalBand: React.FC = () => {
  const isMobile = useIsMobile();
  return (
    <div style={{ position:"relative", height: isMobile ? 180 : 260, overflow:"hidden", zIndex:10 }}>
      <div style={{ display:"flex", height:"100%" }}>
        {[imgMosque, imgBridge, imgBeach].map((src,i)=>(
          <div key={i} style={{ flex:1, overflow:"hidden" }}>
            <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover",
              filter:"brightness(0.7)" }}/>
          </div>
        ))}
      </div>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to bottom,rgba(12,10,8,0.5) 0%,rgba(12,10,8,0.3) 50%,rgba(12,10,8,0.6) 100%)" }}/>
      <div style={{ position:"absolute", inset:0, display:"flex",
        alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", gap:6 }}>
          {[0,1,2].map(i=><FlagStripe key={i} width={28} height={3}/>)}
        </div>
        <p style={{ fontSize: isMobile ? "clamp(16px,5vw,22px)" : "clamp(20px,3vw,32px)",
          fontWeight:800, color:C.text, letterSpacing:"-0.02em", fontStyle:"italic", textAlign:"center",
          padding:"0 20px" }}>
          Cinéma bu Sénégal wi
        </p>
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, display:"flex" }}>
        <div style={{ flex:1, background:C.green }}/><div style={{ flex:1, background:C.yellow }}/><div style={{ flex:1, background:C.red }}/>
      </div>
    </div>
  );
};

// ── PRICING ───────────────────────────────────────────────────────────────────
const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const plans = [
    { name:"Bëgg", sub:"Gratuit", price:"0",
      features:["500 titres","SD 480p","1 profil","Avec pubs"],
      accent:C.green, highlight:false },
    { name:"Yomb", sub:"Standard", price:"2 500",
      features:["12 000+ titres","HD 1080p","3 profils","Amul pub","Téléchargement"],
      accent:C.yellow, highlight:true },
    { name:"Dëkk", sub:"Premium", price:"4 500",
      features:["Yomb yëf yi","4K Ultra HD","5 profils","Dolby Audio"],
      accent:C.red, highlight:false },
  ];

  return (
    <section id="tarifs" style={{ position:"relative", zIndex:10,
      padding: isMobile ? "48px 16px 64px" : "80px 48px 120px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom: isMobile ? 32 : 56 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
          {[0,1,2].map(i=><FlagStripe key={i} width={24} height={2}/>)}
        </div>
        <h2 style={{ fontSize: isMobile ? "clamp(28px,8vw,40px)" : "clamp(36px,5vw,52px)",
          fontWeight:800, letterSpacing:"-0.03em", color:C.text }}>
          Simple.{" "}<span style={{ color:C.soft, fontStyle:"italic" }}>Soxor.</span>
        </h2>
      </div>

      <div style={{ display:"grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: isMobile ? 12 : 16 }}>
        {plans.map((plan,i)=>(
          <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:i*0.1 }}>
            <GlassCard style={{ padding: isMobile ? "24px 20px" : "36px 28px",
              position:"relative", overflow:"hidden",
              border: plan.highlight ? `1px solid ${plan.accent}44` : `1px solid ${C.border}`,
              display: isMobile && !plan.highlight ? "grid" : "block",
              gridTemplateColumns: isMobile && !plan.highlight ? "1fr 1fr" : undefined }}>
              {plan.highlight && (
                <div style={{ position:"absolute", top:16, right:16,
                  background:plan.accent, color:"#000", fontSize:7, fontWeight:800,
                  padding:"3px 10px", borderRadius:99, textTransform:"uppercase" }}>
                  Populaire
                </div>
              )}
              <div style={{ width:"100%", height:2, borderRadius:99, marginBottom:20,
                background:`linear-gradient(to right,${plan.accent},transparent)` }}/>
              <div style={{ fontSize:9, fontWeight:600, letterSpacing:"0.25em",
                textTransform:"uppercase", color:plan.accent, marginBottom:4 }}>{plan.sub}</div>
              <div style={{ fontSize: isMobile ? 32 : 38, fontWeight:800,
                letterSpacing:"-0.04em", color:C.text, lineHeight:1 }}>{plan.price}</div>
              <div style={{ fontSize:11, color:C.soft, marginBottom: isMobile ? 16 : 24 }}>
                {plan.price==="0" ? "ci kanam — waaw" : "F CFA / def"}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                {plan.features.map((f,j)=>(
                  <div key={j} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:4, height:4, borderRadius:99, background:plan.accent, flexShrink:0 }}/>
                    <span style={{ fontSize: isMobile ? 12 : 12, color:C.muted }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>navigate("/KaySetane")}
                style={{ width:"100%", padding: isMobile ? "11px 0" : "12px 0", borderRadius:99,
                  background:plan.highlight ? plan.accent : C.glass,
                  backdropFilter:"blur(8px)",
                  color:plan.highlight ? "#000" : C.text,
                  fontSize:12, fontWeight:700,
                  border:plan.highlight ? "none" : `1px solid ${C.border}`,
                  cursor:"pointer" }}>
                {plan.price==="0" ? "Tàkk leegi" : "Saytu 30 fan"}
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ── CTA FINAL ─────────────────────────────────────────────────────────────────
const CtaFinal: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  return (
    <section style={{ position:"relative", zIndex:10, padding: isMobile ? "64px 20px" : "100px 48px",
      textAlign:"center", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0 }}>
        <img src={imgMonument} alt="" style={{ width:"100%", height:"100%",
          objectFit:"cover", opacity:0.14, filter:"blur(2px) grayscale(0.4)" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom,rgba(12,10,8,0.88) 0%,rgba(12,10,8,0.7) 50%,rgba(12,10,8,0.92) 100%)" }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, display:"flex" }}>
          <div style={{ flex:1, background:C.green }}/><div style={{ flex:1, background:C.yellow }}/><div style={{ flex:1, background:C.red }}/>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, maxWidth:560, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, scale:0.94 }} whileInView={{ opacity:1, scale:1 }}
          viewport={{ once:true }} transition={{ duration:0.6 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <Logo size={isMobile ? 40 : 52}/>
          </div>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <FlagStripe width={60} height={3}/>
          </div>
          <h2 style={{ fontSize: isMobile ? "clamp(36px,10vw,58px)" : "clamp(44px,7vw,72px)",
            fontWeight:800, letterSpacing:"-0.04em", color:C.text, lineHeight:0.95, marginBottom:16 }}>
            KaySetane
          </h2>
          <p style={{ fontSize: isMobile ? 13 : 14, color:C.muted, lineHeight:1.75, marginBottom:32 }}>
            Rejoins des milliers de spectateurs au Sénégal.<br/>
            <span style={{ color:C.soft, fontSize:12 }}>Cinéma bi ñu bëgg — yépp, ci sa tëlëfon.</span>
          </p>
          <button onClick={()=>navigate("/KaySetane")}
            style={{ background:C.yellow, color:"#000",
              padding: isMobile ? "14px 28px" : "14px 36px",
              borderRadius:99, fontSize: isMobile ? 13 : 13, fontWeight:700,
              cursor:"pointer", border:"none", display:"inline-flex", alignItems:"center", gap:8,
              width: isMobile ? "100%" : "auto", justifyContent:"center" }}>
            <Play size={13} fill="#000"/> Tàkk compte — Gratis
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// ── FOOTER ────────────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const isMobile = useIsMobile();
  return (
    <footer style={{ position:"relative", zIndex:10, padding: isMobile ? "24px 16px 32px" : "28px 48px 40px",
      borderTop:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row",
          justifyContent:"space-between", alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 16 : 24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Logo size={18}/>
            <div>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.2em",
                textTransform:"uppercase", color:`${C.text}44` }}>KAYSETANE</div>
              <FlagStripe width={42}/>
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap: isMobile ? 16 : 24 }}>
            {["Confidentialité","CGU","Contact","FAQ"].map(l=>(
              <a key={l} href="#" style={{ fontSize:10, color:C.soft, textDecoration:"none" }}>{l}</a>
            ))}
          </div>
          <span style={{ fontSize:9, color:`${C.soft}66`, letterSpacing:"0.18em", textTransform:"uppercase" }}>
            Made in Dakar 🇸🇳
          </span>
        </div>
        <p style={{ textAlign:"center", marginTop:24, fontSize:8, letterSpacing:"0.3em",
          textTransform:"uppercase", color:`${C.soft}33` }}>
          © 2026 KAYSETANE — Cinéma bu Sénégal wi
        </p>
      </div>
    </footer>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background:C.bg, color:C.text, overflowX:"hidden",
      fontFamily:"'DM Sans','Satoshi',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{display:none;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        html{scroll-behavior:smooth;}
        button{font-family:inherit;}
        a{font-family:inherit;}
      `}</style>
      <Navbar/>
      <Hero/>
      <Ticker/>
      <FilmShowcase/>
      <SenegalBand/>
      <Features/>
      <Pricing/>
      <CtaFinal/>
      <Footer/>
    </main>
  );
}