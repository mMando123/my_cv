const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));
const state = {
  typing: {
    titles: [
      "IT Help Desk Specialist",
      "Network Administrator",
      "ERP & ECM Support"
    ],
    idx: 0,
    char: 0,
    deleting: false
  },
  toastTimer: null,
  konami: {
    seq: ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"],
    buf: []
  },
  particles: {
    running: false,
    dpr: 1,
    w: 0,
    h: 0,
    nodes: []
  }
};

function clamp(n, a, b){
  return Math.max(a, Math.min(b, n));
}

function showToast(text){
  const el = $("#toast");
  if (!el) return;
  if (state.toastTimer) window.clearTimeout(state.toastTimer);
  el.textContent = String(text || "");
  el.classList.add("is-show");
  state.toastTimer = window.setTimeout(() => {
    el.classList.remove("is-show");
  }, 2600);
}

function setYear(){
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function setTheme(next){
  const root = document.documentElement;
  if (next === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
  try{ localStorage.setItem("theme", next); }catch(_e){}
}

function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem("theme"); }catch(_e){}
  if (saved === "light") setTheme("light");
  else setTheme("dark");

  const btn = $("#themeToggle");
  if (btn){
    btn.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      setTheme(isLight ? "dark" : "light");
      showToast(isLight ? "Dark theme" : "Light theme");
    });
  }
}

function initNav(){
  const toggle = $("#navToggle");
  const menu = $("#navMenu");
  const links = $$('[data-nav]');

  function setOpen(open){
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    menu.classList.toggle("is-open", open);
  }

  if (toggle && menu){
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    links.forEach(l => l.addEventListener("click", () => setOpen(false)));

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!t) return;
      if (!menu.contains(t) && !toggle.contains(t)) setOpen(false);
    });
  }

  function updateActive(){
    const sections = $$('main section[id]');
    const y = window.scrollY + 120;
    let current = "home";

    for (const s of sections){
      const top = s.offsetTop;
      const bottom = top + s.offsetHeight;
      if (y >= top && y < bottom){
        current = s.id;
        break;
      }
    }

    links.forEach(a => {
      const href = a.getAttribute("href") || "";
      const isActive = href === `#${current}`;
      a.classList.toggle("is-active", isActive);
    });

    const active = links.find(a => a.classList.contains("is-active"));
    const indicator = $("#navIndicator");
    if (indicator && active){
      const r = active.getBoundingClientRect();
      const navR = active.closest(".nav").getBoundingClientRect();
      const w = r.width;
      const x = r.left - navR.left;
      indicator.style.width = `${w}px`;
      indicator.style.transform = `translateX(${x}px)`;
      indicator.style.opacity = "1";
    }else if (indicator){
      indicator.style.opacity = "0";
      indicator.style.width = "0";
    }
  }

  updateActive();
  window.addEventListener("scroll", updateActive, { passive: true });
  window.addEventListener("resize", updateActive);
}

function initTyping(){
  const el = $("#typing");
  if (!el) return;

  const tick = () => {
    const t = state.typing;
    const full = t.titles[t.idx] || "";

    if (!t.deleting){
      t.char = Math.min(full.length, t.char + 1);
      el.textContent = full.slice(0, t.char);
      if (t.char >= full.length){
        t.deleting = true;
        window.setTimeout(tick, 900);
        return;
      }
      window.setTimeout(tick, 42);
      return;
    }

    t.char = Math.max(0, t.char - 1);
    el.textContent = full.slice(0, t.char);
    if (t.char <= 0){
      t.deleting = false;
      t.idx = (t.idx + 1) % t.titles.length;
      window.setTimeout(tick, 200);
      return;
    }
    window.setTimeout(tick, 26);
  };

  tick();
}

function initReveal(){
  const items = $$('[data-reveal]');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.classList.add("is-in");
      io.unobserve(el);
    }
  }, { threshold: 0.12 });

  items.forEach((el, i) => {
    if (el.dataset.revealInit === "1") return;
    const delay = clamp(i * 60, 0, 420);
    el.style.transitionDelay = `${delay}ms`;
    io.observe(el);
    el.dataset.revealInit = "1";
  });
}

function initProgress(){
  const bars = $$('[data-progress]');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (!e.isIntersecting) continue;
      const el = e.target;
      const v = Number(el.getAttribute("data-progress") || "0");
      el.style.width = `${clamp(v, 0, 100)}%`;
      io.unobserve(el);
    }
  }, { threshold: 0.35 });

  bars.forEach(el => {
    if (el.dataset.progressInit === "1") return;
    io.observe(el);
    el.dataset.progressInit = "1";
  });
}

function initCounters(){
  const els = $$('[data-counter]');
  if (!els.length) return;

  const animate = (el) => {
    const to = Number(el.getAttribute("data-counter") || "0");
    const start = performance.now();
    const dur = 900;

    const step = (now) => {
      const p = clamp((now - start) / dur, 0, 1);
      const v = Math.floor(p * to);
      el.textContent = `${v}+`;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = `${to}+`;
    };

    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (!e.isIntersecting) continue;
      animate(e.target);
      io.unobserve(e.target);
    }
  }, { threshold: 0.45 });

  els.forEach(el => io.observe(el));
}

function initTilt(){
  const cards = $$('[data-tilt]');
  if (!cards.length) return;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const max = 10;

  cards.forEach(card => {
    if (card.dataset.tiltInit === "1") return;
    let raf = 0;

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (max * (0.5 - y));
      const ry = (max * (x - 0.5));

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
    };

    const reset = () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = "";
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", reset);
    card.addEventListener("blur", reset);

    card.dataset.tiltInit = "1";
  });
}

function initCursor(){
  const cursor = $("#cursor");
  if (!cursor) return;

  const isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
  if (isTouch) return;

  document.body.classList.add("is-cursor");

  const move = (e) => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
  };

  document.addEventListener("mousemove", move, { passive: true });
  document.addEventListener("mousedown", () => cursor.classList.add("is-down"));
  document.addEventListener("mouseup", () => cursor.classList.remove("is-down"));

  $$('a,button,input,textarea').forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursor.style.width = "26px";
      cursor.style.height = "26px";
      cursor.style.background = "rgba(0,212,255,0.16)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.width = "18px";
      cursor.style.height = "18px";
      cursor.style.background = "rgba(0,212,255,0.10)";
    });
  });
}

function initToasts(){
  $$('[data-toast]').forEach(el => {
    if (el.dataset.toastInit === "1") return;
    el.addEventListener("click", () => showToast(el.getAttribute("data-toast")));
    el.dataset.toastInit = "1";
  });
}

function initContactForm(){
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (new FormData(form).get("name") || "").toString().trim();
    const email = (new FormData(form).get("email") || "").toString().trim();
    const message = (new FormData(form).get("message") || "").toString().trim();

    if (!name || !email || !message){
      showToast("Please fill all fields");
      return;
    }

    try {
      showToast("Opening email client...");
      const subject = encodeURIComponent(`New Contact from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      window.location.href = `mailto:mohamednail891@gmail.com?subject=${subject}&body=${body}`;

      form.reset();
    } catch(e2) {
      showToast("Failed to open email client");
    }
  });
}

function renderSkills(items){
  const root = $("#skillsList");
  if (!root) return;

  if (!Array.isArray(items) || items.length === 0){
    root.innerHTML = "<div class=\"muted\" data-reveal>No skills yet. Add from Admin.</div>";
    initReveal();
    return;
  }

  root.innerHTML = items.map((s) => {
    const name = escapeHtml(s.name || "");
    const level = clamp(Number(s.level || 0), 0, 100);
    return `
      <div class="skill" data-reveal>
        <div class="skill__head">
          <div class="skill__name">${name}</div>
          <div class="skill__value">${level}%</div>
        </div>
        <div class="skill__bar"><span data-progress="${level}"></span></div>
      </div>
    `.trim();
  }).join("");

  initReveal();
  initProgress();
}

function renderProjects(items){
  const root = $("#projectsGrid");
  if (!root) return;

  if (!Array.isArray(items) || items.length === 0){
    root.innerHTML = "<div class=\"muted\" data-reveal>No projects yet. Add from Admin.</div>";
    initReveal();
    return;
  }

  root.innerHTML = items.map((p) => {
    const badge = escapeHtml(p.badge || "Project");
    const title = escapeHtml(p.title || "");
    const desc = escapeHtml(p.description || "");
    const role = escapeHtml(p.role || "");
    const techs = Array.isArray(p.technologies_list) ? p.technologies_list : [];
    const link = (p.link || "").toString().trim();

    const tags = [
      role ? `Role: ${role}` : "",
      ...techs.map(t => escapeHtml(t))
    ].filter(Boolean);

    const tagsHtml = tags.map(t => `<div class="tag">${t}</div>`).join("");

    const actionHtml = link
      ? `<a class="btn btn--ghost" href="${escapeHtml(link)}" target="_blank" rel="noreferrer">Open</a>`
      : `<button class="btn btn--ghost" type="button" data-toast="يمكنك إضافة رابط المشروع من لوحة التحكم">No Link</button>`;

    return `
      <article class="project" data-tilt>
        <div class="project__top">
          <div class="project__badge">${badge}</div>
          <h3 class="project__title">${title}</h3>
          <p class="project__desc">${desc}</p>
        </div>
        <div class="project__meta">${tagsHtml}</div>
        <div class="project__actions">${actionHtml}</div>
      </article>
    `.trim();
  }).join("");

  initReveal();
  initTilt();
  initToasts();
}

function initApiData(){
  const skills = [
    { name: "OS: Windows Server, Linux (Ubuntu, Kali)", level: 85 },
    { name: "Networking (CCNA-level)", level: 80 },
    { name: "IT Support & Ticketing Systems", level: 90 },
    { name: "Cybersecurity Fundamentals", level: 70 },
    { name: "ERP Support & Implementation", level: 85 },
    { name: "DB/Web: SQL, PHP, MySQL", level: 75 }
  ];
  renderSkills(skills);

  const projects = [
    {
      badge: "Web App",
      title: "Educational Website for Teaching Arabic to Non-Native Speakers",
      description: "Developed a comprehensive educational website aimed at teaching the Arabic language. Managed the database and handled the back-end development.",
      role: "Backend & Database Developer",
      technologies_list: ["SQL", "PHP", "MySQL"],
      link: "#"
    }
  ];
  renderProjects(projects);
}

function initKonami(){
  window.addEventListener("keydown", (e) => {
    state.konami.buf.push(e.key);
    if (state.konami.buf.length > state.konami.seq.length) state.konami.buf.shift();

    const ok = state.konami.seq.every((k, i) => state.konami.buf[i] === k);
    if (ok){
      document.body.classList.toggle("neon");
      showToast(document.body.classList.contains("neon") ? "Neon mode" : "Normal mode");
      state.konami.buf = [];
    }
  });
}

function initParticles(){
  const canvas = $("#fx");
  if (!canvas) return;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const P = state.particles;

  function resize(){
    P.dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    P.w = Math.max(1, Math.floor(r.width));
    P.h = Math.max(1, Math.floor(r.height));
    canvas.width = Math.floor(P.w * P.dpr);
    canvas.height = Math.floor(P.h * P.dpr);
    ctx.setTransform(P.dpr, 0, 0, P.dpr, 0, 0);

    const count = clamp(Math.floor((P.w * P.h) / 19000), 32, 110);
    P.nodes = Array.from({ length: count }).map(() => ({
      x: Math.random() * P.w,
      y: Math.random() * P.h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 1 + Math.random() * 2.2,
      a: 0.12 + Math.random() * 0.28
    }));
  }

  function draw(){
    if (!P.running) return;

    ctx.clearRect(0, 0, P.w, P.h);

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#00d4ff";
    const accent2 = getComputedStyle(document.documentElement).getPropertyValue("--accent2").trim() || "#00ff88";

    for (const n of P.nodes){
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < -20) n.x = P.w + 20;
      if (n.x > P.w + 20) n.x = -20;
      if (n.y < -20) n.y = P.h + 20;
      if (n.y > P.h + 20) n.y = -20;

      ctx.beginPath();
      ctx.fillStyle = `rgba(0,212,255,${n.a})`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < P.nodes.length; i++){
      for (let j = i + 1; j < P.nodes.length; j++){
        const a = P.nodes[i];
        const b = P.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d > 120) continue;

        const k = 1 - (d / 120);
        const alpha = 0.10 * k;
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, `rgba(${hexToRgb(accent)},${alpha})`);
        grad.addColorStop(1, `rgba(${hexToRgb(accent2)},${alpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  function hexToRgb(hex){
    const c = hex.replace("#", "").trim();
    if (!/^[0-9a-fA-F]{3,8}$/.test(c)) return "0,212,255";
    const v = c.length === 3
      ? c.split("").map(ch => ch + ch).join("")
      : c.slice(0, 6);
    const n = parseInt(v, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `${r},${g},${b}`;
  }

  resize();
  P.running = true;
  requestAnimationFrame(draw);
  window.addEventListener("resize", resize);
}

function initLoading(){
  const loading = $("#loading");
  if (!loading) return;

  window.addEventListener("load", () => {
    window.setTimeout(() => loading.classList.add("is-hidden"), 250);
  });
}

function initTerminal(){
  const box = $("#terminalLines");
  if (!box) return;

  const lines = [
    '{',
    '  "os": ["Windows Server", "Linux (Ubuntu, Kali linux)"],',
    '  "networking": "CCNA-level (Routing, Switching, Troubleshooting)",',
    '  "support": ["Help Desk", "Ticketing Systems", "Remote Support"],',
    '  "security": ["Fundamentals", "Vulnerability Awareness"],',
    '  "erp": "ERP Support & Implementation",',
    '  "dev": ["Python", "SQL", "PHP", "MySQL"]',
    '}'
  ];

  const wrap = document.createElement("div");
  wrap.className = "line";
  wrap.innerHTML = '<span class="result"></span>';

  const target = wrap.querySelector(".result");
  if (!target) return;

  let i = 0;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (!e.isIntersecting) continue;

      const tick = () => {
        if (i >= lines.length) return;
        const div = document.createElement("div");
        div.className = "line";
        div.innerHTML = `<span class="result">${escapeHtml(lines[i])}</span>`;
        box.appendChild(div);
        i += 1;
        window.setTimeout(tick, 90);
      };

      tick();
      io.disconnect();
    }
  }, { threshold: 0.35 });

  io.observe(box);
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

setYear();
initTheme();
initLoading();
initNav();
initReveal();
initTyping();
initProgress();
initCounters();
initTilt();
initCursor();
initToasts();
initContactForm();
initKonami();
initParticles();
initTerminal();
initApiData();
