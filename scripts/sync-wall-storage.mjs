/**
 * 将云存储 wall/ 中尚未入库的图片同步到 NoSQL wall 集合。
 * 用法：node scripts/sync-wall-storage.mjs
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { basename, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash, randomBytes } from 'node:crypto'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ENV_ID = 'wedding-invite-d9gdvtmrr73ff6b75'
const BUCKET = '7765-wedding-invite-d9gdvtmrr73ff6b75-1461874135'
const TCB_BIN = existsSync('D:/nvm/node_global/node_modules/@cloudbase/cli/bin/tcb')
  ? 'D:/nvm/node_global/node_modules/@cloudbase/cli/bin/tcb'
  : null

/** 控制台批量上传的婚纱照统一竖图尺寸（实测均为 1440x1920） */
const DEFAULT_W = 1440
const DEFAULT_H = 1920

function tcb(args) {
  const cmd = TCB_BIN ? process.execPath : 'tcb'
  const fullArgs = TCB_BIN ? [TCB_BIN, ...args] : args
  const r = spawnSync(cmd, fullArgs, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  })
  if (r.status !== 0) {
    throw new Error(`tcb ${args.join(' ')}\n${r.stderr || r.stdout || ''}`)
  }
  return r.stdout || ''
}

function parseJsonPayload(text) {
  const a = text.indexOf('[')
  const o = text.indexOf('{')
  const i = a >= 0 && (o < 0 || a < o) ? a : o
  if (i < 0) throw new Error(`无法解析 JSON:\n${text.slice(0, 400)}`)
  return JSON.parse(text.slice(i))
}

function nosql(commandObj) {
  const payload = JSON.stringify([commandObj])
  return parseJsonPayload(
    tcb(['db', 'nosql', 'execute', '-e', ENV_ID, '--command', payload])
  )
}

function listStorageWall() {
  const raw = parseJsonPayload(tcb(['storage', 'list', 'wall/', '-e', ENV_ID, '--json']))
  return (raw.data || []).filter((f) => /\.(jpe?g|png|webp)$/i.test(f.key || ''))
}

function listDbWall() {
  const res = nosql({
    TableName: 'wall',
    CommandType: 'QUERY',
    Command: JSON.stringify({ find: 'wall', limit: 1000 })
  })
  return Array.isArray(res) ? res : []
}

function toFileId(cloudPath) {
  return `cloud://${ENV_ID}.${BUCKET}/${cloudPath}`
}

function mimeFromExt(ext) {
  const e = ext.toLowerCase()
  if (e === '.png') return 'image/png'
  if (e === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function makeId(seed) {
  const hash = createHash('md5').update(seed).digest('hex').slice(0, 8)
  return `${Date.now()}-${hash}-${randomBytes(2).toString('hex')}`
}

function idFromKey(key) {
  const stem = basename(key).replace(/\.[^.]+$/, '')
  if (/^\d{10,}-[a-f0-9]{6,}$/i.test(stem)) return stem
  return makeId(key)
}

function insertBatch(documents) {
  const result = nosql({
    TableName: 'wall',
    CommandType: 'INSERT',
    Command: JSON.stringify({ insert: 'wall', documents })
  })
  return result
}

async function main() {
  console.log('列出云存储 wall/ …')
  const files = listStorageWall()
  console.log(`存储文件: ${files.length}`)

  console.log('读取数据库 wall …')
  const docs = listDbWall()
  console.log(`数据库记录: ${docs.length}`)

  const knownPaths = new Set()
  const knownIds = new Set()
  for (const d of docs) {
    if (d.cloudPath) knownPaths.add(String(d.cloudPath))
    if (d.id) knownIds.add(String(d.id))
    if (d._id) knownIds.add(String(d._id))
    if (d.fileID) {
      const m = String(d.fileID).match(/\/(wall\/.+)$/)
      if (m) knownPaths.add(m[1])
    }
  }

  const missing = files
    .filter((f) => !knownPaths.has(f.key))
    .sort((a, b) => String(a.lastModified).localeCompare(String(b.lastModified)))

  console.log(`待同步: ${missing.length}`)
  if (!missing.length) {
    console.log('已全部同步，无需操作')
    return
  }

  const documents = []
  for (const file of missing) {
    const cloudPath = file.key
    let id = idFromKey(cloudPath)
    while (knownIds.has(id)) id = makeId(cloudPath + id)

    const createdAt = file.lastModified
      ? new Date(file.lastModified).toISOString()
      : new Date().toISOString()

    documents.push({
      _id: id,
      id,
      name: '新人精选',
      caption: '',
      width: DEFAULT_W,
      height: DEFAULT_H,
      likes: 0,
      mime: mimeFromExt(extname(cloudPath)),
      fileID: toFileId(cloudPath),
      cloudPath,
      createdAt,
      syncedFromStorage: true
    })
    knownIds.add(id)
    knownPaths.add(cloudPath)
  }

  const CHUNK = 25
  let written = 0
  for (let n = 0; n < documents.length; n += CHUNK) {
    const slice = documents.slice(n, n + CHUNK)
    const result = insertBatch(slice)
    written += slice.length
    const nVal = Array.isArray(result)
      ? result[0]?.n?.$numberInt || result[0]?.n || slice.length
      : slice.length
    console.log(`写入批次 ${Math.floor(n / CHUNK) + 1}: ${slice.length} 条 (n=${nVal})`)
  }

  console.log(`\n同步完成：新增 ${written} 条，数据库预计共 ${docs.length + written} 条`)
  console.log('刷新请柬图片墙或管理后台即可看到新图。')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
