/**
 * 生成婚礼邀请函分享海报（小程序/公众号风格 QR 卡片）
 * 运行：pnpm share:qr
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'share')

const URL =
  process.env.SHARE_URL ||
  'https://wedding-invite-d9gdvtmrr73ff6b75-1461874135.ap-shanghai.app.tcloudbase.com'

const W = 750
const H = 1100
const DARK = '#2d4a36'
const LIGHT = '#faf6ee'

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 生成可扫码的风格化 QR PNG（圆角模块 + 标准定位点结构） */
async function renderStyledQrPng(text, size) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' })
  const modules = qr.modules
  const n = modules.size
  const marginModules = 2
  const total = n + marginModules * 2
  const cell = size / total
  const pad = cell * 0.08
  const rx = cell * 0.28

  const inFinder = (row, col) => {
    const near = (r0, c0) => row >= r0 && row < r0 + 7 && col >= c0 && col < c0 + 7
    return near(0, 0) || near(0, n - 7) || near(n - 7, 0)
  }

  const parts = []
  parts.push(
    `<rect width="${size}" height="${size}" fill="${LIGHT}"/>`
  )

  // 数据点：圆角方块（接近满格，保证识别）
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!modules.get(row, col) || inFinder(row, col)) continue
      const x = (col + marginModules) * cell + pad
      const y = (row + marginModules) * cell + pad
      const s = cell - pad * 2
      parts.push(
        `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}" rx="${rx.toFixed(2)}" fill="${DARK}"/>`
      )
    }
  }

  // 定位点：保持标准 7-5-3 结构，仅轻微圆角（颜色与模块一致，避免金色破坏识别）
  const drawFinder = (fr, fc) => {
    const ox = (fc + marginModules) * cell
    const oy = (fr + marginModules) * cell
    const s7 = cell * 7
    const s5 = cell * 5
    const s3 = cell * 3
    parts.push(`
      <rect x="${ox.toFixed(2)}" y="${oy.toFixed(2)}" width="${s7.toFixed(2)}" height="${s7.toFixed(2)}" rx="${(cell * 0.9).toFixed(2)}" fill="${DARK}"/>
      <rect x="${(ox + cell).toFixed(2)}" y="${(oy + cell).toFixed(2)}" width="${s5.toFixed(2)}" height="${s5.toFixed(2)}" rx="${(cell * 0.65).toFixed(2)}" fill="${LIGHT}"/>
      <rect x="${(ox + cell * 2).toFixed(2)}" y="${(oy + cell * 2).toFixed(2)}" width="${s3.toFixed(2)}" height="${s3.toFixed(2)}" rx="${(cell * 0.45).toFixed(2)}" fill="${DARK}"/>
    `)
  }
  drawFinder(0, 0)
  drawFinder(0, n - 7)
  drawFinder(n - 7, 0)

  // 中心小徽章（约占边长 18%，H 级可覆盖）
  const cx = size / 2
  const cy = size / 2
  const badge = size * 0.09
  parts.push(`
    <circle cx="${cx}" cy="${cy}" r="${badge + 4}" fill="${LIGHT}"/>
    <circle cx="${cx}" cy="${cy}" r="${badge}" fill="#1c2e24" stroke="#c9a86a" stroke-width="2.5"/>
    <text x="${cx}" y="${cy - 2}" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="${(badge * 0.42).toFixed(1)}" fill="#f7e7c3">GMY</text>
    <text x="${cx}" y="${cy + badge * 0.38}" text-anchor="middle" font-family="Georgia, serif" font-size="${(badge * 0.34).toFixed(1)}" fill="#c9a86a">&amp; WJ</text>
  `)

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${parts.join('\n')}
</svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}

function buildCardSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c2e24"/>
      <stop offset="45%" stop-color="#2d4a36"/>
      <stop offset="100%" stop-color="#3d5c45"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdf3d3"/>
      <stop offset="40%" stop-color="#e8c98a"/>
      <stop offset="70%" stop-color="#c9a86a"/>
      <stop offset="100%" stop-color="#f0d9a8"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffdf8"/>
      <stop offset="100%" stop-color="#f3ecdd"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0a1510" flood-opacity="0.35"/>
    </filter>
    <radialGradient id="glow" cx="50%" cy="28%" r="55%">
      <stop offset="0%" stop-color="#c9a86a" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#c9a86a" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <g opacity="0.22" stroke="#e8d5a3" stroke-width="1" fill="none">
    <circle cx="90" cy="160" r="54"/>
    <circle cx="90" cy="160" r="34"/>
    <circle cx="660" cy="980" r="70"/>
    <circle cx="660" cy="980" r="44"/>
  </g>

  <rect x="56" y="72" width="638" height="956" rx="36" fill="url(#card)" filter="url(#soft)"/>

  <g fill="url(#gold)">
    <path d="M375 118c18 22 42 36 70 42 -28 6-52 20-70 42 -18-22-42-36-70-42 28-6 52-20 70-42z" opacity="0.95"/>
  </g>
  <text x="375" y="198" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-style="italic" fill="#c9a86a">GMY &amp; WJ</text>
  <text x="375" y="248" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="36" font-weight="600" fill="#1c2e24">吴极 · 高旻洋</text>
  <text x="375" y="286" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="18" letter-spacing="6" fill="#8a7350">诚邀您见证我们的婚礼</text>

  <!-- QR 占位：由 sharp 合成 -->
  <rect x="165" y="320" width="420" height="420" rx="32" fill="${LIGHT}" stroke="#e8d5a3" stroke-width="2"/>

  <line x1="180" y1="780" x2="570" y2="780" stroke="#e8d5a3" stroke-width="1.5"/>
  <text x="375" y="830" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="28" font-weight="600" fill="#2d4a36">2026 · 10 · 18</text>
  <text x="375" y="872" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="20" fill="#8a7350">上海 · 阿丽那野奢度假庄园</text>
  <text x="375" y="920" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="17" fill="#4a6b52">扫码打开电子请柬</text>

  <rect x="230" y="948" width="290" height="44" rx="22" fill="#2d4a36"/>
  <text x="375" y="976" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="16" fill="#f7e7c3" letter-spacing="2">长按识别 · 进入邀请函</text>

  <!-- ${escapeXml(URL)} -->
</svg>`
}

function buildPreviewHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>婚礼邀请函 · 分享二维码</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: radial-gradient(circle at 30% 20%, #3d5c45, #1c2e24 60%, #0f1a14);
      font-family: "PingFang SC", "Microsoft YaHei", sans-serif; color: #f7e7c3;
    }
    .box { text-align: center; padding: 24px; }
    img {
      width: min(92vw, 420px); height: auto; border-radius: 20px;
      box-shadow: 0 24px 60px rgba(0,0,0,.45);
    }
    a {
      display: inline-block; margin-top: 22px; padding: 12px 28px; border-radius: 999px;
      background: linear-gradient(135deg, #e8c98a, #c9a86a); color: #1c2e24;
      text-decoration: none; font-weight: 600; letter-spacing: .08em;
    }
    p { opacity: .75; font-size: 14px; margin-top: 14px; word-break: break-all; max-width: 420px; margin-inline: auto; }
  </style>
</head>
<body>
  <div class="box">
    <img src="./invite-card.png" alt="婚礼邀请函二维码" />
    <div>
      <a href="./invite-card.png" download="wedding-invite-qr.png">下载 PNG</a>
      <a href="./invite-card.svg" download="wedding-invite-qr.svg" style="margin-left:10px">下载 SVG</a>
    </div>
    <p>扫码直达：${escapeXml(URL)}</p>
  </div>
</body>
</html>`
}

async function verifyScan(pngPath) {
  try {
    const jsQR = (await import('jsqr')).default
    const { data, info } = await sharp(pngPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const whole = jsQR(new Uint8ClampedArray(data), info.width, info.height)
    if (whole?.data) return whole.data

    const crop = await sharp(pngPath)
      .extract({ left: 165, top: 320, width: 420, height: 420 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const part = jsQR(new Uint8ClampedArray(crop.data), crop.info.width, crop.info.height)
    return part?.data || null
  } catch {
    return null
  }
}

/**
 * 微信 / OG 分享缩略图（约 1:1）。
 * WeChat 抓取链接预览时读页面 meta 的 og:image，需为可公网访问的绝对 HTTPS 地址。
 */
async function buildOgCoverPng() {
  const SIZE = 800
  const venuePath = path.join(ROOT, 'public', 'imgs', 'venue_01.jpg')
  if (!fs.existsSync(venuePath)) {
    throw new Error(`缺少封面底图: ${venuePath}`)
  }

  const bg = await sharp(venuePath)
    .resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 90 })
    .toBuffer()

  const overlaySvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f1a14" stop-opacity="0.15"/>
      <stop offset="45%" stop-color="#0f1a14" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0f1a14" stop-opacity="0.82"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdf3d3"/>
      <stop offset="45%" stop-color="#e8c98a"/>
      <stop offset="100%" stop-color="#c9a86a"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#veil)"/>
  <g fill="url(#gold)">
    <path d="M400 528c14 17 32 28 54 33 -22 5-40 16-54 33 -14-17-32-28-54-33 22-5 40-16 54-33z" opacity="0.95"/>
  </g>
  <text x="400" y="590" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-style="italic" fill="#e8c98a">GMY &amp; WJ</text>
  <text x="400" y="648" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="40" font-weight="600" fill="#faf6ee">吴极 · 高旻洋</text>
  <text x="400" y="698" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="22" letter-spacing="4" fill="#e8d5a3">2026 · 10 · 18</text>
  <text x="400" y="740" text-anchor="middle" font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-size="18" fill="#c9b89a">上海 · 阿丽那野奢度假庄园</text>
</svg>`)

  const outPath = path.join(OUT_DIR, 'og-cover.png')
  await sharp(bg)
    .composite([{ input: await sharp(overlaySvg).png().toBuffer() }])
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(outPath)
  return outPath
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const ogPath = await buildOgCoverPng()
  console.log(`[share-qr] OG  → ${ogPath}`)

  const qrSize = 396
  const qrPng = await renderStyledQrPng(URL, qrSize)

  // 圆角蒙版，贴合卡片内框
  const roundedQr = await sharp(qrPng)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${qrSize}" height="${qrSize}"><rect width="${qrSize}" height="${qrSize}" rx="28" ry="28" fill="white"/></svg>`
        ),
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer()

  const cardSvg = Buffer.from(buildCardSvg())
  const pngPath = path.join(OUT_DIR, 'invite-card.png')
  const svgPath = path.join(OUT_DIR, 'invite-card.svg')

  await sharp(cardSvg)
    .composite([{ input: roundedQr, left: 177, top: 332 }])
    .png()
    .toFile(pngPath)

  // SVG：嵌入 base64 PNG QR，保证预览与下载一致且可扫
  const b64 = roundedQr.toString('base64')
  const svgWithEmbed = buildCardSvg().replace(
    `<rect x="165" y="320" width="420" height="420" rx="32" fill="${LIGHT}" stroke="#e8d5a3" stroke-width="2"/>`,
    `<rect x="165" y="320" width="420" height="420" rx="32" fill="${LIGHT}" stroke="#e8d5a3" stroke-width="2"/>
  <image href="data:image/png;base64,${b64}" x="177" y="332" width="${qrSize}" height="${qrSize}" />`
  )
  fs.writeFileSync(svgPath, svgWithEmbed, 'utf8')
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), buildPreviewHtml(), 'utf8')

  // 清理临时裁剪图
  const cropTmp = path.join(OUT_DIR, '_qr-crop.png')
  if (fs.existsSync(cropTmp)) fs.unlinkSync(cropTmp)

  const decoded = await verifyScan(pngPath)
  console.log(`[share-qr] PNG → ${pngPath}`)
  console.log(`[share-qr] SVG → ${svgPath}`)
  console.log(`[share-qr] URL → ${URL}`)
  console.log(`[share-qr] scan → ${decoded ? 'OK ' + decoded : 'FAIL'}`)
  if (!decoded) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
