// Light-mode cursor effect: a sunbeam that grows from the sky's sun to the cursor.
// Used by CosmicBackground.jsx: drawSunbeam(ctx, s, dt, time, sunPos).
// It expects `s.net` (the eased cursor state) and stores its own state on `s.sunbeam`.

// Light mode: sunlight pours out of the sky's sun (top-left) and slowly reaches out to the cursor,
// brightening everything between the sun and that point; it pulls back when the cursor leaves.
const BEAM_SPREAD = 0.42; // sprite half-height as a fraction of beam length
let beamSprite = null;

// A soft cone of light: brightness falls off smoothly across the beam (no hard edges), with gentle,
// uneven shafts in it, fading out towards the far end. Built once and stretched to fit.
export function getBeamSprite() {
  if (beamSprite) return beamSprite;
  const W = 600;
  const H = 300;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const img = g.createImageData(W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const v = ((y + 0.5) / H) * 2 - 1;
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W;
      const ang = Math.abs((v * BEAM_SPREAD) / (u + 0.015)); // angle off the beam's axis
      // even across the beam, softening only at its edges
      const e = Math.min(1, Math.max(0, (ang - 0.14) / 0.15));
      const across = 1 - e * e * (3 - 2 * e);
      // even along its length, fading softly only as it reaches the cursor
      const q = Math.min(1, Math.max(0, (1 - u) / 0.15));
      const along = Math.min(1, u / 0.04) * q * q * (3 - 2 * q);
      const a = across * along;
      const i = (y * W + x) * 4;
      d[i] = 255;
      d[i + 1] = 245;
      d[i + 2] = 218;
      d[i + 3] = Math.max(0, Math.min(1, a)) * 255;
    }
  }
  g.putImageData(img, 0, 0);
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const og = out.getContext("2d");
  og.filter = "blur(4px)";
  og.drawImage(c, 0, 0);
  beamSprite = out;
  return out;
}

export function drawSunbeam(ctx, s, dt, time, sunPos) {
  const C = s.net;
  if (!s.sunbeam) s.sunbeam = { len: 0, ang: Math.PI / 4 };
  const B = s.sunbeam;
  // start exactly at the sun drawn in the sky, so the light never comes from beyond it
  const sp = sunPos(s.w, s.h);
  const O = { x: sp.x * s.w, y: sp.y * s.h };
  const dx = C.tx - O.x;
  const dy = C.ty - O.y;
  const target = C.ta > 0 ? Math.hypot(dx, dy) : 0;
  // slow reach: length and direction ease towards the cursor
  B.len += (target - B.len) * (1 - Math.exp(-dt * (target > B.len ? 0.42 : 0.35)));
  if (C.ta > 0) {
    const a = Math.atan2(dy, dx);
    B.ang += Math.atan2(Math.sin(a - B.ang), Math.cos(a - B.ang)) * (1 - Math.exp(-dt * 0.9));
  }
  const len = B.len;
  if (len < 4) return;
  const strength = Math.min(1, len / 200);

  ctx.globalCompositeOperation = "screen";

  // warm wash brightening the screen from the corner out to the cursor
  const wash = ctx.createRadialGradient(O.x, O.y, 0, O.x, O.y, len * 1.08);
  wash.addColorStop(0, `rgba(255,242,212,${0.22 * strength})`);
  wash.addColorStop(0.82, `rgba(255,242,212,${0.2 * strength})`);
  wash.addColorStop(1, "rgba(255,242,212,0)");
  ctx.fillStyle = wash;
  ctx.fillRect(Math.max(0, O.x - len * 1.1), Math.max(0, O.y - len * 1.1), len * 2.2, len * 2.2);

  // the beam: one smooth, even, soft-edged sprite
  const beam = getBeamSprite();
  ctx.save();
  ctx.translate(O.x, O.y);
  ctx.rotate(B.ang);
  ctx.globalAlpha = (0.11 + 0.008 * Math.sin(time * 0.4)) * strength; // the faintest breathing
  ctx.drawImage(beam, 0, -len * BEAM_SPREAD, len, len * BEAM_SPREAD * 2);
  ctx.restore();
  ctx.globalAlpha = 1;

  ctx.globalCompositeOperation = "source-over";
}
