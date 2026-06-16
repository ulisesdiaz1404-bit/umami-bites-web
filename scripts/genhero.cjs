// Genera el video del hero: montaje cinematográfico (Ken Burns + crossfade).
// Cada foto del catering hace un zoom/pan lento y elegante y se funde con la
// siguiente. Render por frames con sharp en SUPERSAMPLE 2x (sub-pixel, sin
// vibración) + encode ffmpeg. Loop seamless. Uso: pnpm gen:hero
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");
const FF = require("ffmpeg-static");

const PUB = path.join(__dirname, "..", "public");
const PH = path.join(PUB, "photos");

const W = 1920, H = 1080, FPS = 30;
const SS = 2;                 // supersample (render a 2x para suavizar)
const RW = W * SS, RH = H * SS;

// Fotos cinematográficas del catering (spreads elegantes, variados)
const SHOTS = [
  { img: "p18.jpg", dir: [1, 0.4] },        // picada / tabla
  { img: "p31.jpg", dir: [-0.6, 0.5] },     // charcutería
  { img: "p11.jpg", dir: [0.5, -0.4] },     // finger food
  { img: "p30.jpg", dir: [-1, 0.3] },       // picada con uvas
  { img: "p15.jpg", dir: [0.4, 0.6] },      // mesa montada
  { img: "mesa-dulce-spread.jpg", dir: [-0.5, -0.5] }, // mesa dulce
  { img: "p33.jpg", dir: [0.7, 0.4] },      // postre
];
const N = SHOTS.length;

const S = 78;                 // frames de avance por toma (~2.6s)
const T = 26;                 // frames de crossfade (~0.87s)
const TOTAL = N * S;          // loop seamless
const ZAMP = 0.16;            // amplitud de zoom (16%)
const PAN = 0.06;             // amplitud de paneo
const MAXP = (S + T) / S;     // progreso máximo de una toma viva

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

async function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ubcine-"));

  // Cada foto a cover en RESOLUCIÓN SUPERSAMPLE, con un grado de zoom extra de base
  // para tener margen de paneo. Viñeta cinematográfica horneada una sola vez.
  const vignette = await sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><radialGradient id="v" cx="50%" cy="48%" r="72%">
        <stop offset="0%" stop-color="#000" stop-opacity="0"/>
        <stop offset="72%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
      </radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#v)"/>
    </svg>`)).png().toBuffer();

  // Cover a (1+ZAMP+PAN) para tener recorte interno disponible
  const over = 1 + ZAMP + PAN;
  const covers = [];
  for (const s of SHOTS) {
    covers.push(await sharp(path.join(PH, s.img))
      .resize(Math.round(RW * over), Math.round(RH * over), { fit: "cover" })
      .toBuffer());
  }
  const coverW = Math.round(RW * over), coverH = Math.round(RH * over);

  // Renderiza una toma a progreso p (0..MAXP) -> buffer WxH (con viñeta)
  async function renderShot(i, p) {
    const e = easeInOut(Math.min(1, p / MAXP));
    const z = 1 + ZAMP * e;                       // zoom in lento
    // ventana a recortar dentro del cover supersample
    const rw = Math.round(RW * z), rh = Math.round(RH * z);
    const [dx, dy] = SHOTS[i].dir;
    const panX = dx * PAN * RW * (e - 0.5);
    const panY = dy * PAN * RH * (e - 0.5);
    let left = Math.round((coverW - rw) / 2 + panX);
    let top = Math.round((coverH - rh) / 2 + panY);
    left = Math.max(0, Math.min(coverW - rw, left));
    top = Math.max(0, Math.min(coverH - rh, top));
    return sharp(covers[i])
      .extract({ left, top, width: rw, height: rh })
      .resize(W, H)                               // downscale supersample -> suave
      .composite([{ input: vignette, blend: "over" }])
      .toBuffer();
  }

  for (let f = 0; f < TOTAL; f++) {
    const i = Math.floor(f / S);
    const local = f - i * S;                      // 0..S-1

    // capa base = toma actual i
    let frame = await renderShot(i % N, local / S);

    // crossfade al inicio: toma i entra sobre la saliente (i-1) que sigue su zoom
    if (local < T) {
      const prevIdx = (i - 1 + N) % N;
      const prevProg = (S + local) / S;           // continúa el zoom de la saliente
      const prevBuf = await renderShot(prevIdx, prevProg);
      const a = easeInOut(local / T);             // alpha de la entrante
      // base = saliente; encima la entrante con alpha
      const incoming = await sharp(frame).ensureAlpha(a).png().toBuffer();
      frame = await sharp(prevBuf).composite([{ input: incoming, blend: "over" }]).toBuffer();
    }

    const jpg = await sharp(frame).jpeg({ quality: 90 }).toBuffer();
    fs.writeFileSync(path.join(tmp, `f${String(f).padStart(4, "0")}.jpg`), jpg);
    if (f % 30 === 0) process.stdout.write(`\r  frame ${f}/${TOTAL}`);
  }
  process.stdout.write(`\r  frames listos (${TOTAL})        \n`);

  const outMp4 = path.join(PUB, "hero.mp4");
  execFileSync(FF, ["-y", "-framerate", String(FPS), "-i", path.join(tmp, "f%04d.jpg"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-crf", "21", "-preset", "medium",
    "-movflags", "+faststart", outMp4], { stdio: "ignore" });
  fs.copyFileSync(path.join(tmp, "f0000.jpg"), path.join(PUB, "hero-poster.jpg"));

  const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + "KB";
  console.log("hero.mp4", kb(outMp4), "| poster", kb(path.join(PUB, "hero-poster.jpg")));
  fs.rmSync(tmp, { recursive: true, force: true });
}

main().catch((e) => { console.error(e); process.exit(1); });
