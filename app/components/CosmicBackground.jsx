"use client";

import { useEffect, useRef } from "react";
import { drawSunbeam } from "./effects/sunbeam";

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

    // sun: broad glow, bright core and star rays
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

// Dark mode: a particle network. Points drift and bounce around the whole screen, fading with
// distance from the cursor; within a square around the cursor, nearby points link up with fine
// blue lines, and the cursor itself is a point in the net.
const NET_BLUE = "81,162,233";
const NET_RED = "255,77,90";
const NET_OPACITY = 0.65; // overall strength of the net lines

function netConfig(w) {
  if (w > 1600) return { count: 600, link: 70, reach: 250 };
  if (w > 1300) return { count: 575, link: 60, reach: 235 };
  if (w > 1100) return { count: 500, link: 55, reach: 210 };
  return { count: 300, link: 50, reach: 185 };
}

function makeNetNodes(w, h) {
  return Array.from({ length: netConfig(w).count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 30, // px/s
    vy: (Math.random() - 0.5) * 30,
    r: Math.random() * 1.5,
    col: Math.random() < 0.2 ? NET_RED : NET_BLUE,
  }));
}

function drawNet(ctx, s, dt) {
  const { w, h, net: C } = s;
  if (!s.netNodes) s.netNodes = makeNetNodes(w, h);
  const nodes = s.netNodes;
  const { link, reach } = netConfig(w);
  // until the mouse has moved, the points fade out from the screen centre
  const mx = C.seen ? C.tx : w / 2;
  const my = C.seen ? C.ty : h / 2;

  for (const n of nodes) {
    n.x += n.vx * dt;
    n.y += n.vy * dt;
    if (n.y < 0 || n.y > h) n.vy = -n.vy;
    else if (n.x < 0 || n.x > w) n.vx = -n.vx;
  }

  // lines: from points inside the square around the cursor to any point within `link`
  if (C.a > 0.01) {
    const pts = [{ x: mx, y: my }, ...nodes]; // the cursor is a point in the net
    ctx.lineWidth = 0.3;
    for (const a of pts) {
      if (Math.abs(a.x - mx) >= reach || Math.abs(a.y - my) >= reach) continue;
      const fade = Math.max(0, Math.hypot(a.x - mx, a.y - my) / reach - 0.3);
      const alpha = (1 - fade) * C.a * NET_OPACITY;
      if (alpha <= 0) continue;
      ctx.strokeStyle = `rgba(${NET_BLUE},${alpha})`;
      ctx.beginPath();
      for (const b of pts) {
        if (b === a || Math.abs(a.x - b.x) >= link || Math.abs(a.y - b.y) >= link) continue;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();
    }
  }

  // points fade out with distance from the cursor, so they only gather around the net
  const span = Math.max(reach * 2, w / 3.2);
  for (const n of nodes) {
    const a = 1 - Math.hypot(n.x - mx, n.y - my) / span;
    if (a <= 0 || n.r < 0.05) continue;
    ctx.fillStyle = `rgba(${n.col},${a})`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (C.a > 0.01) {
    ctx.fillStyle = `rgba(${NET_BLUE},${C.a})`;
    ctx.beginPath();
    ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Elements marked `data-fx-above` (the skill cards) sit above the cursor effects: the effects are
// clipped so they never draw inside those elements' rounded shapes.
function clipOutMarked(ctx, s, now) {
  if (!s.above || now - s.aboveAt > 1000) {
    s.above = [...document.querySelectorAll("[data-fx-above]")].map((el) => ({
      el,
      radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
    }));
    s.aboveAt = now;
  }
  ctx.beginPath();
  ctx.rect(0, 0, s.w, s.h);
  for (const { el, radius } of s.above) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.bottom < 0 || r.top > s.h || r.right < 0 || r.left > s.w) continue;
    ctx.roundRect(r.left, r.top, r.width, r.height, Math.min(radius, r.width / 2, r.height / 2));
  }
  ctx.clip("evenodd");
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
      sunbeam: null,
      above: null,
      aboveAt: 0,
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
        ctx.save();
        clipOutMarked(ctx, s, now);
        if (isLight()) drawSunbeam(ctx, s, dt, now / 1000, sunPos);
        else drawNet(ctx, s, dt);
        ctx.restore();
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
      N.seen = true;
    };
    const onPointerLeave = () => {
      s.net.ta = 0;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
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
