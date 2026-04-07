const canvas = document.getElementById('infinityCanvas');
const ctx    = canvas.getContext('2d');
const textTop    = document.getElementById('textTop');
const textBottom = document.getElementById('textBottom');

// Responsive
const BASE_W = 700;
const BASE_H = 360;
let W, H, CX, CY, A, pathPoints;

function buildPath() {
  const maxW  = Math.min(window.innerWidth - 32, BASE_W);
  const scale = maxW / BASE_W;
  W  = Math.round(BASE_W * scale);
  H  = Math.round(BASE_H * scale);
  CX = W / 2;
  CY = H / 2;
  A  = 155 * scale;

  canvas.width  = W;
  canvas.height = H;

  pathPoints = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = (i / STEPS) * Math.PI * 2;
    pathPoints.push(lemniscate(t));
  }
}

const STEPS = 2000;

function lemniscate(t) {
  const sin_t = Math.sin(t);
  const cos_t = Math.cos(t);
  const denom = 1 + sin_t * sin_t;
  return {
    x: CX + A * cos_t / denom,
    y: CY + A * sin_t * cos_t / denom,
  };
}

// Desvanecer
let progress     = 0;
let currentSpeed = 0;
let globalAlpha  = 0; //no debe de verse, 1 se ve 0 no

const SPEED_MIN   = 0.0004;
const SPEED_MAX   = 0.028;
const FADEIN_TIME = 5000;
const ACCEL_TIME  = 4000;

let startTime = null;

const SNAKE_LEN = 0.85;

// Paleta 
//Para cambiar los colore deben de ser hexadesimal y se tiene que hacer la conversión de quitar # por 0x
const palette = [
  { t: 0.00, r: 0x26, g: 0x46, b: 0x53 }, // #264653
  { t: 0.11, r: 0x28, g: 0x72, b: 0x71 }, // #287271
  { t: 0.22, r: 0x2a, g: 0x9d, b: 0x8f }, // #2a9d8f
  { t: 0.33, r: 0x8a, g: 0xb1, b: 0x7d }, // #8ab17d
  { t: 0.44, r: 0xe9, g: 0xc4, b: 0x6a }, // #e9c46a
  { t: 0.55, r: 0xef, g: 0xb3, b: 0x66 }, // #efb366
  { t: 0.66, r: 0xf4, g: 0xa2, b: 0x61 }, // #f4a261
  { t: 0.77, r: 0xee, g: 0x89, b: 0x59 }, // #ee8959
  { t: 0.88, r: 0xe7, g: 0x6f, b: 0x51 }, // #e76f51
  { t: 1.00, r: 0xe9, g: 0x7c, b: 0x61 }, // #e97c61
];

function getColor(frac) {
    let s0 = palette[0], s1 = palette[palette.length - 1];
    for (let i = 0; i < palette.length - 1; i++) {
    if (frac >= palette[i].t && frac <= palette[i + 1].t) {
        s0 = palette[i]; s1 = palette[i + 1];
        break;
    }
    }
    const localT = s1.t === s0.t ? 0 : (frac - s0.t) / (s1.t - s0.t);
    return {
    r: Math.round(lerp(s0.r, s1.r, localT)),
    g: Math.round(lerp(s0.g, s1.g, localT)),
    b: Math.round(lerp(s0.b, s1.b, localT)),
    };
}

function lerp(a, b, t) { return a + (b - a) * t; }

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function drawBase() {
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i++) {
    const p = pathPoints[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else         ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(255,255,255,${0.04 * globalAlpha})`;
    ctx.lineWidth   = 18 * (W / BASE_W);
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.stroke();
}

function drawSnake() {
    const scale      = W / BASE_W;
    const snakeSteps = Math.floor(SNAKE_LEN * STEPS);
    const headIdx    = Math.floor(progress * STEPS);

    for (let i = 0; i < snakeSteps - 1; i++) {
    const frac = i / snakeSteps;
    const idx0 = (headIdx - snakeSteps + i + STEPS * 4) % STEPS;
    const idx1 = (idx0 + 1) % STEPS;

    const p0 = pathPoints[idx0];
    const p1 = pathPoints[idx1];

    const { r, g, b } = getColor(frac);
    const lineW = lerp(1.5, 22, Math.pow(frac, 0.6)) * scale;
    const alpha = (frac < 0.07 ? frac / 0.07 : 1.0) * globalAlpha;


    //ctx lo que es dibujar la linea del infinito y hacer que los colores lo siga
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`; //mejor usar rgb en vez de hexadecimal 
    ctx.lineWidth   = lineW;
    ctx.lineCap     = 'round';
    ctx.stroke();
    }
}

function drawHead(x, y) {
    const scale = W / BASE_W;
    const r36   = 36 * scale;
    const r5    = 5  * scale;

    const g1 = ctx.createRadialGradient(x, y, 0, x, y, r36);
    g1.addColorStop(0,   `rgba(231, 111, 81, ${0.65 * globalAlpha})`);
    g1.addColorStop(0.5, `rgba(244, 162, 97, ${0.25 * globalAlpha})`);
    g1.addColorStop(1,   'rgba(233, 196, 106, 0)');
    ctx.beginPath();
    ctx.arc(x, y, r36, 0, Math.PI * 2);
    ctx.fillStyle = g1;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${globalAlpha})`;
    ctx.fill();
}

function frame(timestamp) {
    ctx.clearRect(0, 0, W, H);

    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;

    globalAlpha = Math.min(1, elapsed / FADEIN_TIME);
    textTop.style.opacity    = globalAlpha;
    textBottom.style.opacity = globalAlpha;

    const accelProgress = Math.min(1, elapsed / ACCEL_TIME);
    currentSpeed = lerp(SPEED_MIN, SPEED_MAX, easeInOut(accelProgress));

    drawBase();
    drawSnake();

    const headIdx = Math.floor(progress * STEPS);
    const head    = pathPoints[headIdx];
    drawHead(head.x, head.y);

    progress = (progress + currentSpeed) % 1;

    requestAnimationFrame(frame);
}

// Tamaño segun espacio
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => buildPath(), 150);
});

// Ir a index
setTimeout(() => {
    window.location.href = '/html/index.html';
}, 10000); // 30 segundos = 30000 milisegundos

buildPath();
requestAnimationFrame(frame);