"use client";

import { useEffect, useRef } from "react";

const rand = (min, max) => min + Math.random() * (max - min);

function makeStars(w, h) {
  const count = Math.round((w * h) / 2600);
  const tints = ["255,255,255", "255,255,255", "200,220,255", "255,236,210", "215,205,255"];
  return Array.from({ length: count }, () => {
    const depth = Math.random(); // 0 = far, 1 = near
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.3 + depth * depth * 1.3,
      alpha: 0.35 + depth * 0.6,
      parallax: 0.02 + depth * 0.12,
      twinkleSpeed: rand(0.4, 2.2),
      phase: Math.random() * Math.PI * 2,
      tint: tints[(Math.random() * tints.length) | 0],
    };
  });
}

function makeNebula(w, h, dpr) {
  const c = document.createElement("canvas");
  c.width = w * dpr;
  c.height = h * dpr;
  const g = c.getContext("2d");
  g.scale(dpr, dpr);

  const base = g.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, "#070b18");
  base.addColorStop(0.5, "#0b1024");
  base.addColorStop(1, "#090716");
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);

  const clouds = [
    [0.15, 0.25, 0.55, "88,60,180", 0.16],
    [0.85, 0.7, 0.6, "40,90,190", 0.14],
    [0.6, 0.15, 0.35, "150,60,160", 0.08],
    [0.3, 0.85, 0.45, "30,110,160", 0.08],
  ];
  const span = Math.max(w, h);
  for (const [cx, cy, rr, col, a] of clouds) {
    const x = cx * w;
    const y = cy * h;
    const r = rr * span;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${col},${a})`);
    grad.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }
  return c;
}

function spawnMeteor(w, h) {
  const angle = rand(Math.PI * 0.18, Math.PI * 0.32); // heading down-left
  const speed = rand(700, 1200); // px / s
  return {
    x: rand(w * 0.25, w * 1.1),
    y: rand(-h * 0.1, h * 0.45),
    vx: -Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    len: rand(120, 260),
    life: 0,
    maxLife: rand(0.7, 1.3),
    width: rand(1, 2),
  };
}

function drawSpace(ctx, s, t, scrollY, dt, animate) {
  const { w, h } = s;
  ctx.drawImage(s.nebula, 0, 0, w, h);

  for (const st of s.stars) {
    let y = (st.y - scrollY * st.parallax) % h;
    if (y < 0) y += h;
    const tw = animate ? 0.65 + 0.35 * Math.sin(t * st.twinkleSpeed + st.phase) : 1;
    const a = st.alpha * tw;
    ctx.fillStyle = `rgba(${st.tint},${a})`;
    ctx.beginPath();
    ctx.arc(st.x, y, st.r, 0, Math.PI * 2);
    ctx.fill();
    if (st.r > 1.1) {
      // soft glow on the brightest stars
      ctx.fillStyle = `rgba(${st.tint},${a * 0.12})`;
      ctx.beginPath();
      ctx.arc(st.x, y, st.r * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const p of s.spacePlanets) {
    const y = p.py - Math.min(scrollY * p.parallax, h * 0.3);
    ctx.globalAlpha = p.alpha;
    ctx.drawImage(p.sprite, p.px - p.sprite.width / 2, y - p.sprite.height / 2);
  }
  ctx.globalAlpha = 1;

  if (!animate) return;

  s.nextMeteor -= dt;
  if (s.nextMeteor <= 0) {
    s.meteors.push(spawnMeteor(w, h));
    if (Math.random() < 0.2) s.meteors.push(spawnMeteor(w, h)); // occasional pair
    s.nextMeteor = rand(1.8, 5.5);
  }

  ctx.lineCap = "round";
  s.meteors = s.meteors.filter((m) => {
    m.life += dt;
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    const p = m.life / m.maxLife;
    if (p >= 1) return false;
    const fade = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
    const mag = Math.hypot(m.vx, m.vy);
    const tx = m.x - (m.vx / mag) * m.len;
    const ty = m.y - (m.vy / mag) * m.len;
    const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
    grad.addColorStop(0, `rgba(255,255,255,${0.95 * fade})`);
    grad.addColorStop(0.2, `rgba(190,215,255,${0.5 * fade})`);
    grad.addColorStop(1, "rgba(150,180,255,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = m.width;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,255,255,${fade})`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.width * 1.1, 0, Math.PI * 2);
    ctx.fill();
    return true;
  });
}

const SUN = { x: 0.04, y: -0.12 };

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed) {
  const rng = mulberry32(seed);
  const perm = new Uint16Array(512);
  const vals = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
    vals[i] = rng() * 2 - 1;
  }
  for (let i = 255; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const hash = (X, Y) => vals[perm[(perm[X & 255] + (Y & 255)) & 511]];
  const noise = (x, y, P) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    let X0 = xi;
    let X1 = xi + 1;
    if (P) {
      X0 = ((xi % P) + P) % P;
      X1 = (X0 + 1) % P;
    }
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(X0, yi);
    const b = hash(X1, yi);
    const c = hash(X0, yi + 1);
    const d = hash(X1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (x, y, octaves, period = 0) => {
    let sum = 0;
    let amp = 1;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += noise(x, y, period) * amp;
      norm += amp;
      x *= 2;
      y *= 2;
      if (period) period *= 2;
      amp *= 0.5;
    }
    return sum / norm;
  };
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function makeSkyBase(w, h, dpr) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext("2d");
  g.scale(dpr, dpr);

  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#3a78c4");
  sky.addColorStop(0.35, "#5b95d3");
  sky.addColorStop(0.7, "#93bde3");
  sky.addColorStop(1, "#d3e4ef");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  const span = Math.hypot(w, h);
  const sx = SUN.x * w;
  const sy = SUN.y * h;
  const layers = [
    [0.9, "255,250,236", 0.38],
    [0.38, "255,252,242", 0.55],
    [0.16, "255,255,250", 0.9],
  ];
  g.globalCompositeOperation = "screen";
  for (const [rr, col, a] of layers) {
    const r = span * rr;
    const grad = g.createRadialGradient(sx, sy, 0, sx, sy, r);
    grad.addColorStop(0, `rgba(${col},${a})`);
    grad.addColorStop(0.35, `rgba(${col},${a * 0.35})`);
    grad.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }
  g.globalCompositeOperation = "source-over";

  const img = g.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.random() * 2 - 1;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return c;
}

const PLANET_TEXTURES = {
  moon(fbm, lon, lat) {
    const u = lon * 1.4;
    const v = lat * 1.4;
    const mare = smooth(0.0, 0.22, fbm(u + 3.1, v + 5.7, 4));
    const speck = fbm(u * 9 + 11, v * 9 + 4, 3) * 0.07;
    const a = 0.93 - 0.36 * mare + speck;
    return [a, a * 0.985, a * 0.96];
  },
  gas(fbm, lon, lat) {
    const turb = fbm(lon * 2.5 + 1, lat * 7 + 2, 4) * 2.2;
    const band = 0.5 + 0.5 * Math.sin(lat * 15 + turb);
    const fine = fbm(lon * 6, lat * 30, 3) * 0.06;
    const t = band * 0.85 + fine;
    return [0.97 - 0.15 * t, 0.9 - 0.22 * t, 0.76 - 0.28 * t];
  },
  mars(fbm, lon, lat) {
    const dark = smooth(0.05, 0.3, fbm(lon * 1.8 + 7, lat * 1.8 + 1, 4));
    const cap = smooth(1.15, 1.3, Math.abs(lat));
    const k = 1 - 0.35 * dark;
    return [
      0.86 * k * (1 - cap) + cap * 0.97,
      0.48 * k * (1 - cap) + cap * 0.96,
      0.3 * k * (1 - cap) + cap * 0.95,
    ];
  },
  
  veiled(fbm, lon, lat) {
    const sw = fbm(lon * 2 + 4, lat * 3 + 1, 3) * 0.06;
    return [0.98 + sw, 0.95 + sw, 0.86 + sw];
  },
  
  giant(fbm, lon, lat) {
    const turb = fbm(lon * 3 + 8, lat * 9 + 3, 4) * 1.6;
    const band = 0.5 + 0.5 * Math.sin(lat * 11 + turb);
    const t = band * 0.9 + fbm(lon * 8, lat * 25, 2) * 0.08;
    return [0.97 - 0.12 * t, 0.86 - 0.26 * t, 0.7 - 0.34 * t];
  },
  ice(fbm, lon, lat) {
    const b = Math.sin(lat * 9 + fbm(lon * 2, lat * 4, 2)) * 0.035;
    return [0.66 + b, 0.88 + b, 0.93 + b];
  },
};

function makePlanetSprite(p, L, fbm) {
  const r = p.r;
  const pad = p.ring ? 2.35 : p.atmo ? 1.4 : 1.05;
  const size = Math.ceil(r * pad * 2) + 2;
  const cx = size / 2;
  const cy = size / 2;
  const tilt = p.tilt || 0;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const tex = PLANET_TEXTURES[p.kind];

  const body = document.createElement("canvas");
  body.width = size;
  body.height = size;
  const bctx = body.getContext("2d");
  const img = bctx.createImageData(size, size);
  const out = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5 - cx) / r;
      const ny = (y + 0.5 - cy) / r;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1.02) continue;
      const nz = Math.sqrt(Math.max(0, 1 - d2));
      const tx = nx * cosT + ny * sinT;
      const ty = -nx * sinT + ny * cosT;
      const lat = Math.asin(Math.max(-1, Math.min(1, ty)));
      const lon = Math.atan2(tx, nz);
      let [cr, cg, cb] = tex(fbm, lon, lat);
      if (p.tint) {
        cr = Math.min(1, cr * p.tint[0]);
        cg = Math.min(1, cg * p.tint[1]);
        cb = Math.min(1, cb * p.tint[2]);
      }
      let lambert = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      lambert = Math.pow(lambert, p.kind === "moon" ? 0.6 : 0.85); // regolith is retro-reflective
      const limb = p.kind === "moon" ? 1 : 0.5 + 0.5 * Math.sqrt(nz);
      const k = (lambert + (p.ambient || 0)) * limb * p.gain * 255;
      const o = (y * size + x) * 4;
      out[o] = cr * k;
      out[o + 1] = cg * k;
      out[o + 2] = cb * k;
      out[o + 3] = 255 * Math.min(1, Math.max(0, (1 - Math.sqrt(d2)) * r + 0.5));
    }
  }
  bctx.putImageData(img, 0, 0);

  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");

  const ringLayer = (front) => {
    const rc = document.createElement("canvas");
    rc.width = size;
    rc.height = size;
    const rg = rc.getContext("2d");
    rg.save();
    rg.translate(cx, cy);
    rg.rotate(tilt);
    for (const [k, width, bright] of p.ring.bands) {
      const v = bright * p.gain;
      rg.strokeStyle = `rgba(${236 * v},${220 * v},${188 * v},${p.ring.opacity ?? 1})`;
      rg.lineWidth = Math.max(0.6, r * width);
      rg.beginPath();
      rg.ellipse(0, 0, r * k, r * k * p.ring.squash, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
      rg.stroke();
    }
    rg.restore();
    const span = r * 2.2;
    const shade = rg.createLinearGradient(cx + L[0] * span, cy + L[1] * span, cx - L[0] * span, cy - L[1] * span);
    shade.addColorStop(0, "rgba(0,0,0,1)");
    shade.addColorStop(0.55, "rgba(0,0,0,0.8)");
    shade.addColorStop(1, `rgba(0,0,0,${p.ring.farSide ?? 0.35})`);
    rg.globalCompositeOperation = "destination-in";
    rg.fillStyle = shade;
    rg.fillRect(0, 0, size, size);
    return rc;
  };
  const drawRing = (front) => {
    if (p.ring) g.drawImage(ringLayer(front), 0, 0);
  };

  if (p.atmo) {
    const hx = cx + L[0] * r * 0.18;
    const hy = cy + L[1] * r * 0.18;
    const halo = g.createRadialGradient(hx, hy, r * 0.9, hx, hy, r * 1.35);
    const ha = p.atmoStrength ?? 0.4;
    halo.addColorStop(0, `rgba(${p.atmo},${ha})`);
    halo.addColorStop(0.35, `rgba(${p.atmo},${ha * 0.3})`);
    halo.addColorStop(1, `rgba(${p.atmo},0)`);
    g.fillStyle = halo;
    g.fillRect(0, 0, size, size);
  }
  drawRing(false);
  g.drawImage(body, 0, 0);
  drawRing(true);
  return c;
}

function makePlanets(w, h) {
  const base = Math.min(w, h);
  const mobile = w < 768;
  const fbm = makeNoise(7);
  const ringBands = [
    [1.28, 0.06, 0.18], [1.38, 0.1, 0.45], [1.5, 0.12, 0.7], [1.62, 0.1, 0.78],
    [1.74, 0.05, 0.08], [1.84, 0.1, 0.55], [1.95, 0.07, 0.4], [2.08, 0.04, 0.15],
  ];
  const defs = [
    { kind: "moon", x: mobile ? 0.78 : 0.83, y: mobile ? 0.14 : 0.2, r: base * (mobile ? 0.1 : 0.085), phase: 0.55, gain: 0.95, alpha: 0.9 },
    { kind: "gas", x: mobile ? 0.2 : 0.13, y: mobile ? 0.72 : 0.58, r: base * (mobile ? 0.05 : 0.045), phase: 0.75, gain: 1, alpha: 0.8, tilt: -0.38, ring: { squash: 0.3, bands: ringBands } },
    { kind: "mars", x: mobile ? 0.52 : 0.6, y: mobile ? 0.07 : 0.1, r: base * 0.016, phase: 0.8, gain: 0.9, alpha: 0.8 },
    { kind: "veiled", x: mobile ? 0.22 : 0.34, y: mobile ? 0.3 : 0.24, r: base * 0.02, phase: -0.35, gain: 1, alpha: 0.35 },
    { kind: "giant", x: mobile ? 0.78 : 0.71, y: mobile ? 0.44 : 0.47, r: base * (mobile ? 0.04 : 0.034), phase: 0.65, gain: 0.85, alpha: 0.28, tilt: 0.12 },
    { kind: "ice", x: mobile ? 0.88 : 0.92, y: mobile ? 0.6 : 0.78, r: base * 0.024, phase: 0.6, gain: 0.8, alpha: 0.7, tilt: 0.5 },
  ];
  return placePlanets(defs, w, h, SUN, fbm);
}

function placePlanets(defs, w, h, sun, fbm) {
  return defs.map((p) => {
    const px = p.x * w;
    const py = p.y * h;
    const dx = sun.x * w - px;
    const dy = sun.y * h - py;
    const len = Math.hypot(dx, dy);
    const side = Math.sqrt(1 - p.phase * p.phase);
    const L = [(dx / len) * side, (dy / len) * side, p.phase];
    return { ...p, px, py, sprite: makePlanetSprite(p, L, fbm) };
  });
}

const SPACE_SUN = { x: -0.35, y: 0.15 };

function makeSpacePlanets(w, h) {
  const base = Math.min(w, h);
  const mobile = w < 768;
  const fbm = makeNoise(19);
  const ringBands = [
    [1.3, 0.08, 0.15], [1.42, 0.12, 0.4], [1.56, 0.12, 0.6], [1.7, 0.06, 0.06],
    [1.8, 0.1, 0.45], [1.92, 0.06, 0.25],
  ];
  const defs = [
    { kind: "giant", x: mobile ? 0.82 : 0.86, y: mobile ? 0.86 : 0.8, r: base * (mobile ? 0.07 : 0.06), phase: 0.1, gain: 0.8, ambient: 0.012, alpha: 0.11, parallax: 0.06, tilt: -0.28, tint: [0.8, 0.78, 1.3], atmo: "190,160,255", atmoStrength: 0.18, ring: { squash: 0.22, bands: ringBands, opacity: 0.55, farSide: 0.12 } },
    { kind: "ice", x: mobile ? 0.82 : 0.76, y: mobile ? 0.17 : 0.15, r: base * (mobile ? 0.05 : 0.042), phase: 0.15, gain: 0.9, ambient: 0.015, alpha: 0.12, parallax: 0.035, tilt: 0.4, tint: [1.05, 0.82, 1.05], atmo: "150,165,255", atmoStrength: 0.3 },
    { kind: "mars", x: mobile ? 0.14 : 0.12, y: mobile ? 0.3 : 0.26, r: base * 0.022, phase: 0.45, gain: 1, ambient: 0.015, alpha: 0.12, parallax: 0.03, tint: [1, 0.95, 1.7] },
    { kind: "moon", x: mobile ? 0.2 : 0.27, y: mobile ? 0.72 : 0.76, r: base * 0.014, phase: 0.3, gain: 0.9, alpha: 0.09, parallax: 0.02, tint: [0.9, 0.95, 1.12] },
    { kind: "veiled", x: mobile ? 0.55 : 0.47, y: mobile ? 0.1 : 0.1, r: base * 0.01, phase: -0.2, gain: 1, alpha: 0.09, parallax: 0.015, tint: [0.95, 0.85, 1.12] },
  ];
  return placePlanets(defs, w, h, SPACE_SUN, fbm);
}

function makeSoftDot() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

function paintPlume(g, p, off, R, gauss, dot) {
  const dx = Math.cos(p.ang);
  const dy = Math.sin(p.ang);
  const px = -dy;
  const py = dx;
  const spine = (t) => {
    const along = p.len * t;
    const side = p.len * (p.bend * Math.sin(Math.PI * t) * 0.3 + p.hook * t * t * t * 0.3);
    return [p.x + off + dx * along + px * side, p.y + dy * along + py * side];
  };
  const prof = (t) => Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.6); 
  const half = 30 * p.size;

  const steps = Math.ceil(p.len / 5);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = spine(t);
    const pr = prof(t);
    let r = half * 2.2 * pr + 8;
    g.globalAlpha = 0.018 * p.alpha;
    g.drawImage(dot, x - r, y - r, r * 2, r * 2);
    r = half * 1.0 * pr + 4;
    g.globalAlpha = 0.024 * p.alpha;
    g.drawImage(dot, x - r, y - r, r * 2, r * 2);
  }

  g.strokeStyle = "#fff";
  g.lineCap = "round";

  const fibres = Math.round(90 * p.size);
  for (let j = 0; j < fibres; j++) {
    const o = gauss() * 0.85;
    const t0 = R() * 0.8;
    const t1 = Math.min(1, t0 + 0.12 + R() * 0.55);
    const ph = R() * 6.3;
    const wig = 1 + R() * 3;
    g.globalAlpha = (0.04 + R() * 0.09) * p.alpha * (1 - Math.min(0.7, Math.abs(o) * 0.4));
    g.lineWidth = 0.4 + R() * 1.1;
    g.beginPath();
    for (let t = t0; t <= t1; t += 0.016) {
      const [x, y] = spine(t);
      const k = o * half * prof(t) + Math.sin(t * 24 + ph) * wig;
      const X = x + px * k;
      const Y = y + py * k;
      t === t0 ? g.moveTo(X, Y) : g.lineTo(X, Y);
    }
    g.stroke();
  }

  const hairs = Math.round(150 * p.size);
  for (let j = 0; j < hairs; j++) {
    const t = 0.04 + R() * 0.92;
    const pr = prof(t);
    if (pr < 0.08) continue;
    const [x, y] = spine(t);
    const side = R() < 0.88 ? p.side : -p.side;
    const so = side * half * pr * R() * 0.7;
    const L = (30 + R() * 120) * p.size * (0.4 + pr);
    const sx = x + px * so;
    const sy = y + py * so;
    const ex = sx + px * side * L * 0.45 - dx * L * 0.95;
    const ey = sy + py * side * L * 0.45 - dy * L * 0.95;
    const curl = (R() - 0.2) * L * 0.35;
    const cx = (sx + ex) / 2 + px * side * curl;
    const cy = (sy + ey) / 2 + py * side * curl;
    g.globalAlpha = (0.03 + R() * 0.07) * p.alpha;
    g.lineWidth = 0.35 + R() * 0.8;
    g.beginPath();
    g.moveTo(sx, sy);
    g.quadraticCurveTo(cx, cy, ex, ey);
    g.stroke();
  }
  g.globalAlpha = 1;
}

function makeClouds(w, h, dpr = 1) {
  const k = Math.min(dpr, 1.5); 
  const W = Math.round(w * 1.6);
  const c = document.createElement("canvas");
  c.width = Math.round(W * k);
  c.height = Math.round(h * k);
  const g = c.getContext("2d");
  g.scale(k, k);

  const R = mulberry32(11);
  const gauss = () => (R() + R() + R() - 1.5) / 1.5;
  const dot = makeSoftDot();
  const span = Math.max(h, w * 0.55);

  const plumes = [];
  const n = Math.max(1, Math.round(W / 1300)); 
  for (let i = 0; i < n; i++) {
    plumes.push({
      x: ((i + R() * 0.7) / n) * W,
      y: h * (0.35 + R() * 0.7),
      ang: -(0.5 + R() * 0.3),
      len: span * (0.55 + R() * 0.45),
      size: (w < 768 ? 0.6 : 0.8) + R() * 0.5,
      bend: (R() - 0.5) * 0.6,
      hook: (R() - 0.5) * 0.8,
      side: R() < 0.5 ? 1 : -1,
      alpha: 0.5 + R() * 0.15,
    });
    plumes.push({
      x: ((i + 0.5 + R() * 0.5) / n) * W,
      y: h * (0.15 + R() * 0.8),
      ang: -(0.4 + R() * 0.4),
      len: span * (0.3 + R() * 0.35),
      size: 0.35 + R() * 0.35,
      bend: (R() - 0.5) * 0.8,
      hook: (R() - 0.5),
      side: R() < 0.5 ? 1 : -1,
      alpha: 0.25 + R() * 0.15,
    });
  }
  const all = [];
  for (const p of plumes) {
    all.push(p);
    if (p.size < 0.75) continue;
    const branches = (R() * 2) | 0;
    for (let b = 0; b < branches; b++) {
      const t = 0.55 + R() * 0.35;
      const along = p.len * t;
      const side = p.len * (p.bend * Math.sin(Math.PI * t) * 0.3);
      all.push({
        ...p,
        x: p.x + Math.cos(p.ang) * along - Math.sin(p.ang) * side,
        y: p.y + Math.sin(p.ang) * along + Math.cos(p.ang) * side,
        ang: p.ang + Math.PI + (R() < 0.5 ? -1 : 1) * (0.1 + R() * 0.25),
        len: p.len * (0.35 + R() * 0.35),
        side: -p.side,
        size: p.size * (0.45 + R() * 0.25),
        hook: (R() - 0.5) * 1.2,
        alpha: p.alpha * 0.8,
      });
    }
  }
  for (const p of all) {
    const ex = p.x + Math.cos(p.ang) * p.len;
    const pad = p.len * 0.35 + 200 * p.size;
    const lo = Math.min(p.x, ex) - pad;
    const hi = Math.max(p.x, ex) + pad;
    for (const off of [-W, 0, W]) {
      if (hi + off < 0 || lo + off > W) continue;
      paintPlume(g, p, off, R, gauss, dot);
    }
  }
  return { tex: c, width: W, height: h, offset: 0, speed: 7 };
}

function drawSky(ctx, s, scrollY, dt, animate) {
  const { w, h } = s;
  ctx.drawImage(s.skyBase, 0, 0, w, h);

  ctx.globalCompositeOperation = "screen";
  for (const p of s.planets) {
    const y = p.py - Math.min(scrollY * 0.04, h * 0.2);
    ctx.globalAlpha = p.alpha;
    ctx.drawImage(p.sprite, p.px - p.sprite.width / 2, y - p.sprite.height / 2);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  const cl = s.clouds;
  if (animate) cl.offset = (cl.offset + cl.speed * dt) % cl.width;
  const x0 = cl.offset - cl.width;
  ctx.drawImage(cl.tex, x0, 0, cl.width, cl.height);
  ctx.drawImage(cl.tex, x0 + cl.width, 0, cl.width, cl.height);
}

export default function CosmicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const root = document.documentElement;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const s = {
      w: 0,
      h: 0,
      dpr: 1,
      stars: [],
      nebula: null,
      spacePlanets: null,
      meteors: [],
      nextMeteor: 1.5,
      skyBase: null,
      planets: null,
      clouds: null,
    };
    let raf = 0;
    let last = performance.now();

    const isLight = () => root.classList.contains("light");

    const skyParts = [
      () => s.skyBase || (s.skyBase = makeSkyBase(s.w, s.h, s.dpr)),
      () => s.planets || (s.planets = makePlanets(s.w, s.h)),
      () => s.clouds || (s.clouds = makeClouds(s.w, s.h, s.dpr)),
    ];
    const ensureSky = () => skyParts.forEach((build) => build());
    let idleId = 0;
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback || clearTimeout;
    const prewarmSky = (i = 0) => {
      if (i >= skyParts.length) return;
      idleId = idle(() => {
        skyParts[i]();
        prewarmSky(i + 1);
      });
    };

    const render = (now = performance.now()) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      const animate = !motionQuery.matches;
      if (isLight()) {
        ensureSky();
        drawSky(ctx, s, window.scrollY, dt, animate);
      } else {
        if (!s.nebula) s.nebula = makeNebula(s.w, s.h, s.dpr);
        if (!s.spacePlanets) s.spacePlanets = makeSpacePlanets(s.w, s.h);
        drawSpace(ctx, s, now / 1000, window.scrollY, dt, animate);
      }
    };

    const loop = (now) => {
      render(now);
      raf = motionQuery.matches ? 0 : requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      loop(last);
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const rebuild = w !== s.w || Math.abs(h - s.h) > 140;
      s.w = w;
      s.h = h;
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * s.dpr);
      canvas.height = Math.round(h * s.dpr);
      if (rebuild) {
        s.stars = makeStars(w, h);
        s.nebula = null;
        s.spacePlanets = null;
        s.meteors = [];
        s.skyBase = null;
        s.planets = null;
        s.clouds = null;
        cancelIdle(idleId);
        if (!isLight()) prewarmSky();
      }
      start();
    };

    const themeObserver = new MutationObserver(start);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

    const onScroll = () => {
      if (motionQuery.matches) render();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    motionQuery.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(raf);
      cancelIdle(idleId);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      motionQuery.removeEventListener("change", start);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 -z-10 w-screen h-dvh pointer-events-none"
    />
  );
}
