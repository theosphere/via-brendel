// Pixel-art dusk apartment-block facade — frontal (no perspective, no
// isometric shear): rows of windows, some lit warm, most dark, vertical
// accent-color bays, a dithered dusk sky.

// Portrait, mobile-first — same convention as night-walk (9:16, letterboxed
// on wider screens). A narrower, taller slice of the building (fewer
// columns, more floors) instead of the old wide landscape crop.
const W = 220;
const H = 390;

const canvas = document.getElementById('scene') as HTMLCanvasElement;
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

function fit() {
  // Contain, not cover: the whole building must always stay fully in
  // frame, never cropped at the edges — so this fits to whichever axis
  // is more constraining and letterboxes the other, exactly like
  // night-walk's fitStage. On phone-shaped (narrow/tall) screens that
  // means letterbox bars top and bottom rather than side crops.
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let w = vw;
  let h = w / (W / H);
  if (h > vh) {
    h = vh;
    w = h * (W / H);
  }
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}
window.addEventListener('resize', fit);
fit();

// --- Ordered (Bayer) dithering -------------------------------------------
// Classic pixel-art trick for faking a smooth gradient with only a
// handful of flat colors: instead of blending two colors into a new
// in-between color (which a limited palette can't represent), each pixel
// is drawn as EITHER color A or color B, chosen by comparing the desired
// blend amount against a fixed per-pixel threshold. The threshold pattern
// (this 4x4 matrix, tiled across the image) is what turns "some pixels
// are A, some are B" into a smooth-looking gradient instead of noise.
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
function ditherThreshold(x: number, y: number): number {
  return (BAYER4[y % 4][x % 4] + 0.5) / 16;
}
type RGB = [number, number, number];
function mixColor(a: RGB, b: RGB, x: number, y: number, t: number): RGB {
  return t > ditherThreshold(x, y) ? b : a;
}
function rgbStr([r, g, b]: RGB): string {
  return `rgb(${r},${g},${b})`;
}
// Plots a short line of 1x1 pixels from radius r0 to r1 at a given angle
// around (cx, cy) — used for the AC unit's fan blades. Manual pixel
// plotting (not ctx.lineTo/stroke) keeps it crisp/pixelated instead of
// anti-aliased.
function drawRadialLine(cx: number, cy: number, r0: number, r1: number, angle: number, color: RGB) {
  const steps = Math.ceil(Math.abs(r1 - r0)) + 1;
  ctx.fillStyle = rgbStr(color);
  for (let i = 0; i <= steps; i++) {
    const r = r0 + (r1 - r0) * (i / steps);
    ctx.fillRect(Math.round(cx + Math.cos(angle) * r), Math.round(cy + Math.sin(angle) * r), 1, 1);
  }
}

// --- Palette -----------------------------------------------------------
const SKY_TOP: RGB = [23, 22, 51];
const SKY_MID: RGB = [63, 48, 84];
const SKY_LOW: RGB = [176, 104, 87];
const ROOFLINE: RGB = [45, 41, 38];
const WALL: RGB = [141, 132, 119];
const WALL_SHADOW: RGB = [120, 111, 100];
const ACCENT: RGB = [117, 63, 58];
const ACCENT_SHADOW: RGB = [96, 48, 45];
const WINDOW_FRAME: RGB = [176, 166, 150];
const WINDOW_DARK: RGB = [26, 27, 38];
const WINDOW_LIT_WARM: RGB = [240, 175, 79];
const WINDOW_LIT_PALE: RGB = [245, 207, 133];
const WINDOW_LIT_TV: RGB = [123, 178, 191];
const AC_BODY: RGB = [206, 202, 192]; // real condenser units are white/cream, not dark
const AC_BODY_SHADOW: RGB = [178, 174, 165];
const AC_FAN_RING: RGB = [150, 146, 138];
const AC_FAN_BG: RGB = [68, 66, 61];
const AC_FAN_BLADE: RGB = [200, 196, 188];
const AC_VENT_LINE: RGB = [164, 160, 151];

// --- Music player: drawn INTO the scene, not an HTML overlay ---------------
// Everything here — cover, text, buttons — is rasterized as flat pixel
// blocks straight onto the canvas, using colors already in the palette
// above, so it reads as a row sitting in the sky rather than a UI element
// floating on top of the art.

// --- Hand-authored 4x5 pixel font -----------------------------------------
// Real fonts render with anti-aliasing; this draws every glyph as flat
// on/off blocks, one glyph cell = 4 wide x 5 tall, so there is nothing but
// crisp pixel-art edges anywhere the player draws text. (A 3-wide grid was
// tried first — too narrow to keep K/N/X apart at this scale.)
const FONT4X5: Record<string, string[]> = {
  A: ['.##.', '#..#', '####', '#..#', '#..#'],
  B: ['###.', '#..#', '###.', '#..#', '###.'],
  C: ['.###', '#...', '#...', '#...', '.###'],
  D: ['###.', '#..#', '#..#', '#..#', '###.'],
  E: ['####', '#...', '###.', '#...', '####'],
  F: ['####', '#...', '###.', '#...', '#...'],
  G: ['.###', '#...', '#.##', '#..#', '.###'],
  H: ['#..#', '#..#', '####', '#..#', '#..#'],
  I: ['.##.', '.##.', '.##.', '.##.', '.##.'],
  J: ['..##', '..#.', '..#.', '#.#.', '.##.'],
  K: ['#..#', '#.#.', '##..', '#.#.', '#..#'],
  L: ['#...', '#...', '#...', '#...', '####'],
  M: ['#..#', '####', '####', '#..#', '#..#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['.##.', '#..#', '#..#', '#..#', '.##.'],
  P: ['###.', '#..#', '###.', '#...', '#...'],
  Q: ['.##.', '#..#', '#..#', '.##.', '...#'],
  R: ['###.', '#..#', '###.', '#.#.', '#..#'],
  S: ['.###', '#...', '.##.', '...#', '###.'],
  T: ['####', '.##.', '.##.', '.##.', '.##.'],
  U: ['#..#', '#..#', '#..#', '#..#', '.##.'],
  V: ['#..#', '#..#', '#..#', '.##.', '.##.'],
  W: ['#..#', '#..#', '####', '####', '#..#'],
  X: ['#..#', '.##.', '.##.', '.##.', '#..#'],
  Y: ['#..#', '#..#', '.##.', '.##.', '.##.'],
  Z: ['####', '..#.', '.#..', '#...', '####'],
  '0': ['.##.', '#..#', '#..#', '#..#', '.##.'],
  '1': ['.#..', '##..', '.#..', '.#..', '####'],
  '2': ['###.', '...#', '.##.', '#...', '####'],
  '3': ['###.', '...#', '.##.', '...#', '###.'],
  '4': ['#..#', '#..#', '####', '...#', '...#'],
  '5': ['####', '#...', '###.', '...#', '###.'],
  '6': ['.###', '#...', '###.', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '.#..', '.#..'],
  '8': ['.##.', '#..#', '.##.', '#..#', '.##.'],
  '9': ['.##.', '#..#', '.###', '...#', '###.'],
  '.': ['....', '....', '....', '....', '.#..'],
  '/': ['...#', '..#.', '.#..', '#...', '....'],
  ' ': ['....', '....', '....', '....', '....'],
};
function drawPixelText(text: string, x: number, y: number, color: RGB) {
  ctx.fillStyle = rgbStr(color);
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const glyph = FONT4X5[ch] ?? FONT4X5[' '];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        if (glyph[row][col] === '#') ctx.fillRect(cx + col, y + row, 1, 1);
      }
    }
    cx += 5; // 4px glyph + 1px space
  }
}

// Right-pointing triangle scanned column by column (dir=-1 mirrors it to
// point left) — same manual-rasterization approach as everything else,
// so the play/skip icons have no anti-aliased edges either.
function drawTri(cx: number, cy: number, r: number, dir: 1 | -1, color: RGB) {
  ctx.fillStyle = rgbStr(color);
  for (let x = -r; x <= r; x++) {
    const h = dir === 1 ? r - x : r + x;
    if (h < 0) continue;
    ctx.fillRect(cx + x, cy - Math.floor(h / 2), 1, h + 1);
  }
}
function drawPauseIcon(cx: number, cy: number, r: number, color: RGB) {
  ctx.fillStyle = rgbStr(color);
  ctx.fillRect(cx - r, cy - r, 2, r * 2 + 1);
  ctx.fillRect(cx + r - 1, cy - r, 2, r * 2 + 1);
}
function drawSkipIcon(cx: number, cy: number, r: number, dir: 1 | -1, color: RGB) {
  if (dir === 1) {
    drawTri(cx - 1, cy, r, 1, color);
    ctx.fillStyle = rgbStr(color);
    ctx.fillRect(cx + r, cy - r, 1, r * 2 + 1);
  } else {
    ctx.fillStyle = rgbStr(color);
    ctx.fillRect(cx - r, cy - r, 1, r * 2 + 1);
    drawTri(cx + 1, cy, r, -1, color);
  }
}
// Small quarter-note glyph — the always-visible toggle when the row is
// hidden.
function drawNoteIcon(x: number, y: number, color: RGB) {
  ctx.fillStyle = rgbStr(color);
  ctx.fillRect(x + 4, y, 1, 8);
  ctx.fillRect(x + 4, y, 3, 1);
  ctx.fillRect(x + 6, y + 1, 1, 1);
  ctx.fillRect(x, y + 7, 4, 3);
}

interface Track {
  title: string;
  src: string;
}
const TRACKS: Track[] = [
  { title: 'SONATA K.310', src: `${import.meta.env.BASE_URL}audio/1.mp3` },
  { title: 'FANTASY K.396', src: `${import.meta.env.BASE_URL}audio/2.mp3` },
];

const player = document.getElementById('player') as HTMLAudioElement;
player.volume = 0.5;
let currentTrack = 0;
let isPlaying = false;
let panelVisible = false;

function loadTrack(i: number, autoplay: boolean) {
  currentTrack = (i + TRACKS.length) % TRACKS.length;
  player.src = TRACKS[currentTrack].src;
  if (autoplay) {
    player.play().catch(() => {
      isPlaying = false;
    });
  }
}
loadTrack(0, false);
player.addEventListener('playing', () => (isPlaying = true));
player.addEventListener('pause', () => (isPlaying = false));
player.addEventListener('ended', () => loadTrack(currentTrack + 1, true));

const cover = new Image();
cover.src = `${import.meta.env.BASE_URL}cover-pixel.png`;
let coverLoaded = false;
cover.addEventListener('load', () => (coverLoaded = true));

// --- Layout: one row, sitting in the sky's dark upper band ---------------
const ROW_Y = 5;
const ROW_H = 16;
const COVER_SIZE = 16;
const COVER_X = 4;
const TOGGLE_X = W - 15;
const TOGGLE_SIZE = 12;
const BTN_R = 4;
const nextX = TOGGLE_X - 14;
const playX = TOGGLE_X - 30;
const prevX = TOGGLE_X - 46;
const btnY = ROW_Y + ROW_H / 2;
const textX = COVER_X + COVER_SIZE + 5;

// Lighter, warm palette colors already used elsewhere in the piece — the
// player is meant to read as part of the scheme, not a separate overlay.
const UI_TEXT: RGB = WINDOW_LIT_PALE;
const UI_DIM: RGB = [150, 140, 156];
const UI_ICON: RGB = WINDOW_LIT_WARM;

function hitTest(px: number, py: number, x: number, y: number, w: number, h: number) {
  return px >= x && px < x + w && py >= y && py < y + h;
}

function drawMusicRow() {
  if (!panelVisible) {
    drawNoteIcon(TOGGLE_X, ROW_Y + 2, UI_DIM);
    return;
  }

  if (coverLoaded) {
    ctx.drawImage(cover, COVER_X, ROW_Y, COVER_SIZE, COVER_SIZE);
  }
  ctx.fillStyle = rgbStr(UI_DIM);
  ctx.fillRect(COVER_X, ROW_Y, COVER_SIZE, 1);
  ctx.fillRect(COVER_X, ROW_Y + COVER_SIZE - 1, COVER_SIZE, 1);
  ctx.fillRect(COVER_X, ROW_Y, 1, COVER_SIZE);
  ctx.fillRect(COVER_X + COVER_SIZE - 1, ROW_Y, 1, COVER_SIZE);

  drawPixelText('ALFRED BRENDEL', textX, ROW_Y + 1, UI_DIM);
  drawPixelText(TRACKS[currentTrack].title, textX, ROW_Y + 9, UI_TEXT);

  drawSkipIcon(prevX, btnY, BTN_R, -1, UI_ICON);
  if (isPlaying) {
    drawPauseIcon(playX, btnY, BTN_R, UI_ICON);
  } else {
    drawTri(playX - 1, btnY, BTN_R, 1, UI_ICON);
  }
  drawSkipIcon(nextX, btnY, BTN_R, 1, UI_ICON);

  drawNoteIcon(TOGGLE_X, ROW_Y + 2, UI_ICON);
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const px = ((e.clientX - rect.left) / rect.width) * W;
  const py = ((e.clientY - rect.top) / rect.height) * H;

  if (hitTest(px, py, TOGGLE_X - 3, ROW_Y - 3, TOGGLE_SIZE + 6, TOGGLE_SIZE + 6)) {
    panelVisible = !panelVisible;
    return;
  }
  if (!panelVisible) return;

  if (hitTest(px, py, prevX - BTN_R - 2, ROW_Y, 2 * BTN_R + 4, ROW_H)) {
    loadTrack(currentTrack - 1, true);
  } else if (hitTest(px, py, playX - BTN_R - 2, ROW_Y, 2 * BTN_R + 4, ROW_H)) {
    if (isPlaying) player.pause();
    else player.play().catch(() => {});
  } else if (hitTest(px, py, nextX - BTN_R - 2, ROW_Y, 2 * BTN_R + 4, ROW_H)) {
    loadTrack(currentTrack + 1, true);
  }
});

// --- Layout: flat and frontal — no shear, no perspective -----------------
const BUILDING_TOP = 60;
const BUILDING_BOTTOM = H; // the building runs all the way to the bottom edge — no ground/floor strip
const MARGIN_X = 6;
const COLS = 6;
const ROWS = 13; // one more row than before, to fill the extra height at roughly the same floor size
const cellW = (W - MARGIN_X * 2) / COLS;
const cellH = (BUILDING_BOTTOM - BUILDING_TOP) / ROWS;

// Every 4th column (offset by 1) is an accent-colored vertical bay,
// matching the reddish panel strips in the reference photo.
function isAccentCol(col: number): boolean {
  return col % 4 === 1;
}

interface WindowState {
  lit: boolean;
  hasAC: boolean;
  tv: boolean;
  warmVariant: boolean; // fixed per-window, so a lit window's color doesn't flicker every frame
  nextToggle: number; // time (seconds) at which this window may flip
  highlightCorner: number; // 0-3, which pane the glass-reflection glint sits in — varies per window
}
const windows: WindowState[][] = [];
for (let r = 0; r < ROWS; r++) {
  const row: WindowState[] = [];
  for (let c = 0; c < COLS; c++) {
    row.push({
      lit: Math.random() < 0.28,
      hasAC: Math.random() < 0.35 && r > 0,
      tv: Math.random() < 0.12,
      warmVariant: Math.random() < 0.5,
      nextToggle: Math.random() * 20,
      highlightCorner: Math.floor(Math.random() * 4),
    });
  }
  windows.push(row);
}

// --- AC units + the cable to their own window -----------------------------
// Each wire runs from an AC unit up into the WALL beside the window it
// belongs to (same cell) — never touching the window itself, and never to
// another unit elsewhere on the wall. Positions/margins are derived once,
// up front, from the same fixed layout math used when actually drawing
// (see the AC block in drawBuilding) — kept in sync by using the same
// formulas rather than duplicating magic numbers.
function cellLayout(r: number, c: number) {
  const colX = MARGIN_X + c * cellW;
  const rowY = BUILDING_TOP + r * cellH;
  const winW = Math.max(4, Math.round(cellW * 0.6));
  const baseWinH = Math.max(4, Math.round(cellH * 0.48));
  const acW = Math.max(6, Math.round(cellW * 0.58));
  const acH = Math.max(8, Math.round(cellH * 0.3));
  const groupH = baseWinH + 2 + acH;
  let groupY = Math.round(rowY + (cellH - groupH) / 2);
  // Safety clamps: the window frame extends 1px above groupY, so on the
  // very top row that could poke above the roofline if groupH runs even
  // slightly larger than cellH — clamp it down rather than relying on the
  // arithmetic to always leave enough slack. Same idea for the AC unit on
  // the bottom row against the ground line.
  if (r === 0) groupY = Math.max(groupY, BUILDING_TOP + 1);
  if (r === ROWS - 1) groupY = Math.min(groupY, BUILDING_BOTTOM - 1 - groupH);
  const winX = Math.round(colX + (cellW - winW) / 2);
  const acX = Math.round(colX + (cellW - acW) / 2);
  const acY = groupY + baseWinH + 2;
  return { colX, winW, baseWinH, acW, acH, groupY, winX, acX, acY };
}

// A quadratic curve, not a straight line — plotted point by point (not
// ctx.quadraticCurveTo/stroke) to stay crisp/pixelated. bulge pushes the
// midpoint sideways, perpendicular to the straight start->end direction.
function drawCurve(x0: number, y0: number, x1: number, y1: number, bulge: number, color: RGB, thickness = 1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = (x0 + x1) / 2 + nx * bulge;
  const cy = (y0 + y1) / 2 + ny * bulge;
  const steps = Math.max(2, Math.round(len + Math.abs(bulge)));
  ctx.fillStyle = rgbStr(color);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1;
    const y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    // A thin wire is just the 1px line above. A thicker one also fills
    // the pixel just off to the side, perpendicular to the curve's local
    // direction at this point — a real second strand's width, not a
    // uniform outline.
    if (thickness > 1) {
      ctx.fillRect(Math.round(x + nx), Math.round(y + ny), 1, 1);
    }
  }
}

interface Wire {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  bulge: number;
  strands: number;
  thickness: number;
}
const wires: Wire[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (!windows[r][c].hasAC) continue;
    const L = cellLayout(r, c);
    // Randomized per wire: which side it exits on, where exactly it lands
    // in the wall margin beside the window (never on the window itself),
    // and how much it bulges — this is what keeps every one from looking
    // like a copy of the last.
    const side = Math.random() < 0.5 ? -1 : 1;
    const wallMargin = (cellW - L.winW) / 2;
    const reach = Math.max(1, wallMargin - 3);
    const endX = side < 0 ? L.winX - (2 + Math.random() * reach) : L.winX + L.winW + (2 + Math.random() * reach);
    const endY = L.groupY + L.baseWinH * (0.15 + Math.random() * 0.6);
    const startX = side < 0 ? L.acX + 2 : L.acX + L.acW - 2;
    const startY = L.acY + 1;
    const bulge = (Math.random() - 0.5) * 2 * (6 + Math.random() * 8);
    // Most bundles are the normal (thicker) weight; a minority are
    // visibly thinner — that contrast is the point, not a uniform look.
    const thickness = Math.random() < 0.35 ? 1 : 2;
    wires.push({ x0: startX, y0: startY, x1: endX, y1: endY, bulge, strands: 2 + Math.round(Math.random()), thickness });
  }
}

const WIRE_COLOR: RGB = [196, 194, 188]; // grayish-white, not black

function drawWires() {
  for (const w of wires) {
    // A loose bundle, not one wire — each strand gets its own slightly
    // different bulge rather than a fixed parallel offset, so the bundle
    // itself looks like separate cables rather than a single fat line.
    for (let s = 0; s < w.strands; s++) {
      const jitter = (s - (w.strands - 1) / 2) * 2.2;
      drawCurve(w.x0, w.y0, w.x1, w.y1, w.bulge + jitter, WIRE_COLOR, w.thickness);
    }
  }
}

function drawSky(time: number) {
  // Covers the FULL canvas, not just down to BUILDING_TOP — the building
  // only paints over columns MARGIN_X..W-MARGIN_X, so the thin margin
  // strips on either side need the sky extended all the way down too,
  // or they're left completely unpainted (transparent, rendering as
  // black against the page background).
  const drift = Math.sin(time * 0.05) * 0.06;
  for (let y = 0; y < H; y++) {
    const t = Math.min(1, y / BUILDING_TOP);
    for (let x = 0; x < W; x++) {
      let color: RGB;
      const tt = t + drift;
      if (tt < 0.55) {
        color = mixColor(SKY_TOP, SKY_MID, x, y, tt / 0.55);
      } else {
        color = mixColor(SKY_MID, SKY_LOW, x, y, (tt - 0.55) / 0.45);
      }
      ctx.fillStyle = rgbStr(color);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawBuilding(time: number) {
  ctx.fillStyle = rgbStr(ROOFLINE);
  ctx.fillRect(MARGIN_X, BUILDING_TOP - 2, W - MARGIN_X * 2, 2);

  for (let c = 0; c < COLS; c++) {
    const accent = isAccentCol(c);
    const wallBase = accent ? ACCENT : WALL;
    const wallShadow = accent ? ACCENT_SHADOW : WALL_SHADOW;
    const colX = MARGIN_X + c * cellW;

    for (let r = 0; r < ROWS; r++) {
      const rowY = BUILDING_TOP + r * cellH;
      // Subtle vertical shading dithered in: slightly darker toward the
      // bottom of the building, like it's catching less light.
      const shadeT = r / ROWS;
      for (let py = 0; py < cellH; py++) {
        for (let px = 0; px < cellW; px++) {
          const x = Math.floor(colX + px);
          const y = Math.floor(rowY + py);
          const color = mixColor(wallBase, wallShadow, x, y, shadeT * 0.6);
          ctx.fillStyle = rgbStr(color);
          ctx.fillRect(x, y, 1, 1);
        }
      }

      const win = windows[r][c];
      if (time > win.nextToggle) {
        win.lit = Math.random() < 0.5;
        win.nextToggle = time + 4 + Math.random() * 16;
      }

      // Single source of truth for this layout — shared with the wire
      // generation above, so the two can never drift out of sync (and the
      // boundary clamps only need to live in one place).
      const L = cellLayout(r, c);
      const winW = L.winW;
      const winX = L.winX;
      const winH = L.baseWinH;
      const winY = L.groupY;

      // Frame (1px lighter border), then the glass itself.
      ctx.fillStyle = rgbStr(WINDOW_FRAME);
      ctx.fillRect(winX - 1, winY - 1, winW + 2, winH + 2);

      let glass: RGB;
      if (!win.lit) {
        glass = WINDOW_DARK;
      } else if (win.tv) {
        // TV flicker: brightness jitters frame to frame, unlike a steady
        // warm room light.
        const flick = 0.7 + 0.3 * Math.abs(Math.sin(time * 6 + c * 13 + r * 7));
        glass = [
          Math.round(WINDOW_LIT_TV[0] * flick),
          Math.round(WINDOW_LIT_TV[1] * flick),
          Math.round(WINDOW_LIT_TV[2] * flick),
        ];
      } else {
        glass = win.warmVariant ? WINDOW_LIT_WARM : WINDOW_LIT_PALE;
      }
      ctx.fillStyle = rgbStr(glass);
      ctx.fillRect(winX, winY, winW, winH);

      // Mullion: split into three vertical panes by two sash bars (no
      // horizontal bar) — matching the reference photo, instead of the
      // four-pane cross.
      ctx.fillStyle = rgbStr(WINDOW_FRAME);
      const x1 = winX + Math.round(winW / 3);
      const x2 = winX + Math.round((winW * 2) / 3);
      ctx.fillRect(x1, winY, 1, winH);
      ctx.fillRect(x2, winY, 1, winH);

      // A single lighter pixel in one pane, like a glass reflection —
      // which pane it sits in varies per window (fixed at creation, not
      // re-rolled every frame), instead of always the top-left one.
      if (win.lit) {
        const hl: RGB = [
          Math.min(255, glass[0] + 40),
          Math.min(255, glass[1] + 40),
          Math.min(255, glass[2] + 40),
        ];
        const corners: [number, number][] = [
          [winX + 1, winY + 1],
          [winX + winW - 2, winY + 1],
          [winX + 1, winY + winH - 2],
          [winX + winW - 2, winY + winH - 2],
        ];
        const [hlX, hlY] = corners[win.highlightCorner];
        ctx.fillStyle = rgbStr(hl);
        ctx.fillRect(hlX, hlY, 1, 1);
      }

      if (win.hasAC) {
        // Modeled after an actual condenser unit: a light housing, a
        // round fan face on one side (dark recess + rotating blades), a
        // vented panel on the other — not a small dark smudge.
        const acX = L.acX;
        const acY = L.acY;
        const acW = L.acW;
        const acH = L.acH;

        ctx.fillStyle = rgbStr(AC_BODY);
        ctx.fillRect(acX, acY, acW, acH);
        ctx.fillStyle = rgbStr(AC_BODY_SHADOW);
        ctx.fillRect(acX, acY + acH - 2, acW, 2); // grounds the box with a shadowed base edge

        const fanR = Math.floor(acH / 2) - 1;
        const fanCX = acX + fanR + 2;
        const fanCY = acY + Math.floor(acH / 2);

        // Fan recess — rasterized manually (not ctx.arc) so the circle
        // stays crisp/pixelated instead of anti-aliased.
        for (let py = -fanR; py <= fanR; py++) {
          for (let px = -fanR; px <= fanR; px++) {
            if (px * px + py * py <= fanR * fanR) {
              ctx.fillStyle = rgbStr(AC_FAN_BG);
              ctx.fillRect(fanCX + px, fanCY + py, 1, 1);
            }
          }
        }
        ctx.fillStyle = rgbStr(AC_FAN_RING);
        for (let a = 0; a < 16; a++) {
          const ang = (a / 16) * Math.PI * 2;
          ctx.fillRect(Math.round(fanCX + Math.cos(ang) * fanR), Math.round(fanCY + Math.sin(ang) * fanR), 1, 1);
        }

        // Spinning blades — several spokes rotating together, each unit
        // on its own speed/phase so they don't all spin in lockstep.
        const spinSeed = r * 13 + c * 7;
        const baseAngle = time * (2 + (spinSeed % 3)) + spinSeed;
        const spokeCount = 5;
        for (let i = 0; i < spokeCount; i++) {
          const angle = baseAngle + (i * Math.PI * 2) / spokeCount;
          drawRadialLine(fanCX, fanCY, 0.5, fanR - 0.5, angle, AC_FAN_BLADE);
        }

        // Vented panel to the right of the fan.
        const ventX0 = fanCX + fanR + 2;
        ctx.fillStyle = rgbStr(AC_VENT_LINE);
        for (let vx = ventX0; vx < acX + acW - 1; vx += 2) {
          ctx.fillRect(vx, acY + 1, 1, acH - 3);
        }
      }
    }
  }
}

let lastTime = performance.now() / 1000;
let simTime = 0;
function frame() {
  requestAnimationFrame(frame);
  const now = performance.now() / 1000;
  const dt = Math.min(now - lastTime, 0.1);
  lastTime = now;
  simTime += dt;

  drawSky(simTime);
  drawBuilding(simTime);
  drawWires();
  drawMusicRow();
}
frame();
