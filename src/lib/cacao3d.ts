/**
 * Cảnh 3D WebGL thuần (không cần thư viện): quả cacao có gân xoay giữa các hạt cacao bay quanh.
 * Phản ứng với con trỏ / ngón tay và với việc cuộn trang.
 */
type V3 = [number, number, number]
type Mat = Float32Array

/* ---------- Toán ma trận (cột-chính) ---------- */
const ident = (): Mat => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
function mul(a: Mat, b: Mat): Mat {
  const o = new Float32Array(16)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]
      o[c * 4 + r] = s
    }
  return o
}
const trans = (x: number, y: number, z: number): Mat => { const m = ident(); m[12] = x; m[13] = y; m[14] = z; return m }
const scale = (s: number): Mat => { const m = ident(); m[0] = m[5] = m[10] = s; return m }
const rotX = (a: number): Mat => { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m }
const rotY = (a: number): Mat => { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m }
const rotZ = (a: number): Mat => { const m = ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m }
function persp(fov: number, asp: number, n: number, f: number): Mat {
  const t = 1 / Math.tan(fov / 2), m = new Float32Array(16)
  m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = (2 * f * n) / (n - f)
  return m
}

/* ---------- Dựng lưới bề mặt tham số ---------- */
interface Surf { p: V3; c: V3 }
type SurfFn = (u: number, v: number) => Surf
interface Mesh { pos: Float32Array; nor: Float32Array; col: Float32Array; idx: Uint16Array }

function build(fn: SurfFn, nu: number, nv: number): Mesh {
  const vc = (nu + 1) * (nv + 1)
  const pos = new Float32Array(vc * 3), nor = new Float32Array(vc * 3), col = new Float32Array(vc * 3)
  const idx = new Uint16Array(nu * nv * 6)
  const e = 0.002
  let k = 0
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++, k++) {
      const u = i / nu, v = j / nv
      const s = fn(u, v)
      pos.set(s.p, k * 3); col.set(s.c, k * 3)
      const vv = Math.min(1 - e * 3, Math.max(e * 3, v))
      const a = fn(u + e, vv).p, b = fn(u - e, vv).p, c = fn(u, vv + e).p, d = fn(u, vv - e).p
      const tu: V3 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]], tv: V3 = [c[0] - d[0], c[1] - d[1], c[2] - d[2]]
      let nx = tu[1] * tv[2] - tu[2] * tv[1], ny = tu[2] * tv[0] - tu[0] * tv[2], nz = tu[0] * tv[1] - tu[1] * tv[0]
      const l = Math.hypot(nx, ny, nz) || 1
      nx /= l; ny /= l; nz /= l
      // Hướng pháp tuyến ra ngoài (vật thể lồi quanh gốc toạ độ)
      if (nx * s.p[0] + ny * s.p[1] + nz * s.p[2] < 0) { nx = -nx; ny = -ny; nz = -nz }
      nor.set([nx, ny, nz], k * 3)
    }
  }
  let q = 0
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1
      idx.set([a, c, b, b, c, d], q); q += 6
    }
  return { pos, nor, col, idx }
}

const mix = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const hex = (h: number): V3 => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]
const GROOVE = hex(0x7d2f16), RED = hex(0xc8501f), GOLD = hex(0xf0b45f), LEAF = hex(0x4e7a38)

/** Quả cacao: thon nhọn một đầu, 10 gân nổi, màu đỏ cam – vàng. */
function podSurface(u: number, v: number): Surf {
  const ph = u * Math.PI * 2, t = v * Math.PI
  const s = Math.sin(t), ct = Math.cos(t)
  const ridge = 0.5 + 0.5 * Math.cos(10 * ph)
  const sm = Math.pow(s, 0.85 + 0.55 * Math.max(0, ct)) // đầu dưới nhọn hơn đầu cuống
  const noise = 0.012 * Math.sin(ph * 23 + t * 17) + 0.01 * Math.sin(ph * 7 - t * 31)
  const r = 0.82 * sm * (1 + 0.1 * (ridge - 0.5) * 2 * Math.pow(s, 0.6) + noise)
  const y = -ct * 1.5 + 0.1 * Math.sin(t) // hơi phình
  const base = mix(GROOVE, RED, Math.pow(ridge, 0.7))
  let c = mix(base, GOLD, 0.45 * Math.pow(ridge, 5) + 0.18 * Math.max(0, ct))
  c = mix(c, LEAF, Math.max(0, -ct - 0.93) * 6) // cuống hơi xanh
  return { p: [r * Math.cos(ph), y, r * Math.sin(ph)], c }
}

/** Hạt cacao: elip dẹt có rãnh giữa. */
function beanSurface(u: number, v: number): Surf {
  const ph = u * Math.PI * 2, t = v * Math.PI
  const s = Math.sin(t)
  const crease = Math.exp(-Math.pow(ph - Math.PI / 2, 2) / 0.05) + Math.exp(-Math.pow(ph - Math.PI / 2 - Math.PI * 2, 2) / 0.05)
  const y = 0.34 * s * Math.cos(ph) - 0.06 * crease * s
  const p: V3 = [0.62 * Math.cos(t), y, 0.27 * s * Math.sin(ph)]
  const shade = 0.5 + 0.5 * Math.sin(ph * 3 + t * 5)
  return { p, c: mix(hex(0x4a2113), hex(0x7a3b1f), shade * 0.55) }
}

/* ---------- Túi bột cacao: hình dáng lấy từ ảnh thật ---------- */
// Biên trái/phải (0..1 theo bề ngang ảnh) của 49 hàng từ trên xuống, đo từ viền thật của túi trong ảnh.
const POUCH = {
  aspect: 0.6592, ymargin: 0.0052,
  xl: [0.0066, 0.0066, 0.0066, 0.0066, 0.0053, 0.0053, 0.0053, 0.0066, 0.0066, 0.0066, 0.0053, 0.0053, 0.0053, 0.0053, 0.0053, 0.0053, 0.0079, 0.0118, 0.0132, 0.0158, 0.0197, 0.0211, 0.0237, 0.0263, 0.0289, 0.0303, 0.0329, 0.0342, 0.0368, 0.0382, 0.0408, 0.0434, 0.0434, 0.0447, 0.0461, 0.0487, 0.0526, 0.0539, 0.0539, 0.0539, 0.0539, 0.0553, 0.0579, 0.0579, 0.0579, 0.0605, 0.0671, 0.1842, 0.1842],
  xr: [0.9842, 0.9895, 0.9842, 0.9658, 0.9618, 0.9618, 0.9645, 0.9645, 0.9658, 0.9658, 0.9671, 0.9671, 0.9671, 0.9816, 0.9921, 0.9921, 0.9921, 0.9842, 0.9842, 0.9895, 0.9921, 0.9921, 0.9921, 0.9882, 0.9882, 0.9921, 0.9921, 0.9868, 0.9868, 0.9868, 0.9855, 0.9842, 0.9829, 0.9553, 0.9553, 0.975, 0.975, 0.9737, 0.9724, 0.9658, 0.9434, 0.9434, 0.9487, 0.9553, 0.9553, 0.9474, 0.9026, 0.8158, 0.8158],
}

interface TexMesh { pos: Float32Array; nor: Float32Array; uv: Float32Array; idx: Uint16Array }

/** Túi phồng ở giữa, mép ôm sát viền ảnh; mặt trước và sau gặp nhau ở mép nên không hở. */
function buildPouch(back: boolean): TexMesh {
  const NR = POUCH.xl.length - 1, ny = NR * 2, nx = 40, H = 3.0, W = H * POUCH.aspect, B = 0.3
  const vc = (nx + 1) * (ny + 1)
  const pos = new Float32Array(vc * 3), nor = new Float32Array(vc * 3), uv = new Float32Array(vc * 2)
  const idx = new Uint16Array(nx * ny * 6)
  let k = 0
  for (let j = 0; j <= ny; j++) {
    const v = j / ny, f = v * NR, j0 = Math.min(NR - 1, Math.floor(f)), t = f - j0
    const xl = POUCH.xl[j0] + (POUCH.xl[j0 + 1] - POUCH.xl[j0]) * t, xr = POUCH.xr[j0] + (POUCH.xr[j0 + 1] - POUCH.xr[j0]) * t
    const tv = POUCH.ymargin + v * (1 - 2 * POUCH.ymargin)
    for (let i = 0; i <= nx; i++, k++) {
      const u = i / nx, tu = xl + (xr - xl) * u
      const s = 2 * u - 1, r = 2 * v - 1
      const z = B * Math.pow(Math.max(0, 1 - s * s), 0.55) * Math.pow(Math.max(0, 1 - r * r), 0.45) * (1 + 0.18 * (0.5 - v))
      pos.set([(tu - 0.5) * W, (0.5 - tv) * H, back ? -z : z], k * 3)
      uv.set([back ? 1 - u : tu, tv], k * 2)
    }
  }
  let q = 0
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1
      if (back) idx.set([a, b, c, b, d, c], q); else idx.set([a, c, b, b, c, d], q)
      q += 6
    }
  // Pháp tuyến: cộng pháp tuyến các mặt tam giác quanh mỗi đỉnh
  for (let n = 0; n < idx.length; n += 3) {
    const [a, b, c] = [idx[n] * 3, idx[n + 1] * 3, idx[n + 2] * 3]
    const e1 = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], e2 = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]]
    const fx = e1[1] * e2[2] - e1[2] * e2[1], fy = e1[2] * e2[0] - e1[0] * e2[2], fz = e1[0] * e2[1] - e1[1] * e2[0]
    for (const o of [a, b, c]) { nor[o] += fx; nor[o + 1] += fy; nor[o + 2] += fz }
  }
  for (let o = 0; o < nor.length; o += 3) {
    const l = Math.hypot(nor[o], nor[o + 1], nor[o + 2]) || 1
    nor[o] /= l; nor[o + 1] /= l; nor[o + 2] /= l
  }
  return { pos, nor, uv, idx }
}

/* ---------- Shader ---------- */
const VS = `
attribute vec3 aP; attribute vec3 aN; attribute vec3 aC;
uniform mat4 uM; uniform mat4 uVP;
varying vec3 vN; varying vec3 vC; varying vec3 vW;
void main(){
  vec4 w = uM * vec4(aP, 1.0);
  vW = w.xyz; vN = mat3(uM) * aN; vC = aC;
  gl_Position = uVP * w;
}`
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vN; varying vec3 vC; varying vec3 vW;
uniform vec3 uEye; uniform float uSpec;
void main(){
  vec3 N = normalize(vN), V = normalize(uEye - vW);
  vec3 L1 = normalize(vec3(0.55, 0.85, 0.75)), L2 = normalize(vec3(-0.85, -0.25, 0.45));
  float d1 = max(dot(N, L1), 0.0), d2 = max(dot(N, L2), 0.0);
  vec3 H = normalize(L1 + V);
  float sp = pow(max(dot(N, H), 0.0), 38.0) * uSpec;
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 col = vC * (0.34 + 0.82 * d1 + 0.22 * d2 * vec3(1.0, 0.7, 0.55));
  col += vec3(1.0, 0.93, 0.8) * sp + vec3(0.95, 0.55, 0.28) * rim * 0.38;
  gl_FragColor = vec4(col, 1.0);
}`

const VS_T = `
attribute vec3 aP; attribute vec3 aN; attribute vec2 aT;
uniform mat4 uM; uniform mat4 uVP;
varying vec3 vN; varying vec2 vT; varying vec3 vW;
void main(){
  vec4 w = uM * vec4(aP, 1.0);
  vW = w.xyz; vN = mat3(uM) * aN; vT = aT;
  gl_Position = uVP * w;
}`
const FS_T = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vN; varying vec2 vT; varying vec3 vW;
uniform sampler2D uTex; uniform vec3 uEye;
void main(){
  vec3 N = normalize(vN), V = normalize(uEye - vW);
  vec3 L1 = normalize(vec3(0.55, 0.85, 0.75)), L2 = normalize(vec3(-0.85, -0.25, 0.45));
  float d1 = max(dot(N, L1), 0.0), d2 = max(dot(N, L2), 0.0);
  vec3 H = normalize(L1 + V);
  float sp = pow(max(dot(N, H), 0.0), 26.0) * 0.16;
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 col = texture2D(uTex, vT).rgb * (0.8 + 0.4 * d1 + 0.1 * d2);
  col += vec3(1.0, 0.95, 0.85) * sp + vec3(0.95, 0.6, 0.35) * rim * 0.12;
  gl_FragColor = vec4(col, 1.0);
}`

interface GpuMesh { vao: WebGLBuffer[]; ib: WebGLBuffer; n: number }

export interface Scene3D {
  /** Con trỏ chuẩn hoá −1…1 (x phải dương, y lên dương). */
  pointer: { x: number; y: number }
  /** Số pixel đã cuộn – xoay thêm khi cuộn trang. */
  scroll: number
  resize(): void
  frame(timeMs: number): void
  dispose(): void
}

export interface SceneOptions { front: string; back: string }

/** Nếu truyền ảnh túi thì vẽ túi 3D có ảnh thật; không truyền hoặc ảnh lỗi thì vẽ quả cacao. */
export function createScene(canvas: HTMLCanvasElement, opts?: SceneOptions): Scene3D | null {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src); gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader')
    return sh
  }
  let prog: WebGLProgram
  try {
    prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link')
  } catch { return null }
  gl.useProgram(prog)
  const loc = { p: gl.getAttribLocation(prog, 'aP'), n: gl.getAttribLocation(prog, 'aN'), c: gl.getAttribLocation(prog, 'aC'),
    m: gl.getUniformLocation(prog, 'uM'), vp: gl.getUniformLocation(prog, 'uVP'), eye: gl.getUniformLocation(prog, 'uEye'), spec: gl.getUniformLocation(prog, 'uSpec') }

  // Chương trình vẽ có ảnh (túi). Lỗi biên dịch thì chỉ bỏ túi, vẫn vẽ quả cacao.
  let progT: WebGLProgram | null = null
  try {
    progT = gl.createProgram()!
    gl.attachShader(progT, compile(gl.VERTEX_SHADER, VS_T)); gl.attachShader(progT, compile(gl.FRAGMENT_SHADER, FS_T))
    gl.linkProgram(progT)
    if (!gl.getProgramParameter(progT, gl.LINK_STATUS)) throw new Error('link')
  } catch { progT = null }
  const locT = progT && { p: gl.getAttribLocation(progT, 'aP'), n: gl.getAttribLocation(progT, 'aN'), t: gl.getAttribLocation(progT, 'aT'),
    m: gl.getUniformLocation(progT, 'uM'), vp: gl.getUniformLocation(progT, 'uVP'), eye: gl.getUniformLocation(progT, 'uEye'), tex: gl.getUniformLocation(progT, 'uTex') }
  gl.useProgram(prog)

  let pouchState = opts && progT ? 0 : -1 // 0 đang tải, 1 sẵn sàng, -1 dùng quả cacao
  const texs: (WebGLTexture | null)[] = [null, null]
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic')
  const disposed = { v: false }
  const loadTex = (url: string, slot: number) => {
    const img = new Image()
    img.onload = () => {
      if (disposed.v) return
      const t = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number))
      texs[slot] = t
      if (texs[0] && texs[1]) pouchState = 1
    }
    img.onerror = () => { pouchState = -1 }
    img.src = url
  }
  if (opts && progT) { loadTex(opts.front, 0); loadTex(opts.back, 1) }

  const uploadT = (m: TexMesh) => {
    const mk = (data: ArrayBufferView, target: number) => { const b = gl.createBuffer()!; gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b }
    return { vao: [mk(m.pos, gl.ARRAY_BUFFER), mk(m.nor, gl.ARRAY_BUFFER), mk(m.uv, gl.ARRAY_BUFFER)], ib: mk(m.idx, gl.ELEMENT_ARRAY_BUFFER), n: m.idx.length }
  }
  const pouchF = progT && opts ? uploadT(buildPouch(false)) : null
  const pouchB = progT && opts ? uploadT(buildPouch(true)) : null
  const drawT = (g: GpuMesh, tex: WebGLTexture, model: Mat) => {
    if (!locT) return
    ;([[locT.p, 0, 3], [locT.n, 1, 3], [locT.t, 2, 2]] as [number, number, number][]).forEach(([a, i, sz]) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, g.vao[i]); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, sz, gl.FLOAT, false, 0, 0)
    })
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ib)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniformMatrix4fv(locT.m, false, model)
    gl.drawElements(gl.TRIANGLES, g.n, gl.UNSIGNED_SHORT, 0)
  }

  const upload = (m: Mesh): GpuMesh => {
    const mk = (data: ArrayBufferView, target: number) => { const b = gl.createBuffer()!; gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b }
    return { vao: [mk(m.pos, gl.ARRAY_BUFFER), mk(m.nor, gl.ARRAY_BUFFER), mk(m.col, gl.ARRAY_BUFFER)], ib: mk(m.idx, gl.ELEMENT_ARRAY_BUFFER), n: m.idx.length }
  }
  const pod = upload(build(podSurface, 72, 96))
  const bean = upload(build(beanSurface, 22, 16))
  const draw = (g: GpuMesh, model: Mat, spec: number) => {
    ;([[loc.p, 0], [loc.n, 1], [loc.c, 2]] as [number, number][]).forEach(([a, i]) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, g.vao[i]); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0)
    })
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ib)
    gl.uniformMatrix4fv(loc.m, false, model); gl.uniform1f(loc.spec, spec)
    gl.drawElements(gl.TRIANGLES, g.n, gl.UNSIGNED_SHORT, 0)
  }

  gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.clearColor(0, 0, 0, 0)

  // Hạt bay quanh: mỗi hạt một quỹ đạo, tốc độ và kích thước riêng (xác định, không ngẫu nhiên)
  const BEANS = Array.from({ length: 15 }, (_, i) => ({
    a0: (i / 15) * Math.PI * 2, sp: 0.16 + ((i * 7) % 5) * 0.045, rx: 1.7 + ((i * 3) % 4) * 0.15, ry: 1.25 + ((i * 5) % 4) * 0.2,
    ph: i * 1.7, sz: 0.38 + ((i * 11) % 6) * 0.07, tx: 0.6 + (i % 3) * 0.5, tz: 0.4 + (i % 4) * 0.35, tilt: i * 0.9,
  }))

  const EYE: V3 = [0, 0, 8.8]
  const view = trans(-EYE[0], -EYE[1], -EYE[2])
  let w = 1, h = 1
  let yaw = 0, pitch = 0 // làm mượt theo con trỏ
  const api: Scene3D = {
    pointer: { x: 0, y: 0 }, scroll: 0,
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = Math.max(1, Math.round(canvas.clientWidth * dpr)); h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
      gl.viewport(0, 0, w, h)
    },
    frame(ms) {
      const t = ms / 1000
      yaw += (api.pointer.x * 0.7 - yaw) * 0.06; pitch += (api.pointer.y * 0.35 - pitch) * 0.06
      const vp = mul(persp((40 * Math.PI) / 180, w / h, 0.1, 50), view)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.uniformMatrix4fv(loc.vp, false, vp); gl.uniform3fv(loc.eye, EYE)

      // Vật thể chính: tự lắc/xoay, nghiêng theo con trỏ, quay thêm khi cuộn, nhấp nhô nhẹ
      if (pouchState === 1 && pouchF && pouchB && locT && progT) {
        const ang = Math.sin(t * 0.55) * 0.75 + yaw + api.scroll * 0.004
        const mp = mul(trans(0, Math.sin(t * 1.1) * 0.1, 0), mul(rotZ(-0.05 + yaw * 0.08), mul(rotX(0.1 + pitch * 0.8), mul(rotY(ang), scale(1.5)))))
        gl.useProgram(progT)
        gl.uniformMatrix4fv(locT.vp, false, vp); gl.uniform3fv(locT.eye, EYE); gl.uniform1i(locT.tex, 0)
        gl.activeTexture(gl.TEXTURE0)
        drawT(pouchF, texs[0]!, mp); drawT(pouchB, texs[1]!, mp)
        gl.useProgram(prog)
      } else if (pouchState === -1) {
        const rot = t * 0.5 + yaw + api.scroll * 0.0035
        const m0 = mul(trans(0, Math.sin(t * 1.1) * 0.1, 0), mul(rotZ(-0.38 + yaw * 0.15), mul(rotX(0.28 + pitch), mul(rotY(rot), scale(1.2)))))
        draw(pod, m0, 0.55)
      }
      let m: Mat

      for (const b of BEANS) {
        const a = b.a0 + t * b.sp + api.scroll * 0.0009
        const x = Math.cos(a) * b.rx + yaw * 0.5, y = Math.sin(a * 1.3 + b.ph) * b.ry + pitch * 0.4, z = Math.sin(a) * 1.9
        m = mul(trans(x, y, z), mul(rotZ(b.tilt + t * 0.4 * b.tz), mul(rotY(t * b.tx + b.ph), mul(rotX(t * 0.5 * b.tz + b.tilt), scale(b.sz)))))
        draw(bean, m, 0.9)
      }
    },
    dispose() {
      ;[pod, bean].forEach((g) => { g.vao.forEach((b) => gl.deleteBuffer(b)); gl.deleteBuffer(g.ib) })
      disposed.v = true
      ;[pouchF, pouchB].forEach((g) => { if (g) { g.vao.forEach((b) => gl.deleteBuffer(b)); gl.deleteBuffer(g.ib) } })
      texs.forEach((t) => t && gl.deleteTexture(t))
      gl.deleteProgram(prog); if (progT) gl.deleteProgram(progT)
    },
  }
  api.resize()
  return api
}
