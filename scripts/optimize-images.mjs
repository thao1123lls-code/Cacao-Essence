import { mkdir, readdir, readFile, rename, stat } from 'node:fs/promises'
import path from 'node:path'

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('Chưa có thư viện sharp. Chạy: npm i -D sharp')
  process.exit(1)
}

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const quality = Number((args.find((a) => a.startsWith('--quality=')) ?? '--quality=72').split('=')[1])
if (!(quality >= 1 && quality <= 100)) { console.error('--quality phải từ 1 đến 100'); process.exit(1) }
const dry = flag('dry-run'), keep = flag('keep')

const ROOT = 'public/images'
const ARCHIVE = 'assets-src'
const SRC_EXT = new Set(['.jpg', '.jpeg', '.png'])

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}
const kb = (n) => (n / 1024).toFixed(0) + ' KB'

let before = 0, after = 0, converted = []
for await (const file of walk(ROOT)) {
  const ext = path.extname(file).toLowerCase()
  if (!SRC_EXT.has(ext) || path.basename(file).startsWith('og-')) continue
  const out = file.slice(0, -ext.length) + '.webp'
  const size = (await stat(file)).size
  // Giữ nguyên kích thước ảnh: ảnh túi quà được dùng làm texture WebGL (cần kích thước lũy thừa của 2)
  const buf = await sharp(file).webp({ quality, effort: 6 }).toBuffer()
  before += size; after += buf.length
  console.log(`${path.relative('.', file)}  ${kb(size)} → ${kb(buf.length)}  (${Math.round((1 - buf.length / size) * 100)}% nhẹ hơn)`)
  converted.push(path.basename(file))
  if (dry) continue
  await sharp(buf).toFile(out)
  if (!keep) {
    const dest = path.join(ARCHIVE, path.relative(ROOT, file))
    await mkdir(path.dirname(dest), { recursive: true })
    await rename(file, dest)
  }
}
if (!converted.length) { console.log('Không có ảnh JPG/PNG nào cần nén.'); process.exit(0) }
console.log(`\nTổng: ${kb(before)} → ${kb(after)}${dry ? '  (chạy thử, chưa ghi file)' : ''}`)

// Cảnh báo nếu mã nguồn còn tham chiếu tới ảnh cũ
const stale = []
for await (const f of walk('src')) {
  if (!/\.(tsx?|css|mjs)$/.test(f)) continue
  const txt = await readFile(f, 'utf8')
  for (const name of converted) if (txt.includes(name)) stale.push(`${f}: ${name}`)
}
if (stale.length) console.log('\nCòn tham chiếu tới ảnh gốc, hãy đổi sang .webp:\n  ' + stale.join('\n  '))
