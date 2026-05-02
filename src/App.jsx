import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ZONES = [
  { label:"Z1", name:"Recovery",  min:0,    max:0.55, color:"#38bdf8" },
  { label:"Z2", name:"Endurance", min:0.56, max:0.75, color:"#4ade80" },
  { label:"Z3", name:"Tempo",     min:0.76, max:0.90, color:"#facc15" },
  { label:"Z4", name:"Threshold", min:0.91, max:1.05, color:"#fb923c" },
  { label:"Z5", name:"VO2Max",    min:1.06, max:1.20, color:"#f87171" },
  { label:"Z6", name:"Anaerobic", min:1.21, max:1.50, color:"#e879f9" },
];

const DURATIONS = [30, 45, 60, 75, 90];

const PLANS = [
  {
    id:"sprint", icon:"⚡", name:"Sprint Power", tagline:"Detonate your peak watts",
    desc:"Neuromuscular development for maximal sprint power. Built around 5–15s all-out efforts and repeated sprint sessions.",
    weeks:8, hrs:"4–6", diff:4, color:"#facc15", target:"Increase 5s peak power by 10–20%",
    phases:[
      {name:"Neuro Activation",   wks:"1–2", focus:"High-cadence spin-ups, leg speed drills",        col:"#38bdf8"},
      {name:"Sprint Development", wks:"3–5", focus:"Standing starts, 5–10s maximal sprints",         col:"#facc15"},
      {name:"Sprint Endurance",   wks:"6–7", focus:"Repeated sprints, reduced rest, 15–30s efforts", col:"#fb923c"},
      {name:"Peak and Taper",     wks:"8",   focus:"Quality over quantity, sharpen for event",       col:"#e879f9"},
    ],
    days:[
      {day:"TUE", type:"KEY", label:"Sprint Session", zone:"Z6–Z7", dur:60},
      {day:"THU", type:"SUP", label:"Tempo Work",     zone:"Z3–Z4", dur:75},
      {day:"SAT", type:"KEY", label:"Sprint Repeats", zone:"Z6–Z7", dur:75},
      {day:"SUN", type:"REC", label:"Recovery Spin",  zone:"Z1–Z2", dur:45},
    ],
  },
  {
    id:"alpe", icon:"🏔", name:"Alpe du Zwift PR", tagline:"Conquer all 21 hairpins faster",
    desc:"Climbing plan targeting sustained threshold power for the 12.2km AdZ climb. Progressive sweet spot and over-threshold work.",
    weeks:10, hrs:"6–9", diff:3, color:"#38bdf8", target:"Improve Alpe du Zwift time by 5–15 min",
    phases:[
      {name:"Aerobic Foundation", wks:"1–3",  focus:"Sweet spot base, Z2 volume, climbing cadence",  col:"#4ade80"},
      {name:"Threshold Build",    wks:"4–6",  focus:"FTP intervals, 20-min sustained efforts",       col:"#facc15"},
      {name:"Climbing Specific",  wks:"7–9",  focus:"Over-threshold, 30–40min climb simulations",    col:"#fb923c"},
      {name:"Peak Week",          wks:"10",   focus:"Reduce volume, taper into your attempt",        col:"#e879f9"},
    ],
    days:[
      {day:"MON", type:"REC", label:"Active Recovery", zone:"Z1",    dur:45},
      {day:"WED", type:"KEY", label:"Threshold Climb", zone:"Z4",    dur:90},
      {day:"FRI", type:"SUP", label:"Sweet Spot",      zone:"Z3",    dur:75},
      {day:"SAT", type:"KEY", label:"Long Climb Sim",  zone:"Z3–Z4", dur:120},
      {day:"SUN", type:"SUP", label:"Endurance Ride",  zone:"Z2",    dur:90},
    ],
  },
  {
    id:"racing", icon:"🏁", name:"Zwift Racing", tagline:"Attack, surge, and hold on",
    desc:"Race fitness built around repeated hard efforts, VO2max development, attack simulations, and surge recovery.",
    weeks:8, hrs:"5–8", diff:5, color:"#f87171", target:"Podium finishes in your category",
    phases:[
      {name:"Aerobic Base",      wks:"1–2", focus:"Z2 volume, tempo work, build the engine",      col:"#4ade80"},
      {name:"Race Conditioning", wks:"3–5", focus:"Over-unders, VO2max, attack simulations",      col:"#fb923c"},
      {name:"Race Simulation",   wks:"6–7", focus:"Group ride efforts, surges, sprint finishes",  col:"#f87171"},
      {name:"Peak and Race",     wks:"8",   focus:"Taper, race-day execution focus",              col:"#e879f9"},
    ],
    days:[
      {day:"TUE", type:"KEY", label:"VO2max Intervals", zone:"Z5",    dur:75},
      {day:"THU", type:"KEY", label:"Over-Unders",      zone:"Z4–Z5", dur:90},
      {day:"FRI", type:"REC", label:"Flush Ride",       zone:"Z1",    dur:40},
      {day:"SAT", type:"KEY", label:"Race Simulation",  zone:"Z4–Z6", dur:90},
      {day:"SUN", type:"SUP", label:"Endurance",        zone:"Z2",    dur:90},
    ],
  },
  {
    id:"ftp", icon:"📈", name:"FTP Builder", tagline:"Raise your ceiling",
    desc:"Pure threshold development. Classic sweet spot and threshold progressions to systematically raise your FTP.",
    weeks:10, hrs:"5–7", diff:3, color:"#fb923c", target:"Increase FTP by 15–25 watts",
    phases:[
      {name:"Sweet Spot I",  wks:"1–3",  focus:"88–94% FTP, 2x20 progressions",            col:"#facc15"},
      {name:"Sweet Spot II", wks:"4–6",  focus:"Extended sweet spot, over-threshold intro", col:"#fb923c"},
      {name:"Threshold",     wks:"7–9",  focus:"100–105% FTP, 2x20 at threshold",           col:"#f87171"},
      {name:"Test and Peak", wks:"10",   focus:"Ramp test, establish new baseline",         col:"#e879f9"},
    ],
    days:[
      {day:"TUE", type:"KEY", label:"Sweet Spot",     zone:"Z3–Z4", dur:90},
      {day:"THU", type:"KEY", label:"Threshold Work", zone:"Z4",    dur:90},
      {day:"SAT", type:"KEY", label:"Long SS Ride",   zone:"Z3",    dur:105},
      {day:"SUN", type:"REC", label:"Z2 Endurance",   zone:"Z2",    dur:60},
    ],
  },
  {
    id:"century", icon:"🚀", name:"Gran Fondo / Century", tagline:"Go the full distance",
    desc:"Endurance plan for long events. Builds aerobic capacity, fat oxidation and pacing strategy for 4–6 hour efforts.",
    weeks:12, hrs:"7–10", diff:2, color:"#4ade80", target:"Complete a century ride or gran fondo",
    phases:[
      {name:"Base Volume",     wks:"1–4",  focus:"Z2 long rides, aerobic efficiency",         col:"#38bdf8"},
      {name:"Endurance Build", wks:"5–8",  focus:"Progressive long rides, tempo, fueling",    col:"#4ade80"},
      {name:"Event Prep",      wks:"9–11", focus:"Back-to-back rides, race-pace efforts",     col:"#facc15"},
      {name:"Taper",           wks:"12",   focus:"Volume reduction, confidence rides",        col:"#e879f9"},
    ],
    days:[
      {day:"TUE", type:"SUP", label:"Tempo Intervals",    zone:"Z3",    dur:75},
      {day:"THU", type:"REC", label:"Easy Spin",          zone:"Z1–Z2", dur:60},
      {day:"SAT", type:"KEY", label:"Long Ride",          zone:"Z2–Z3", dur:180},
      {day:"SUN", type:"SUP", label:"Recovery Endurance", zone:"Z2",    dur:90},
    ],
  },
  {
    id:"base", icon:"🔄", name:"Sweet Spot Base", tagline:"Build your aerobic foundation",
    desc:"Six weeks of progressive sweet spot work to build aerobic capacity and prepare for harder specialty phases.",
    weeks:6, hrs:"4–6", diff:2, color:"#a78bfa", target:"Solid base for any follow-on plan",
    phases:[
      {name:"Base Phase I",   wks:"1–2", focus:"Sweet spot intro, 2x15 at 88–90% FTP", col:"#4ade80"},
      {name:"Base Phase II",  wks:"3–4", focus:"3x15 and 2x20 progression",            col:"#facc15"},
      {name:"Base Phase III", wks:"5–6", focus:"1x30 and 2x20 at 92–94% FTP",         col:"#a78bfa"},
    ],
    days:[
      {day:"MON", type:"REC", label:"Recovery",   zone:"Z1",    dur:30},
      {day:"WED", type:"KEY", label:"Sweet Spot", zone:"Z3–Z4", dur:75},
      {day:"FRI", type:"KEY", label:"Sweet Spot", zone:"Z3–Z4", dur:75},
      {day:"SUN", type:"SUP", label:"Endurance",  zone:"Z2",    dur:90},
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getZone(p) {
  return ZONES.find(z => p >= z.min && p <= z.max) || ZONES[0];
}

function fmtTime(s) {
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function getPhaseIdx(plan, week) {
  return Math.min(Math.floor((week - 1) / (plan.weeks / plan.phases.length)), plan.phases.length - 1);
}

// ─── ZWO Builder ──────────────────────────────────────────────────────────────

function buildZWO(w) {
  var xml = '<?xml version="1.0" encoding="utf-8"?>\n<workout_file>\n';
  xml += '  <author>Zwift Trainer AI</author>\n';
  xml += '  <n>' + (w.name || "Workout") + '</n>\n';
  xml += '  <description>' + (w.description || "") + '</description>\n';
  xml += '  <sportType>bike</sportType>\n  <tags></tags>\n  <workout>\n';
  var cur = 0;
  (w.intervals || []).forEach(function(iv) {
    if (iv.type === "steady") {
      var msgs = (w.textEvents || []).filter(function(e) { return e.offset >= cur && e.offset < cur + iv.duration; });
      xml += '    <SteadyState Duration="' + iv.duration + '" Power="' + iv.power + '">\n';
      msgs.forEach(function(m) { xml += '      <textevent timeoffset="' + (m.offset - cur) + '" message="' + m.message + '" />\n'; });
      xml += '    </SteadyState>\n';
      cur += iv.duration;
    } else if (iv.type === "ramp") {
      var msgs = (w.textEvents || []).filter(function(e) { return e.offset >= cur && e.offset < cur + iv.duration; });
      xml += '    <Ramp Duration="' + iv.duration + '" PowerLow="' + iv.powerLow + '" PowerHigh="' + iv.powerHigh + '">\n';
      msgs.forEach(function(m) { xml += '      <textevent timeoffset="' + (m.offset - cur) + '" message="' + m.message + '" />\n'; });
      xml += '    </Ramp>\n';
      cur += iv.duration;
    } else if (iv.type === "interval") {
      var d = iv.repeat * (iv.onDuration + iv.offDuration);
      var msgs = (w.textEvents || []).filter(function(e) { return e.offset >= cur && e.offset < cur + d; });
      xml += '    <IntervalsT Repeat="' + iv.repeat + '" OnDuration="' + iv.onDuration + '" OffDuration="' + iv.offDuration + '" OnPower="' + iv.onPower + '" OffPower="' + iv.offPower + '">\n';
      msgs.forEach(function(m) { xml += '      <textevent timeoffset="' + (m.offset - cur) + '" message="' + m.message + '" />\n'; });
      xml += '    </IntervalsT>\n';
      cur += d;
    }
  });
  xml += '  </workout>\n</workout_file>';
  return xml;
}

// ─── AI Generator ─────────────────────────────────────────────────────────────

async function aiGenerate(plan, week, session, ftp, duration) {
  var pi = getPhaseIdx(plan, week);
  var phase = plan.phases[pi];
  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: 'You are an expert cycling coach. Return ONLY valid JSON, no markdown, no explanation.\nSchema: {"name":"string","description":"string","intervals":[{"type":"steady","duration":600,"power":0.88},{"type":"ramp","duration":300,"powerLow":0.4,"powerHigh":0.8},{"type":"interval","repeat":5,"onDuration":120,"offDuration":60,"onPower":1.15,"offPower":0.55}],"textEvents":[{"offset":30,"message":"coaching text"}]}\nPower is always an FTP fraction (0.88 = 88% FTP). Total seconds must match target duration within 60s. Include 6-12 textEvents. Make coaching text specific to the plan goal.',
      messages: [{
        role: "user",
        content: "Plan: " + plan.name + " — " + plan.tagline + "\nPhase: " + phase.name + " (" + phase.focus + ")\nWeek: " + week + " of " + plan.weeks + "\nSession: " + session.label + " (" + session.type + ")\nZone: " + session.zone + "\nTarget: " + duration + " minutes (" + (duration * 60) + " seconds total)\nFTP: " + ftp + "w\nGenerate the workout."
      }]
    })
  });
  var data = await res.json();
  var text = (data.content || []).map(function(c) { return c.text || ""; }).join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── TopBar component (defined OUTSIDE App) ───────────────────────────────────

function TopBar({ breadcrumb, profiles, pid, setPid, settings, setSettings, updateProfile }) {
  return (
    <div>
      <div style={{ background: "#08090e", borderBottom: "1px solid #10141e", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#e0e0e0" }}>
          {breadcrumb}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {profiles.map(function(pr) {
            var active = pid === pr.id;
            return (
              <button key={pr.id} onClick={function() { setPid(pr.id); }}
                style={{ display: "flex", alignItems: "center", gap: 5, background: active ? pr.color + "18" : "#0d1117", border: "1px solid " + (active ? pr.color + "55" : "#1f2937"), borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: pr.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? pr.color : "#6b7280" }}>{pr.name}</span>
                <span style={{ fontSize: 11, color: active ? pr.color + "99" : "#374151" }}>{pr.ftp}w · {pr.dur}m</span>
              </button>
            );
          })}
          <button onClick={function() { setSettings(function(s) { return !s; }); }}
            style={{ background: settings ? "#1f2937" : "#0d1117", border: "1px solid #1f2937", borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontSize: 14, color: "#6b7280", fontFamily: "inherit" }}>
            ⚙
          </button>
        </div>
      </div>

      {settings && (
        <div style={{ background: "#08090e", borderBottom: "1px solid #10141e", padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 860, margin: "0 auto" }}>
            {profiles.map(function(pr) {
              var active = pid === pr.id;
              return (
                <div key={pr.id} onClick={function() { setPid(pr.id); }}
                  style={{ flex: "1 1 200px", background: "#0d1117", border: "1px solid " + (active ? pr.color + "55" : "#1f2937"), borderRadius: 9, padding: "14px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: pr.color }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: pr.color }}>{pr.name}</span>
                    {active && <span style={{ marginLeft: "auto", fontSize: 10, color: pr.color, border: "1px solid " + pr.color + "44", borderRadius: 4, padding: "1px 7px" }}>ACTIVE</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }} onClick={function(e) { e.stopPropagation(); }}>
                    <span style={{ fontSize: 11, color: "#4b5563", width: 26 }}>FTP</span>
                    <input type="number" value={pr.ftp}
                      onChange={function(e) { updateProfile(pr.id, "ftp", +e.target.value); }}
                      onClick={function(e) { e.stopPropagation(); }}
                      style={{ background: "#0a0c12", border: "1px solid #1f2937", borderRadius: 5, color: pr.color, fontFamily: "inherit", fontSize: 16, fontWeight: 700, padding: "4px 8px", width: 80, outline: "none", textAlign: "center" }} />
                    <span style={{ fontSize: 11, color: "#4b5563" }}>watts</span>
                  </div>
                  <div onClick={function(e) { e.stopPropagation(); }}>
                    <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 6 }}>Workout duration</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {DURATIONS.filter(function(d) { return d >= pr.min && d <= pr.max; }).map(function(d) {
                        return (
                          <button key={d} onClick={function() { updateProfile(pr.id, "dur", d); }}
                            style={{ flex: 1, padding: "5px 0", background: pr.dur === d ? pr.color + "22" : "#0a0c12", border: "1px solid " + (pr.dur === d ? pr.color + "66" : "#1f2937"), borderRadius: 5, color: pr.dur === d ? pr.color : "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            {d}m
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PowerChart (defined OUTSIDE App) ────────────────────────────────────────

function PowerChart({ intervals, textEvents }) {
  if (!intervals || intervals.length === 0) return null;
  var flat = [];
  intervals.forEach(function(iv) {
    if (iv.type === "interval") {
      for (var r = 0; r < iv.repeat; r++) {
        flat.push({ type: "steady", duration: iv.onDuration,  power: iv.onPower  });
        flat.push({ type: "steady", duration: iv.offDuration, power: iv.offPower });
      }
    } else {
      flat.push(iv);
    }
  });
  var total = flat.reduce(function(s, iv) { return s + iv.duration; }, 0) || 1;
  var maxP = 0.5;
  flat.forEach(function(iv) {
    var p = iv.type === "ramp" ? (iv.powerHigh || 0) : (iv.power || 0);
    if (p > maxP) maxP = p;
  });
  var bars = [];
  var cur = 0;
  flat.forEach(function(iv, i) {
    bars.push({ x: cur, iv: iv, key: i });
    cur += iv.duration;
  });
  var ftpY = 100 - (1 / maxP) * 84;
  return (
    <div style={{ width: "100%", height: 88, background: "#04050a", borderRadius: 6, overflow: "hidden", border: "1px solid #141820" }}>
      <svg width="100%" height="100%" viewBox={"0 0 " + total + " 100"} preserveAspectRatio="none">
        {bars.map(function(b) {
          var p = b.iv.type === "ramp" ? (b.iv.powerHigh || 0) : (b.iv.power || 0);
          var h = (p / maxP) * 84;
          var col = getZone(p).color;
          if (b.iv.type === "ramp") {
            var loY = 100 - ((b.iv.powerLow || 0) / maxP) * 84;
            var hiY = 100 - ((b.iv.powerHigh || 0) / maxP) * 84;
            var pts = b.x + ",100 " + b.x + "," + loY + " " + (b.x + b.iv.duration) + "," + hiY + " " + (b.x + b.iv.duration) + ",100";
            return <polygon key={b.key} points={pts} fill={col} opacity="0.85" />;
          }
          return <rect key={b.key} x={b.x} y={100 - h} width={b.iv.duration} height={h} fill={col} opacity="0.85" />;
        })}
        <line x1="0" y1={ftpY} x2={total} y2={ftpY} stroke="#ffffff12" strokeWidth="0.8" strokeDasharray="3 3" />
        {(textEvents || []).map(function(e, i) {
          return <line key={i} x1={e.offset} y1="0" x2={e.offset} y2="100" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />;
        })}
      </svg>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  var [screen,   setScreen]   = useState("goals");
  var [plan,     setPlan]     = useState(null);
  var [week,     setWeek]     = useState(1);
  var [session,  setSession]  = useState(null);
  var [workout,  setWorkout]  = useState(null);
  var [loading,  setLoading]  = useState(false);
  var [sent,     setSent]     = useState(false);
  var [hover,    setHover]    = useState(null);
  var [settings, setSettings] = useState(false);
  var [guide,    setGuide]    = useState(false);
  var [profiles, setProfiles] = useState([
    { id: "me",   name: "Me",   ftp: 250, dur: 75, color: "#22d3ee", min: 60, max: 90 },
    { id: "wife", name: "Wife", ftp: 180, dur: 45, color: "#f472b6", min: 30, max: 60 },
  ]);
  var [pid, setPid] = useState("me");

  var profile = profiles.find(function(p) { return p.id === pid; }) || profiles[0];

  function updateProfile(id, key, val) {
    setProfiles(function(ps) {
      return ps.map(function(p) { return p.id === id ? Object.assign({}, p, { [key]: val }) : p; });
    });
  }

  var phase = plan ? plan.phases[getPhaseIdx(plan, week)] : null;

  async function generate() {
    setLoading(true);
    setWorkout(null);
    try {
      var w = await aiGenerate(plan, week, session, profile.ftp, profile.dur);
      w.intervals = (w.intervals || []).map(function(iv, i) { return Object.assign({}, iv, { id: i }); });
      setWorkout(w);
    } catch (e) {
      alert("Generation failed — please try again.");
    }
    setLoading(false);
  }

  function doDownload() {
    var xml = buildZWO(workout);
    var blob = new Blob([xml], { type: "application/xml" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (workout.name || "workout").replace(/\s+/g, "_") + ".zwo";
    a.click();
    setSent(true);
    setTimeout(function() { setSent(false); }, 3000);
  }

  async function doShare() {
    var xml = buildZWO(workout);
    var file = new File([xml], (workout.name || "workout").replace(/\s+/g, "_") + ".zwo", { type: "application/octet-stream" });
    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: workout.name || "Zwift Workout" });
        setSent(true);
        setTimeout(function() { setSent(false); }, 3000);
      } catch (e) {
        if (e.name !== "AbortError") doDownload();
      }
    } else {
      doDownload();
    }
  }

  var isMobile = typeof navigator !== "undefined" && /iPhone|iPad|Android/i.test(navigator.userAgent);

  var totalSecs = 0;
  if (workout) {
    (workout.intervals || []).forEach(function(iv) {
      totalSecs += iv.type === "interval" ? iv.repeat * (iv.onDuration + iv.offDuration) : (iv.duration || 0);
    });
  }

  var topBarProps = { profiles: profiles, pid: pid, setPid: setPid, settings: settings, setSettings: setSettings, updateProfile: updateProfile };

  var S = {
    root: { minHeight: "100vh", background: "#06070a", color: "#e0e0e0", fontFamily: "'Barlow Condensed', sans-serif" },
    body: { padding: "20px", maxWidth: 860, margin: "0 auto" },
    card: { background: "#09090f", border: "1px solid #10141e", borderRadius: 10, padding: "18px", marginBottom: 12 },
    lbl:  { fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#374151", display: "block", marginBottom: 8 },
    crumb: { background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontFamily: "inherit", fontSize: 13, padding: 0 },
    sep: { color: "#1f2937", margin: "0 5px" },
  };

  function TypeTag({ type }) {
    var styles = {
      KEY: { bg: "#2a1f00", c: "#fbbf24", l: "KEY WORKOUT" },
      SUP: { bg: "#1a1200", c: "#fb923c", l: "SUPPORTING"  },
      REC: { bg: "#001a1a", c: "#38bdf8", l: "RECOVERY"    },
    };
    var st = styles[type] || { bg: "#111", c: "#aaa", l: type };
    return (
      <span style={{ display: "inline-block", background: st.bg, color: st.c, fontSize: 10, fontWeight: 700, letterSpacing: "1px", padding: "2px 8px", borderRadius: 3 }}>
        {st.l}
      </span>
    );
  }

  // ── GOALS ────────────────────────────────────────────────────────────────────
  if (screen === "goals") {
    return (
      <div style={S.root}>
        <style>{"@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}"}</style>
        <TopBar breadcrumb={<span style={{ fontSize: 18, fontWeight: 700 }}>ZWIFT <span style={{ color: "#22d3ee" }}>TRAINER</span> AI</span>} {...topBarProps} />
        <div style={S.body}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>Choose Your Goal</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>Each plan has structured phases, weekly workouts, timed coaching prompts, and .zwo export for Zwift.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {PLANS.map(function(p) {
              var isHover = hover === p.id;
              return (
                <div key={p.id}
                  style={{ background: isHover ? "#0c0e16" : "#09090f", border: "1px solid " + (isHover ? p.color + "44" : "#10141e"), borderRadius: 12, padding: "20px", cursor: "pointer", transition: "all 0.18s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={function() { setHover(p.id); }}
                  onMouseLeave={function() { setHover(null); }}
                  onClick={function() { setPlan(p); setWeek(1); setScreen("plan"); }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, background: "radial-gradient(circle at top right," + p.color + "0d,transparent 70%)", pointerEvents: "none" }} />
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: p.color, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, fontStyle: "italic" }}>{p.tagline}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, background: p.color + "18", color: p.color, padding: "2px 9px", borderRadius: 4, border: "1px solid " + p.color + "30" }}>{p.weeks}wk</span>
                    <span style={{ fontSize: 11, background: "#0f1117", color: "#6b7280", padding: "2px 9px", borderRadius: 4, border: "1px solid #1f2937" }}>{p.hrs} hrs/wk</span>
                    <span style={{ fontSize: 11, background: "#0f1117", color: "#6b7280", padding: "2px 9px", borderRadius: 4, border: "1px solid #1f2937" }}>{"●".repeat(p.diff) + "○".repeat(5 - p.diff)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", borderTop: "1px solid #10141e", paddingTop: 10 }}>🎯 {p.target}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  // ── PLAN ─────────────────────────────────────────────────────────────────────
  if (screen === "plan") {
    var phaseIdx = getPhaseIdx(plan, week);
    return (
      <div style={S.root}>
        <style>{"@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}"}</style>
        <TopBar
          breadcrumb={
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button style={S.crumb} onClick={function() { setScreen("goals"); }}>← ALL PLANS</button>
              <span style={S.sep}>/</span>
              <span style={{ fontWeight: 600 }}>{plan.name.toUpperCase()}</span>
            </span>
          }
          {...topBarProps}
        />
        <div style={S.body}>
          <div style={{ marginBottom: 20, borderBottom: "1px solid #10141e", paddingBottom: 20 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: plan.color, marginBottom: 6 }}>{plan.name}</h1>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 14, lineHeight: 1.6 }}>{plan.desc}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, background: plan.color + "18", color: plan.color, padding: "4px 12px", borderRadius: 5, border: "1px solid " + plan.color + "30" }}>{plan.weeks} weeks</span>
              <span style={{ fontSize: 12, background: "#0f1117", color: "#6b7280", padding: "4px 12px", borderRadius: 5, border: "1px solid #1f2937" }}>🎯 {plan.target}</span>
            </div>
          </div>
          <div style={S.card}>
            <label style={S.lbl}>Training Phases</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {plan.phases.map(function(ph, i) {
                return (
                  <div key={i} style={{ flex: "1 1 150px", background: i === phaseIdx ? ph.col + "18" : "#0d1117", border: "1px solid " + (i === phaseIdx ? ph.col + "55" : "#1f2937"), borderRadius: 8, padding: "12px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ph.col, marginBottom: 2 }}>{ph.name}</div>
                    <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 4 }}>Weeks {ph.wks}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.4 }}>{ph.focus}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={S.card}>
            <label style={S.lbl}>Select Week</label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
              {Array.from({ length: plan.weeks }, function(_, i) { return i + 1; }).map(function(n) {
                var pi2 = getPhaseIdx(plan, n);
                var ph = plan.phases[pi2];
                return (
                  <button key={n} onClick={function() { setWeek(n); setScreen("week"); }}
                    style={{ width: 40, height: 40, borderRadius: 7, border: "1px solid " + (n === week ? ph.col + "88" : "#1f2937"), background: n === week ? ph.col + "22" : "#0d1117", color: n === week ? ph.col : "#6b7280", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
                    {n}
                  </button>
                );
              })}
            </div>
            {phase && (
              <div style={{ background: plan.color + "0d", border: "1px solid " + plan.color + "22", borderRadius: 7, padding: "10px 14px", fontSize: 12, color: "#9ca3af" }}>
                <span style={{ color: plan.color, fontWeight: 700 }}>Week {week} — {phase.name}:</span> {phase.focus}
              </div>
            )}
          </div>
          <div style={S.card}>
            <label style={S.lbl}>Week {week} Schedule</label>
            {plan.days.map(function(d, i) {
              return (
                <div key={i} onClick={function() { setSession(d); setWorkout(null); setScreen("workout"); }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px", background: "#0d1117", borderRadius: 8, marginBottom: 6, border: "1px solid #1f2937", cursor: "pointer" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#4b5563", minWidth: 36 }}>{d.day}</div>
                  <div style={{ flex: 1 }}>
                    <TypeTag type={d.type} />
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#e0e0e0", marginTop: 3 }}>{d.label}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{d.zone} · {d.dur} min</div>
                  </div>
                  <span style={{ fontSize: 12, color: "#22d3ee" }}>→</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── WEEK ──────────────────────────────────────────────────────────────────────
  if (screen === "week") {
    return (
      <div style={S.root}>
        <style>{"@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}"}</style>
        <TopBar
          breadcrumb={
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button style={S.crumb} onClick={function() { setScreen("plan"); }}>← {plan.name.toUpperCase()}</button>
              <span style={S.sep}>/</span>
              <span style={{ fontWeight: 600 }}>WEEK {week}</span>
            </span>
          }
          {...topBarProps}
        />
        <div style={S.body}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 3 }}>Week {week} of {plan.weeks}</h2>
              {phase && <p style={{ fontSize: 13, color: "#6b7280" }}>{phase.name} — {phase.focus}</p>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={function() { setWeek(function(w) { return Math.max(1, w - 1); }); }} style={{ ...S.crumb, border: "1px solid #1f2937", borderRadius: 5, padding: "5px 10px" }}>← W{week > 1 ? week - 1 : "–"}</button>
              <button onClick={function() { setWeek(function(w) { return Math.min(plan.weeks, w + 1); }); }} style={{ ...S.crumb, border: "1px solid #1f2937", borderRadius: 5, padding: "5px 10px" }}>W{week < plan.weeks ? week + 1 : "–"} →</button>
            </div>
          </div>
          {plan.days.map(function(d, i) {
            return (
              <div key={i} onClick={function() { setSession(d); setWorkout(null); setScreen("workout"); }}
                style={{ ...S.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "center", minWidth: 44 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#6b7280" }}>{d.day}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <TypeTag type={d.type} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#e0e0e0", marginTop: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{d.zone} · {d.dur} min</div>
                </div>
                <span style={{ fontSize: 12, color: "#22d3ee", fontWeight: 600 }}>GENERATE →</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── WORKOUT ───────────────────────────────────────────────────────────────────
  if (!session) return null;

  return (
    <div style={S.root}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}"}</style>
      <TopBar
        breadcrumb={
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button style={S.crumb} onClick={function() { setScreen("week"); }}>← WEEK {week}</button>
            <span style={S.sep}>/</span>
            <span style={{ fontWeight: 600 }}>{session.label.toUpperCase()}</span>
          </span>
        }
        {...topBarProps}
      />
      <div style={S.body}>
        <div style={{ marginBottom: 18 }}>
          <TypeTag type={session.type} />
          <h2 style={{ fontSize: 28, fontWeight: 700, marginTop: 8, marginBottom: 5 }}>{workout ? workout.name : session.label}</h2>
          <p style={{ fontSize: 13, color: "#6b7280" }}>{workout ? workout.description : (session.zone + (phase ? " · " + phase.name : ""))}</p>
          {workout && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, background: "#22d3ee18", color: "#22d3ee", padding: "3px 10px", borderRadius: 4, border: "1px solid #22d3ee30" }}>{fmtTime(totalSecs)}</span>
              <span style={{ fontSize: 12, background: "#0f1117", color: "#6b7280", padding: "3px 10px", borderRadius: 4, border: "1px solid #1f2937" }}>{(workout.intervals || []).length} segments</span>
              <span style={{ fontSize: 12, background: "#1a1400", color: "#fbbf24", padding: "3px 10px", borderRadius: 4, border: "1px solid #2a2000" }}>{(workout.textEvents || []).length} prompts</span>
            </div>
          )}
        </div>

        <div style={S.card}>
          <button disabled={loading} onClick={generate}
            style={{ width: "100%", padding: "13px", background: loading ? "#1f2937" : "#22d3ee", color: loading ? "#4b5563" : "#06070a", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: workout ? 8 : 0, letterSpacing: "0.3px" }}>
            {loading ? "⏳  GENERATING..." : (workout ? "↻  REGENERATE (" + profile.dur + " MIN)" : "⚡  GENERATE — " + session.label.toUpperCase() + " · " + profile.dur + " MIN")}
          </button>

          {workout && (
            <div>
              <button onClick={isMobile ? doShare : doDownload}
                style={{ width: "100%", padding: "13px", background: sent ? "#052010" : "transparent", color: sent ? "#4ade80" : "#22d3ee", border: "1px solid " + (sent ? "#0a3020" : "#22d3ee33"), borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.3px", marginBottom: 8 }}>
                {sent ? "✓  DONE!" : (isMobile ? "📤  SEND TO DESKTOP" : "↓  DOWNLOAD .ZWO")}
              </button>
              <div style={{ background: "#08090e", border: "1px solid #10141e", borderRadius: 8, overflow: "hidden" }}>
                <div onClick={function() { setGuide(function(g) { return !g; }); }}
                  style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "1.5px", textTransform: "uppercase" }}>📱 Phone to Desktop guide</span>
                  <span style={{ fontSize: 11, color: "#4b5563" }}>{guide ? "▲" : "▼"}</span>
                </div>
                {guide && (
                  <div style={{ borderTop: "1px solid #10141e" }}>
                    {[
                      { title: "iPhone to Mac via AirDrop", col: "#a78bfa", steps: [["Tap Send to Desktop", "iOS share sheet opens with the .zwo file."], ["Tap AirDrop and select your Mac", "Mac must be unlocked and nearby."], ["Accept on Mac", "File saves to Downloads folder."], ["Move to Zwift folder", "Documents/Zwift/Workouts/your_id/"]] },
                      { title: "Android to Windows via Google Drive", col: "#34d399", steps: [["Tap Send to Desktop", "Share sheet opens — tap Save to Drive."], ["Open Google Drive on Windows", "drive.google.com/download"], ["Move .zwo to Zwift folder", "Documents\\Zwift\\Workouts\\your_id\\"], ["Launch Zwift", "Find it under Custom Workouts."]] },
                    ].map(function(section) {
                      return (
                        <div key={section.title} style={{ padding: "12px 14px", borderBottom: "1px solid #0d1117" }}>
                          <div style={{ fontSize: 11, color: section.col, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>{section.title}</div>
                          {section.steps.map(function(step, i) {
                            return (
                              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: section.col + "22", color: section.col, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid " + section.col + "44" }}>{i + 1}</div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", marginBottom: 1 }}>{step[0]}</div>
                                  <div style={{ fontSize: 12, color: "#6b7280" }}>{step[1]}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {!workout && (
            <div style={{ fontSize: 11, color: "#374151", textAlign: "center", marginTop: 8 }}>
              {"Generating a "}<span style={{ color: profile.color, fontWeight: 700 }}>{profile.dur}-minute</span>{" workout for "}<span style={{ color: profile.color, fontWeight: 700 }}>{profile.name}</span>{" at " + profile.ftp + "w FTP"}
            </div>
          )}
        </div>

        {workout && (
          <div>
            <div style={S.card}>
              <label style={S.lbl}>{"Power Profile — FTP basis: " + profile.ftp + "w"}</label>
              <PowerChart intervals={workout.intervals || []} textEvents={workout.textEvents || []} />
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                {ZONES.map(function(z) {
                  return (
                    <div key={z.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: z.color }} />
                      <span style={{ fontSize: 10, color: "#374151" }}>{z.label} {z.name}</span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                  <div style={{ width: 10, height: 2, background: "#fbbf24", opacity: 0.6 }} />
                  <span style={{ fontSize: 10, color: "#374151" }}>prompt</span>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <label style={S.lbl}>Intervals</label>
              {(workout.intervals || []).map(function(iv, i) {
                var p = iv.type === "interval" ? iv.onPower : iv.type === "ramp" ? (iv.powerHigh || 0) : (iv.power || 0);
                var z = getZone(p);
                var avg = iv.type === "interval" ? iv.onPower : iv.type === "ramp" ? ((iv.powerLow || 0) + (iv.powerHigh || 0)) / 2 : (iv.power || 0);
                var watts = Math.round(avg * profile.ftp);
                var label = "";
                if (iv.type === "steady")   label = Math.round((iv.power || 0) * 100) + "% FTP — " + fmtTime(iv.duration);
                if (iv.type === "ramp")     label = "Ramp " + Math.round((iv.powerLow || 0) * 100) + "% to " + Math.round((iv.powerHigh || 0) * 100) + "% — " + fmtTime(iv.duration);
                if (iv.type === "interval") label = iv.repeat + "x | " + fmtTime(iv.onDuration) + " @ " + Math.round((iv.onPower || 0) * 100) + "% / " + fmtTime(iv.offDuration) + " @ " + Math.round((iv.offPower || 0) * 100) + "%";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", background: "#0d1117", borderRadius: 7, marginBottom: 5, border: "1px solid #1f2937" }}>
                    <div style={{ width: 3, height: 34, borderRadius: 2, background: z.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{label}</div>
                    <span style={{ fontSize: 11, color: z.color, fontWeight: 700 }}>{z.label}</span>
                    <span style={{ fontSize: 12, color: "#4b5563" }}>{watts}w</span>
                  </div>
                );
              })}
            </div>

            {(workout.textEvents || []).length > 0 && (
              <div style={S.card}>
                <label style={S.lbl}>Coaching Text Prompts</label>
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 10, padding: "8px 12px", background: "#050d08", borderRadius: 6, border: "1px solid #0a2010" }}>
                  These messages appear on your Zwift screen at the exact second shown.
                </div>
                {[...(workout.textEvents || [])].sort(function(a, b) { return a.offset - b.offset; }).map(function(ev, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", background: "#0d1117", borderRadius: 7, marginBottom: 5, border: "1px solid #1f2937" }}>
                      <div style={{ background: "#051a0a", color: "#34d399", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap", border: "1px solid #0a2a10", minWidth: 44, textAlign: "center", flexShrink: 0 }}>{fmtTime(ev.offset)}</div>
                      <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>{ev.message}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
