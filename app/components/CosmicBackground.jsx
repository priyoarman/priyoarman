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
  base.addColorStop(0, "#04060f");
  base.addColorStop(0.5, "#070a18");
  base.addColorStop(1, "#06040f");
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);

  const clouds = [
    [0.15, 0.25, 0.55, "88,60,180", 0.12],
    [0.85, 0.7, 0.6, "40,90,190", 0.1],
    [0.6, 0.15, 0.35, "150,60,160", 0.06],
    [0.3, 0.85, 0.45, "30,110,160", 0.06],
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

const sunPos = (w, h) => ({ x: 50 / w, y: (w >= 768 ? 51 : 42) / h });
const HORIZON = 0.75;

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

function makePuffSprites(fbm, lx, ly) {
  const S = 128;
  const variants = 8;
  const hazeLevels = [0, 0.2, 0.4, 0.6, 0.8, 0.92];
  const lz = 0.35;
  const ll = Math.hypot(lx, ly, lz);
  const L = [lx / ll, ly / ll, lz / ll];
  const lit = [255, 255, 255];
  const shade = [104, 128, 174];
  const tones = [1, 0.62];
  const sets = tones.map(() => []);
  for (let v = 0; v < variants; v++) {
    const out = new Float32Array(S * S * 4); 
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const dx = (x + 0.5 - S / 2) / (S / 2);
        const dy = (y + 0.5 - S / 2) / (S / 2);
        const d = Math.hypot(dx, dy);
        if (d >= 1) continue;
        const n = fbm(dx * 2.4 + v * 7.3, dy * 2.4 + v * 3.1, 4);
        const edge = 0.8 + 0.2 * n;
        const a = 1 - smooth(edge - 0.26, edge, d);
        if (a <= 0.003) continue;
        const bx = dx + fbm(dx * 4 + v, dy * 4, 2) * 0.18;
        const by = dy + fbm(dx * 4, dy * 4 + v, 2) * 0.18;
        const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, bx * bx + by * by)));
        const ndl = bx * L[0] + by * L[1] + nz * L[2];
        const diff = Math.max(0, Math.min(1, (ndl + 0.45) / 1.45));
        const rim = Math.pow(1 - nz, 2) * Math.max(0, bx * L[0] + by * L[1]) * 0.55;
        const under = 1 - 0.3 * Math.max(0, dy);
        const lum = Math.min(1, (0.12 + 0.88 * diff + rim) * under);
        const o = (y * S + x) * 4;
        out[o] = lum;
        out[o + 3] = a * 255;
      }
    }
    for (let t = 0; t < tones.length; t++) {
      const tc = document.createElement("canvas");
      tc.width = S;
      tc.height = S;
      const tg = tc.getContext("2d");
      const timg = tg.createImageData(S, S);
      const to = timg.data;
      for (let i = 0; i < out.length; i += 4) {
        if (!out[i + 3]) continue;
        const lum = Math.min(1, out[i] * tones[t]);
        for (let ch = 0; ch < 3; ch++) to[i + ch] = shade[ch] + (lit[ch] - shade[ch]) * lum;
        to[i + 3] = out[i + 3];
      }
      tg.putImageData(timg, 0, 0);
      sets[t].push(hazed(tc));
    }
  }
  return { sets, levels: hazeLevels.length };

  function hazed(c) {
    return hazeLevels.map((f) => {
      const hc = document.createElement("canvas");
      hc.width = S;
      hc.height = S;
      const hg = hc.getContext("2d");
      hg.drawImage(c, 0, 0);
      if (f > 0) {
        hg.globalCompositeOperation = "source-atop";
        hg.fillStyle = `rgba(224,233,243,${f})`;
        hg.fillRect(0, 0, S, S);
      }
      return hc;
    });
  }
}

function makeCloudBands(w, h) {
  const yH = h * HORIZON;
  const rng = mulberry32(41);
  const fbm = makeNoise(23);
  const focal = h * 0.9;
  const camH = 1;
  const d0 = (camH * focal) / (h - yH) * 0.75;
  const dMax = 90;
  const W = Math.round(w);
  const pad = Math.round(h * 0.04);
  const y0 = Math.floor(yH - pad);
  const BH = Math.ceil(h - y0);

  const sun = sunPos(w, h);
  const ldx = sun.x - 0.5;
  const ldy = sun.y - 0.85;
  const lm = Math.hypot(ldx, ldy);
  const { sets, levels } = makePuffSprites(fbm, ldx / lm, ldy / lm);
  const hazeLvl = (d) => Math.min(levels - 1, Math.round((1 - Math.exp(-(d - d0) * 0.045)) * (levels - 1) * 1.1));

  const BANDS = 8;
  const ratio = Math.pow(dMax / d0, 1 / BANDS);
  const wind = (13 * d0) / focal;
  const out = [];
  for (let b = 0; b < BANDS; b++) {
    const far = dMax / Math.pow(ratio, b);
    const near = far / ratio;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = BH;
    const g = c.getContext("2d");

    for (let row = far; row >= near; row /= 1.045) {
      const P = (W * row) / focal;
      const K = Math.max(2, Math.round(P * 0.3));
      for (let x = 0; x < P; x += 1.5 * (0.6 + rng() * 0.8)) {
        const cd = row * (1 + (rng() - 0.5) * 0.04);
        const u = (x / P) * K;
        const roll = Math.sin(cd * 1.4 + fbm(u * 0.5 + 4, cd * 0.15, 2, Math.max(1, K >> 1)) * 4);
        const cov = fbm(u + 1.3, cd * 0.3 + 2.7, 3, K) + roll * 0.18;
        if (cov < -0.06) continue;
        const R = (0.7 + rng() * 0.6) * (0.9 + cov * 0.5);
        const Rpx = (R * focal) / cd;
        const count = Rpx < 5 ? 2 : Rpx < 20 ? 6 : 10 + ((rng() * 6) | 0);
        const grey = fbm(u * 1.6 + 9, cd * 0.5 + 3, 2, K * 2) < -0.05;
        const puffs = [];
        for (let i = 0; i < count; i++) {
          const ang = rng() * Math.PI * 2;
          const rr = R * Math.sqrt(rng()) * 0.9;
          const t = rr / R;
          puffs.push({
            ox: Math.cos(ang) * rr,
            oz: Math.sin(ang) * rr * 0.5,
            oh: R * (0.03 + 0.22 * rng() * (1 - t)),
            pr: R * (0.38 + 0.25 * rng()) * (1 - 0.25 * t),
          });
        }
        puffs.sort((a, b2) => b2.oz - a.oz || a.oh - b2.oh);
        for (const p of puffs) {
          const pd = cd + p.oz;
          if (pd <= 0.2) continue;
          const rx = ((p.pr * focal) / pd) * 1.3;
          const ry = rx * 0.55;
          const sy = yH + ((camH - p.oh) * focal) / pd - y0;
          let sx = ((x + p.ox) * focal) / row;
          sx = ((sx % W) + W) % W;
          const tone = grey || p.oh < R * 0.08 ? 1 : 0;
          const img = sets[tone][(rng() * sets[tone].length) | 0][hazeLvl(pd)];
          for (const ox of [-W, 0, W]) {
            const X = sx + ox;
            if (X + rx < 0 || X - rx > W) continue;
            g.drawImage(img, X - rx, sy - ry, rx * 2, ry * 2);
          }
        }
      }
    }
    const mid = Math.sqrt(far * near);
    out.push({ canvas: c, speed: (wind * focal) / mid, offset: 0 });
  }
  return { bands: out, y0, height: BH, width: W };
}

function makeLayer(w, h, dpr) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext("2d");
  g.scale(dpr, dpr);
  return [c, g];
}

function makeSkyBase(w, h, dpr) {
  const yH = h * HORIZON;
  const [c, g] = makeLayer(w, h, dpr);

  const sky = g.createLinearGradient(0, 0, 0, yH);
  sky.addColorStop(0, "#1d5bb4");
  sky.addColorStop(0.55, "#3f80cc");
  sky.addColorStop(0.9, "#8fb9e2");
  sky.addColorStop(1, "#c9dcec");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  // lower haze layer seen between the clouds
  const under = g.createLinearGradient(0, yH, 0, h);
  under.addColorStop(0, "#e0e9f3");
  under.addColorStop(0.25, "#c2d5ea");
  under.addColorStop(1, "#97b2d6");
  g.fillStyle = under;
  g.fillRect(0, yH, w, h - yH);

  // dither to kill gradient banding
  const img = g.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.random() * 2 - 1;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);

  const [front, fg] = makeLayer(w, h, dpr);
  {
    const g = fg;
    // horizon haze band: a pale, slightly warm stripe where the cloud deck meets the sky
    const band = g.createLinearGradient(0, yH - h * 0.05, 0, yH + h * 0.06);
    band.addColorStop(0, "rgba(232,236,240,0)");
    band.addColorStop(0.42, "rgba(236,234,230,0.75)");
    band.addColorStop(0.55, "rgba(240,240,240,0.6)");
    band.addColorStop(1, "rgba(230,238,246,0)");
    g.fillStyle = band;
    g.fillRect(0, yH - h * 0.05, w, h * 0.11);

    // sun: broad glow, bright core, star rays and lens-flare ghosts
    const sun = sunPos(w, h);
    const sx = sun.x * w;
    const sy = sun.y * h;
    const span = Math.hypot(w, h);
    g.globalCompositeOperation = "screen";
    for (const [rr, a] of [[0.7, 0.35], [0.25, 0.55], [0.06, 0.95], [0.018, 1]]) {
      const r = span * rr;
      const grad = g.createRadialGradient(sx, sy, 0, sx, sy, r);
      grad.addColorStop(0, `rgba(255,253,245,${a})`);
      grad.addColorStop(0.3, `rgba(255,250,238,${a * 0.4})`);
      grad.addColorStop(1, "rgba(255,250,238,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
    }
    const rng = mulberry32(3);
    g.lineCap = "round";
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + rng() * 0.15;
      const len = span * (i % 3 ? 0.035 : 0.075) * (0.6 + rng() * 0.7);
      const ray = g.createLinearGradient(sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      ray.addColorStop(0, "rgba(255,255,250,0.35)");
      ray.addColorStop(1, "rgba(255,255,250,0)");
      g.strokeStyle = ray;
      g.lineWidth = i % 3 ? 1 : 1.6;
      g.beginPath();
      g.moveTo(sx, sy);
      g.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      g.stroke();
    }
    // ghosts along the line from the sun through the screen centre, plus a faint halo ring
    const cx = w / 2;
    const cy = h / 2;
    for (const [t, rr, a, col] of [
      [0.35, 0.012, 0.35, "255,255,240"],
      [0.75, 0.03, 0.12, "180,220,255"],
      [1.25, 0.05, 0.08, "200,255,220"],
    ]) {
      const x = sx + (cx - sx) * t;
      const y = sy + (cy - sy) * t;
      const r = span * rr;
      const gh = g.createRadialGradient(x, y, 0, x, y, r);
      gh.addColorStop(0, `rgba(${col},${a})`);
      gh.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gh;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const ringR = span * 0.2;
    const ring = g.createRadialGradient(sx, sy, ringR * 0.88, sx, sy, ringR);
    ring.addColorStop(0, "rgba(255,255,255,0)");
    ring.addColorStop(0.6, "rgba(220,235,255,0.08)");
    ring.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = ring;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "source-over";

  }
  return { back: c, front };
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
  // all in the open sky above the cloud horizon
  const defs = [
    { kind: "moon", x: mobile ? 0.78 : 0.82, y: mobile ? 0.17 : 0.17, r: base * (mobile ? 0.09 : 0.075), phase: 0.55, gain: 0.95, alpha: 0.6 },
    { kind: "gas", x: mobile ? 0.2 : 0.4, y: mobile ? 0.33 : 0.3, r: base * (mobile ? 0.045 : 0.038), phase: 0.75, gain: 1, alpha: 0.3, tilt: -0.38, ring: { squash: 0.3, bands: ringBands } },
    { kind: "mars", x: mobile ? 0.62 : 0.6, y: mobile ? 0.08 : 0.08, r: base * 0.016, phase: 0.8, gain: 0.9, alpha: 0.8 },
    { kind: "veiled", x: mobile ? 0.16 : 0.27, y: mobile ? 0.18 : 0.2, r: base * 0.02, phase: -0.35, gain: 1, alpha: 0.35 },
    { kind: "giant", x: mobile ? 0.55 : 0.66, y: mobile ? 0.3 : 0.33, r: base * (mobile ? 0.035 : 0.03), phase: 0.65, gain: 0.85, alpha: 0.28, tilt: 0.12 },
    { kind: "ice", x: mobile ? 0.9 : 0.93, y: mobile ? 0.37 : 0.36, r: base * 0.022, phase: 0.6, gain: 0.8, alpha: 0.7, tilt: 0.5 },
  ];
  return placePlanets(defs, w, h, sunPos(w, h), fbm);
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
    { kind: "giant", x: mobile ? 0.82 : 0.86, y: mobile ? 0.86 : 0.8, r: base * (mobile ? 0.07 : 0.06), phase: 0.1, gain: 0.8, ambient: 0.012, alpha: 0.22, parallax: 0.06, tilt: -0.28, tint: [0.8, 0.78, 1.3], atmo: "190,160,255", atmoStrength: 0.18, ring: { squash: 0.22, bands: ringBands, opacity: 0.55, farSide: 0.12 } },
    { kind: "ice", x: mobile ? 0.82 : 0.76, y: mobile ? 0.17 : 0.15, r: base * (mobile ? 0.05 : 0.042), phase: 0.15, gain: 0.9, ambient: 0.015, alpha: 0.17, parallax: 0.035, tilt: 0.4, tint: [1.05, 0.82, 1.05], atmo: "150,165,255", atmoStrength: 0.3 },
    { kind: "mars", x: mobile ? 0.14 : 0.12, y: mobile ? 0.3 : 0.26, r: base * 0.022, phase: 0.45, gain: 1, ambient: 0.015, alpha: 0.22, parallax: 0.03, tint: [1, 0.95, 1.7] },
    { kind: "moon", x: mobile ? 0.2 : 0.27, y: mobile ? 0.72 : 0.76, r: base * 0.014, phase: 0.3, gain: 0.9, alpha: 0.2, parallax: 0.02, tint: [0.9, 0.95, 1.12] },
    { kind: "veiled", x: mobile ? 0.55 : 0.47, y: mobile ? 0.1 : 0.1, r: base * 0.01, phase: -0.2, gain: 1, alpha: 0.2, parallax: 0.015, tint: [0.95, 0.85, 1.12] },
  ];
  return placePlanets(defs, w, h, SPACE_SUN, fbm);
}

function drawSky(ctx, s, scrollY, dt, animate) {
  const { w, h } = s;
  ctx.drawImage(s.skyBase.back, 0, 0, w, h);

  // clouds drift left, nearer bands faster; each band tiles, so draw two copies
  const cl = s.clouds;
  for (const b of cl.bands) {
    if (animate) b.offset = (b.offset + b.speed * dt) % cl.width;
    const x = -b.offset;
    ctx.drawImage(b.canvas, x, cl.y0, cl.width, cl.height);
    ctx.drawImage(b.canvas, x + cl.width, cl.y0, cl.width, cl.height);
  }

  ctx.drawImage(s.skyBase.front, 0, 0, w, h);

  ctx.globalCompositeOperation = "screen";
  for (const p of s.planets) {
    const y = p.py - Math.min(scrollY * 0.02, h * 0.06);
    ctx.globalAlpha = p.alpha;
    ctx.drawImage(p.sprite, p.px - p.sprite.width / 2, y - p.sprite.height / 2);
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

const NET_RADIUS = 560; // CSS px: how far from the cursor the net shows
const NET_LINK = 130; // CSS px: max length of a line between two nodes

function makeNetNodes(w, h) {
  const count = Math.round((w * h) / 4500);
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: rand(-9, 9),
    vy: rand(-9, 9),
    red: Math.random() < 0.12,
  }));
}

// Moves the shared drifting nodes and returns those near the cursor, with their reveal.
function updateNetNodes(s, dt) {
  const reach = NET_RADIUS + NET_LINK;
  const { w, h, net: N } = s;
  if (!s.netNodes) s.netNodes = makeNetNodes(w, h);

  const near = [];
  for (const n of s.netNodes) {
    n.x += n.vx * dt;
    n.y += n.vy * dt;
    if (n.x < -20) n.x += w + 40;
    else if (n.x > w + 20) n.x -= w + 40;
    if (n.y < -20) n.y += h + 40;
    else if (n.y > h + 20) n.y -= h + 40;

    const d = Math.hypot(n.x - N.x, n.y - N.y);
    if (d > reach) continue;
    const t = Math.max(0, 1 - d / NET_RADIUS);
    n.reveal = t * t * (3 - 2 * t) * N.a;
    near.push(n);
  }
  return near;
}

// Slowly drifting nodes that link into a net, revealed only around the cursor.
function drawNet(ctx, s, dt) {
  const near = updateNetNodes(s, dt);

  const line = "110,160,235";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < near.length; i++) {
    const a = near[i];
    for (let j = i + 1; j < near.length; j++) {
      const b = near[j];
      const alpha = Math.min(a.reveal, b.reveal);
      if (alpha < 0.01) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > NET_LINK) continue;
      ctx.strokeStyle = `rgba(${line},${alpha * (1 - dist / NET_LINK) * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  for (const n of near) {
    if (n.reveal < 0.01) continue;
    ctx.fillStyle = n.red ? `rgba(235,95,105,${n.reveal * 0.85})` : `rgba(${line},${n.reveal * 0.9})`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Light mode: satellite passes. A few satellites cross on gently curved orbit arcs near the
// cursor (one runs right through it). Each track draws itself in ahead of the satellite like an
// orbit prediction; the nearest satellite opens a downlink beam to the cursor, and a lock-on HUD
// shows live range, elevation and signal. IDs and numbers are made up (range/elevation are
// computed from on-screen distance).
const SAT_LINK = 230; // CSS px within which a satellite links to the cursor
const KM_PER_PX = 4;

// Where a line through (cx, cy) at angle th leaves the screen (plus a margin), both ways.
function lineExits(s, cx, cy, th, m) {
  const dx = Math.cos(th);
  const dy = Math.sin(th);
  const hits = [];
  if (dx) hits.push((-m - cx) / dx, (s.w + m - cx) / dx);
  if (dy) hits.push((-m - cy) / dy, (s.h + m - cy) / dy);
  const fwd = Math.min(...hits.filter((v) => v > 0));
  const back = Math.max(...hits.filter((v) => v < 0));
  return [
    { x: cx + dx * back, y: cy + dy * back },
    { x: cx + dx * fwd, y: cy + dy * fwd },
  ];
}

// Quadratic arc from edge to edge whose midpoint is (cx, cy), bowed to one side.
function satPath(s, pass, cx, cy) {
  const nx = -Math.sin(pass.theta);
  const ny = Math.cos(pass.theta);
  const mx = cx + nx * pass.miss;
  const my = cy + ny * pass.miss;
  const [E, X] = lineExits(s, mx, my, pass.theta, 40);
  const p0 = { x: E.x + nx * pass.bow, y: E.y + ny * pass.bow };
  const p2 = { x: X.x + nx * pass.bow, y: X.y + ny * pass.bow };
  const p1 = { x: 2 * mx - (p0.x + p2.x) / 2, y: 2 * my - (p0.y + p2.y) / 2 };
  return { p0, p1, p2 };
}

const qAt = ({ p0, p1, p2 }, t) => {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
};

function newPass(through) {
  return {
    t: 0,
    age: 0,
    theta: rand(-0.7, 0.7) + (Math.random() < 0.5 ? 0 : Math.PI),
    bow: rand(40, 120) * (Math.random() < 0.5 ? -1 : 1),
    miss: through ? 0 : rand(60, 200) * (Math.random() < 0.5 ? -1 : 1),
    speed: rand(130, 260),
    id: `SAT-${String((1 + Math.random() * 98) | 0).padStart(2, "0")}`,
    alt: Math.round(rand(420, 780)),
  };
}

function drawSatellites(ctx, s, dt, time) {
  const C = s.net;
  if (!s.sat) s.sat = { passes: [], wait: 0.4, count: 0, pings: [], train: null, trainWait: rand(10, 18) };
  const st = s.sat;
  const max = s.w < 768 ? 2 : 3;

  st.wait -= dt;
  if (C.ta > 0 && st.wait <= 0 && st.passes.length < max) {
    // every other pass runs straight through the cursor; the rest pass nearby
    st.passes.push(newPass(st.count++ % 2 === 0));
    st.wait = rand(0.9, 2.2);
  }
  if (!st.passes.length && !st.train && !st.pings.length) {
    st.trainWait -= dt;
    if (st.trainWait <= 0) st.train = newTrain(s);
    if (!st.train) return;
  }

  ctx.lineWidth = 1;
  let best = null;
  for (const pass of st.passes) {
    const path = satPath(s, pass, C.x, C.y);
    const len = Math.hypot(path.p2.x - path.p0.x, path.p2.y - path.p0.y) * 1.05;
    pass.t += (pass.speed * dt) / len;
    pass.age += dt;
    pass.path = path;
    pass.fade = Math.max(0, Math.min(1, pass.t * 10, (1 - pass.t) * 10));
    pass.pos = qAt(path, Math.min(1, pass.t));
    const d = Math.hypot(pass.pos.x - C.x, pass.pos.y - C.y);
    pass.dist = d;
    if (C.ta > 0 && d < SAT_LINK && (!best || d < best.dist)) best = pass;
  }
  st.passes = st.passes.filter((p) => p.t < 1);
  drawTrain(ctx, s, st, dt, time);

  for (const pass of st.passes) {
    const { path, t, fade } = pass;
    const trace = (from, to) => {
      if (to <= from) return;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const q = qAt(path, from + ((to - from) * i) / 40);
        if (i) ctx.lineTo(q.x, q.y);
        else ctx.moveTo(q.x, q.y);
      }
      ctx.stroke();
    };
    // predicted track draws itself in ahead of the satellite
    const ahead = Math.min(1, t + pass.age * 0.8);
    ctx.strokeStyle = `rgba(40,80,140,${0.35 * fade})`;
    ctx.setLineDash([4, 6]);
    ctx.lineDashOffset = -time * 14;
    trace(t, ahead);
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(40,80,140,${0.16 * fade})`;
    trace(Math.max(0, t - 0.5), t);
  }

  // downlink beam from the nearest satellite, with packets streaming to the cursor
  if (best) {
    const sig = 1 - best.dist / SAT_LINK;
    const P = best.pos;
    ctx.strokeStyle = `rgba(30,100,190,${0.45 * sig * best.fade})`;
    ctx.beginPath();
    ctx.moveTo(P.x, P.y);
    ctx.lineTo(C.x, C.y);
    ctx.stroke();
    ctx.fillStyle = `rgba(30,100,190,${0.8 * sig * best.fade})`;
    for (let i = 0; i < 4; i++) {
      const f = (time * 1.6 + i / 4) % 1;
      ctx.beginPath();
      ctx.arc(P.x + (C.x - P.x) * f, P.y + (C.y - P.y) * f, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const pass of st.passes) {
    const { path, t, fade, pos: P } = pass;
    const A = qAt(path, Math.min(1, t + 0.01));
    const dir = Math.atan2(A.y - P.y, A.x - P.x);
    const near = pass === best ? Math.max(0, 1 - pass.dist / 90) : 0;

    // sunlit glint, flaring at closest approach to the cursor
    const flare = 0.3 + 0.7 * near;
    const gr = 6 + 22 * near;
    const glow = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, gr);
    glow.addColorStop(0, `rgba(255,255,250,${0.9 * flare * fade})`);
    glow.addColorStop(0.3, `rgba(255,245,220,${0.45 * flare * fade})`);
    glow.addColorStop(1, "rgba(255,245,220,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(P.x - gr, P.y - gr, gr * 2, gr * 2);

    ctx.save();
    ctx.translate(P.x, P.y);
    ctx.rotate(dir);
    ctx.globalAlpha = 0.75 * fade;
    ctx.fillStyle = "rgb(45,60,90)";
    ctx.fillRect(-2.5, -2.5, 5, 5);
    ctx.fillStyle = "rgb(55,85,140)";
    ctx.fillRect(-1.6, -12, 3.2, 8);
    ctx.fillRect(-1.6, 4, 3.2, 8);
    ctx.strokeStyle = "rgb(45,60,90)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 4);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }

  // lock-on HUD with live telemetry for the linked satellite
  if (best) {
    const sig = 1 - best.dist / SAT_LINK;
    const a = Math.min(1, sig * 2.5) * best.fade;
    const lock = best.dist < 70;
    const cx = C.x;
    const cy = C.y;
    const r = lock ? 13 + 2 * Math.sin(time * 10) : 16;
    ctx.strokeStyle = `rgba(30,90,170,${0.75 * a})`;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // rotating outer segments
    ctx.strokeStyle = `rgba(30,90,170,${0.4 * a})`;
    for (let i = 0; i < 3; i++) {
      const s0 = time * 1.8 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 9, s0, s0 + 1.1);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(30,90,170,${0.75 * a})`;
    ctx.beginPath();
    for (const [ux, uy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      ctx.moveTo(cx + ux * (r + 3), cy + uy * (r + 3));
      ctx.lineTo(cx + ux * (r + (lock ? 8 : 13)), cy + uy * (r + (lock ? 8 : 13)));
    }
    ctx.stroke();

    const ground = best.dist * KM_PER_PX;
    const range = Math.round(Math.hypot(best.alt, ground));
    const el = Math.round((Math.atan2(best.alt, ground) * 180) / Math.PI);

    // put the readout off to the side of the track (perpendicular to it), not along it
    ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textBaseline = "top";
    const tl = Math.hypot(cx - best.pos.x, cy - best.pos.y) || 1;
    let nx = -(cy - best.pos.y) / tl;
    let ny = (cx - best.pos.x) / tl;
    if (ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    const ax = cx + nx * (r + 26);
    const ay = cy + ny * (r + 26);
    const W = 92;
    let lx = nx >= 0 ? ax : ax - W;
    lx = Math.min(Math.max(lx, 6), s.w - W - 6);
    const ly = Math.min(ay - 8, s.h - 46);
    ctx.fillStyle = `rgba(20,60,120,${0.9 * a})`;
    ctx.fillText(`${best.id}  ${lock ? "LOCK" : "TRACK"}`, lx, ly);
    ctx.fillStyle = `rgba(40,55,80,${0.8 * a})`;
    ctx.fillText(`RNG ${range} km`, lx, ly + 13);
    ctx.fillText(`EL ${String(el).padStart(2, "0")}°`, lx, ly + 26);
    // signal bars
    const bars = Math.ceil(sig * 5);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `rgba(30,90,170,${(i < bars ? 0.85 : 0.2) * a})`;
      const bh = 3 + i * 2;
      ctx.fillRect(lx + 62 + i * 5, ly + 36 - bh, 3, bh);
    }
  }

  drawPings(ctx, st, best, dt, time);
}

// Click-to-ping: a radar pulse from the cursor; if a satellite is linked, a pulse runs up the
// beam and the satellite answers with an ACK showing the real light round-trip time.
const C_KM_S = 299792;
function drawPings(ctx, st, best, dt, time) {
  for (const pg of st.pings) {
    pg.age += dt;
    if (pg.target === undefined) {
      pg.target = best || null;
      if (!pg.target) st.wait = Math.min(st.wait, 0.2); // nothing linked: call the next pass in
    }
    const k = pg.age / 0.9;
    for (const lag of [0, 0.18]) {
      const q = (pg.age - lag) / 0.9;
      if (q <= 0 || q >= 1) continue;
      ctx.strokeStyle = `rgba(30,100,190,${0.55 * (1 - q)})`;
      ctx.lineWidth = 1.5 * (1 - q) + 0.5;
      ctx.beginPath();
      ctx.arc(pg.x, pg.y, 8 + q * 120, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    const sat = pg.target;
    if (sat && sat.pos && sat.t < 1) {
      const f = Math.min(1, pg.age / 0.35); // uplink pulse travelling up the beam
      if (f < 1) {
        const px = pg.x + (sat.pos.x - pg.x) * f;
        const py = pg.y + (sat.pos.y - pg.y) * f;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 8);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.4, "rgba(80,150,240,0.7)");
        g.addColorStop(1, "rgba(80,150,240,0)");
        ctx.fillStyle = g;
        ctx.fillRect(px - 8, py - 8, 16, 16);
      } else if (!pg.acked) {
        pg.acked = true;
        const range = Math.hypot(sat.alt, sat.dist * KM_PER_PX);
        sat.ack = { age: 0, ms: ((2 * range) / C_KM_S) * 1000 };
      }
    } else if (!sat && k < 1) {
      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.textBaseline = "top";
      ctx.fillStyle = `rgba(40,55,80,${0.8 * (1 - k)})`;
      ctx.fillText(`SEARCHING${".".repeat(1 + (((time * 4) | 0) % 3))}`, pg.x + 14, pg.y + 14);
    }
  }
  st.pings = st.pings.filter((pg) => pg.age < 1.6);

  // satellite answers: a bright flash and the round-trip time
  for (const sat of st.passes) {
    if (!sat.ack) continue;
    sat.ack.age += dt;
    const a = Math.max(0, 1 - sat.ack.age / 1.8);
    if (a <= 0) {
      sat.ack = null;
      continue;
    }
    const P = sat.pos;
    const fl = Math.max(0, 1 - sat.ack.age / 0.45);
    if (fl > 0) {
      const r = 10 + 30 * fl;
      const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, r);
      g.addColorStop(0, `rgba(255,255,255,${0.95 * fl})`);
      g.addColorStop(0.35, `rgba(160,200,255,${0.6 * fl})`);
      g.addColorStop(1, "rgba(160,200,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(P.x - r, P.y - r, r * 2, r * 2);
    }
    ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = `rgba(20,60,120,${0.9 * a})`;
    ctx.fillText(`ACK ${sat.ack.ms.toFixed(1)} ms`, P.x + 12, P.y - 10 - sat.ack.age * 8);
  }
}

// Constellation train: a rare single-file line of freshly launched satellites crossing the sky.
const TRAIN_GAP = 0.022; // spacing along the track, as a fraction of it
function newTrain(s) {
  const n = s.w < 768 ? 6 : 9;
  const pass = {
    theta: rand(-0.5, 0.5) + (Math.random() < 0.5 ? 0 : Math.PI),
    bow: rand(60, 140) * (Math.random() < 0.5 ? -1 : 1),
    miss: 0,
  };
  const path = satPath(s, pass, s.w * rand(0.3, 0.7), s.h * rand(0.18, 0.45));
  const len = Math.hypot(path.p2.x - path.p0.x, path.p2.y - path.p0.y) * 1.05;
  return { path, n, t: 0, speed: rand(90, 120) / len, age: 0, batch: (10 + Math.random() * 89) | 0 };
}

function drawTrain(ctx, s, st, dt, time) {
  if (!st.train) {
    st.trainWait -= dt;
    if (st.trainWait <= 0) st.train = newTrain(s);
    return;
  }
  const tr = st.train;
  tr.t += tr.speed * dt;
  tr.age += dt;
  const end = 1 + TRAIN_GAP * (tr.n - 1);
  if (tr.t > end) {
    st.train = null;
    st.trainWait = rand(30, 60);
    return;
  }

  // faint track
  ctx.strokeStyle = "rgba(40,80,140,0.12)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 7]);
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const q = qAt(tr.path, i / 40);
    if (i) ctx.lineTo(q.x, q.y);
    else ctx.moveTo(q.x, q.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // string of pearls: each a small sunlit point, twinkling slightly out of step
  let lead = null;
  for (let i = 0; i < tr.n; i++) {
    const ti = tr.t - i * TRAIN_GAP;
    if (ti <= 0 || ti >= 1) continue;
    const P = qAt(tr.path, ti);
    if (!lead) lead = P;
    const edge = Math.min(1, ti * 12, (1 - ti) * 12);
    const tw = 0.75 + 0.25 * Math.sin(time * 3 + i * 1.3);
    const r = 5;
    const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, r);
    g.addColorStop(0, `rgba(255,255,250,${0.95 * tw * edge})`);
    g.addColorStop(0.35, `rgba(255,248,225,${0.5 * tw * edge})`);
    g.addColorStop(1, "rgba(255,248,225,0)");
    ctx.fillStyle = g;
    ctx.fillRect(P.x - r, P.y - r, r * 2, r * 2);
    ctx.fillStyle = `rgba(45,60,90,${0.7 * edge})`;
    ctx.fillRect(P.x - 1, P.y - 1, 2, 2);
  }

  // label rides along with the lead for the first few seconds
  if (lead && tr.age < 7) {
    const a = Math.min(1, tr.age * 2, (7 - tr.age) / 1.5);
    ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = `rgba(20,60,120,${0.8 * a})`;
    ctx.fillText(`BATCH ${tr.batch} · ${tr.n} SATS`, lead.x + 10, lead.y - 8);
  }
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
      // Cursor net: position and strength (0..1) eased toward their targets.
      net: { x: 0, y: 0, a: 0, tx: 0, ty: 0, ta: 0 },
      netNodes: null,
      sat: null,
    };
    let raf = 0;
    let last = performance.now();

    const isLight = () => root.classList.contains("light");

    const skyParts = [
      () => s.skyBase || (s.skyBase = makeSkyBase(s.w, s.h, s.dpr)),
      () => s.planets || (s.planets = makePlanets(s.w, s.h)),
      () => s.clouds || (s.clouds = makeCloudBands(s.w, s.h)),
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
      const animate = !motionQuery.matches;
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      if (isLight()) {
        ensureSky();
        drawSky(ctx, s, window.scrollY, dt, animate);
      } else {
        if (!s.nebula) s.nebula = makeNebula(s.w, s.h, s.dpr);
        if (!s.spacePlanets) s.spacePlanets = makeSpacePlanets(s.w, s.h);
        drawSpace(ctx, s, now / 1000, window.scrollY, dt, animate);
      }
      const N = s.net;
      if (animate) {
        const kPos = 1 - Math.exp(-dt * 6);
        const kFade = 1 - Math.exp(-dt * 3);
        N.x += (N.tx - N.x) * kPos;
        N.y += (N.ty - N.y) * kPos;
        N.a += (N.ta - N.a) * kFade;
        if (isLight()) drawSatellites(ctx, s, dt, now / 1000);
        else if (N.a > 0.01) drawNet(ctx, s, dt);
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
        s.netNodes = null;
        s.sat = null;
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

    const onPointerMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const N = s.net;
      if (N.a < 0.01) {
        // Appear at the cursor instead of sliding in from the last spot.
        N.x = e.clientX;
        N.y = e.clientY;
      }
      N.tx = e.clientX;
      N.ty = e.clientY;
      N.ta = 1;
    };
    const onPointerDown = (e) => {
      if (e.pointerType !== "mouse" || !isLight() || motionQuery.matches || !s.sat) return;
      // clicks on real controls are for the page, not the sky
      if (e.target.closest?.("a, button, input, textarea, select, label, [role='button']")) return;
      s.sat.pings.push({ x: e.clientX, y: e.clientY, age: 0, target: undefined, acked: false });
    };
    const onPointerLeave = () => {
      s.net.ta = 0;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    motionQuery.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(raf);
      cancelIdle(idleId);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
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
