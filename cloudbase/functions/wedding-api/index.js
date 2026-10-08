/**
 * CloudBase 云函数：RSVP + 图片墙 + 宾客身份
 * 通过 HTTP 网关挂载 /api/rsvp、/api/wall、/api/guest、/wall/*
 */
const cloud = require('@cloudbase/node-sdk')

const MAX_IMG_BYTES = 3 * 1024 * 1024
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function getApp() {
  return cloud.init({ env: cloud.SYMBOL_CURRENT_ENV })
}

function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
    body: JSON.stringify(data)
  }
}

function binary(buf, mime) {
  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      'Content-Type': mime || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...CORS
    },
    body: Buffer.from(buf).toString('base64')
  }
}

function notFound() {
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS },
    body: 'Not Found'
  }
}

/** CloudBase / Mongo 文档不能通过 set/update 改写 _id */
function withoutDocId(doc) {
  if (!doc || typeof doc !== 'object') return {}
  const { _id, ...rest } = doc
  return rest
}

function getPath(event) {
  const raw =
    event.path ||
    event.requestContext?.path ||
    event.requestContext?.http?.path ||
    event.url ||
    '/'
  try {
    if (raw.startsWith('http')) return new URL(raw).pathname
  } catch {
    /* ignore */
  }
  return raw.split('?')[0] || '/'
}

function getQuery(event) {
  if (event.queryStringParameters && typeof event.queryStringParameters === 'object') {
    return event.queryStringParameters
  }
  const raw =
    event.path ||
    event.requestContext?.path ||
    event.requestContext?.http?.path ||
    event.url ||
    ''
  try {
    const u = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'http://local')
    return Object.fromEntries(u.searchParams.entries())
  } catch {
    return {}
  }
}

function getMethod(event) {
  return (
    event.httpMethod ||
    event.requestContext?.httpMethod ||
    event.requestContext?.http?.method ||
    event.method ||
    'GET'
  ).toUpperCase()
}

function parseBody(event) {
  let raw = event.body
  if (raw == null || raw === '') return null
  if (event.isBase64Encoded && typeof raw === 'string') {
    raw = Buffer.from(raw, 'base64').toString('utf8')
  }
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function mimeToExt(mime) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

function normalizeRsvp(body, id, prev = {}) {
  return {
    id,
    name: (body.name ?? prev.name ?? '').toString().trim().slice(0, 40),
    phone: (body.phone ?? prev.phone ?? '').toString().slice(0, 30),
    num: (body.num ?? prev.num ?? '').toString().slice(0, 10),
    attend: (body.attend ?? prev.attend) === 'no' ? 'no' : 'yes',
    msg: (body.msg ?? prev.msg ?? '').toString().slice(0, 300),
    time: body.time ?? prev.time ?? new Date().toISOString()
  }
}

async function listRsvp(db, nameFilter) {
  const { data } = await db.collection('rsvp').limit(1000).get()
  let items = data || []
  if (nameFilter) {
    const target = nameFilter.trim()
    items = items.filter((r) => (r.name || '').trim() === target)
  }
  return json(items)
}

async function createRsvp(db, body) {
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return json({ ok: false, error: '缺少姓名' }, 400)
  }
  const id = makeId()
  const record = normalizeRsvp(body, id)
  await db.collection('rsvp').doc(id).set(record)
  return json({ ok: true, id })
}

async function updateRsvp(db, id, body) {
  if (!id) return json({ ok: false, error: '缺少 id' }, 400)
  const { data } = await db.collection('rsvp').doc(id).get()
  const prev = Array.isArray(data) ? data[0] : data
  if (!prev) return json({ ok: false, error: '记录不存在' }, 404)
  if (body?.name != null && !String(body.name).trim()) {
    return json({ ok: false, error: '缺少姓名' }, 400)
  }
  const record = normalizeRsvp(body || {}, id, prev)
  await db.collection('rsvp').doc(id).set(record)
  return json({ ok: true, id })
}

async function deleteRsvp(db, id) {
  if (!id) return json({ ok: false, error: '缺少 id' }, 400)
  await db.collection('rsvp').doc(id).remove()
  return json({ ok: true, id })
}

async function listWall(db) {
  let data = []
  try {
    ;({ data } = await db.collection('wall').orderBy('createdAt', 'desc').limit(500).get())
  } catch {
    ;({ data } = await db.collection('wall').limit(500).get())
  }
  const items = (data || [])
    .map((meta) => ({
      id: meta.id || meta._id,
      name: meta.name,
      caption: meta.caption,
      url: `/wall/${meta.id || meta._id}`,
      width: meta.width,
      height: meta.height,
      likes: Math.max(0, Number(meta.likes) || 0),
      createdAt: meta.createdAt
    }))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  return json(items)
}

async function parseImageUpload(body) {
  if (typeof body.image !== 'string' || !body.image.startsWith('data:image')) {
    return { error: '缺少图片数据' }
  }
  const [header, b64] = body.image.split(',')
  const mime = header.replace('data:', '').replace(';base64', '') || 'image/jpeg'
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
    return { error: '仅支持 JPG / PNG / WebP' }
  }
  if (Math.round((b64?.length || 0) * 0.75) > MAX_IMG_BYTES) {
    return { error: '图片过大' }
  }
  return { mime, b64 }
}

async function createWall(app, db, body) {
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return json({ ok: false, error: '缺少昵称' }, 400)
  }
  const parsed = await parseImageUpload(body)
  if (parsed.error) return json({ ok: false, error: parsed.error }, 400)

  const id = makeId()
  const createdAt = new Date().toISOString()
  const ext = mimeToExt(parsed.mime)
  const cloudPath = `wall/${id}.${ext}`

  const upload = await app.uploadFile({
    cloudPath,
    fileContent: Buffer.from(parsed.b64, 'base64')
  })
  if (!upload.fileID) {
    return json({ ok: false, error: '图片上传失败' }, 500)
  }

  const meta = {
    id,
    name: body.name.trim().slice(0, 20),
    caption: (body.caption ?? '').trim().slice(0, 60),
    width: Math.max(1, Math.round(body.width ?? 1280)),
    height: Math.max(1, Math.round(body.height ?? 853)),
    likes: 0,
    mime: parsed.mime,
    fileID: upload.fileID,
    cloudPath,
    createdAt
  }
  await db.collection('wall').doc(id).set(meta)
  return json({ ok: true, id })
}

async function likeWall(db, id) {
  if (!id) return json({ ok: false, error: '缺少 id' }, 400)
  const { data } = await db.collection('wall').doc(id).get()
  const prev = Array.isArray(data) ? data[0] : data
  if (!prev) return json({ ok: false, error: '记录不存在' }, 404)
  const likes = Math.max(0, Number(prev.likes) || 0) + 1
  await db.collection('wall').doc(id).update({ likes })
  return json({ ok: true, id, likes })
}

async function updateWall(app, db, id, body) {
  if (!id) return json({ ok: false, error: '缺少 id' }, 400)
  const { data } = await db.collection('wall').doc(id).get()
  const prev = Array.isArray(data) ? data[0] : data
  if (!prev) return json({ ok: false, error: '记录不存在' }, 404)

  const nextName = body?.name != null ? String(body.name).trim().slice(0, 20) : prev.name
  if (!nextName) return json({ ok: false, error: '缺少昵称' }, 400)

  const meta = {
    ...withoutDocId(prev),
    id,
    name: nextName,
    caption:
      body?.caption != null ? String(body.caption).trim().slice(0, 60) : prev.caption || '',
    width: body?.width != null ? Math.max(1, Math.round(body.width)) : prev.width,
    height: body?.height != null ? Math.max(1, Math.round(body.height)) : prev.height
  }

  if (body?.image) {
    const parsed = await parseImageUpload(body)
    if (parsed.error) return json({ ok: false, error: parsed.error }, 400)
    const ext = mimeToExt(parsed.mime)
    const cloudPath = `wall/${id}.${ext}`
    const upload = await app.uploadFile({
      cloudPath,
      fileContent: Buffer.from(parsed.b64, 'base64')
    })
    if (!upload.fileID) return json({ ok: false, error: '图片上传失败' }, 500)
    if (prev.fileID && prev.fileID !== upload.fileID) {
      try {
        await app.deleteFile({ fileList: [prev.fileID] })
      } catch {
        /* ignore old file cleanup failure */
      }
    }
    meta.mime = parsed.mime
    meta.fileID = upload.fileID
    meta.cloudPath = cloudPath
  }

  await db.collection('wall').doc(id).set(meta)
  return json({ ok: true, id })
}

async function deleteWall(app, db, id) {
  if (!id) return json({ ok: false, error: '缺少 id' }, 400)
  const { data } = await db.collection('wall').doc(id).get()
  const meta = Array.isArray(data) ? data[0] : data
  if (meta?.fileID) {
    try {
      await app.deleteFile({ fileList: [meta.fileID] })
    } catch {
      /* ignore */
    }
  }
  await db.collection('wall').doc(id).remove()
  return json({ ok: true, id })
}

async function getWallImage(app, db, id) {
  if (!id) return notFound()
  const { data } = await db.collection('wall').doc(id).get()
  const meta = Array.isArray(data) ? data[0] : data
  if (!meta?.fileID) return notFound()

  const file = await app.downloadFile({ fileID: meta.fileID })
  if (!file.fileContent) return notFound()
  return binary(file.fileContent, meta.mime || 'image/jpeg')
}

function normalizePhone(raw) {
  return String(raw || '')
    .replace(/\s+/g, '')
    .replace(/^\+86/, '')
    .slice(0, 20)
}

function isValidPhone(phone) {
  return /^1\d{10}$/.test(phone)
}

function normalizeGuestName(raw) {
  return String(raw || '')
    .trim()
    .slice(0, 40)
}

function guestPublic(record) {
  return {
    ok: true,
    uuid: record.uuid,
    name: record.name,
    phone: record.phone,
    registered: true,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }
}

async function findGuestByPhone(db, phone) {
  try {
    const { data } = await db.collection('guest').where({ phone }).limit(5).get()
    const items = data || []
    return items[0] || null
  } catch {
    const { data } = await db.collection('guest').limit(500).get()
    return (data || []).find((g) => g.phone === phone) || null
  }
}

async function getGuestByUuid(db, uuid) {
  if (!uuid) return null
  const { data } = await db.collection('guest').doc(uuid).get()
  const doc = Array.isArray(data) ? data[0] : data
  return doc || null
}

async function bindGuest(db, body) {
  const uuid = String(body?.uuid || '').trim().slice(0, 64)
  const name = normalizeGuestName(body?.name)
  const phone = normalizePhone(body?.phone)

  if (!uuid) return json({ ok: false, error: '缺少身份标识' }, 400)
  if (!name) return json({ ok: false, error: '请填写姓名' }, 400)
  if (!isValidPhone(phone)) return json({ ok: false, error: '请填写有效的手机号' }, 400)

  const byPhone = await findGuestByPhone(db, phone)
  if (byPhone && byPhone.uuid && byPhone.uuid !== uuid) {
    return json(
      { ok: false, error: '该手机号已登记，请使用姓名与手机号登录召回' },
      409
    )
  }

  const prev = (await getGuestByUuid(db, uuid)) || byPhone
  const now = new Date().toISOString()
  const record = {
    uuid,
    name,
    phone,
    registered: true,
    createdAt: prev?.createdAt || now,
    updatedAt: now
  }
  await db.collection('guest').doc(uuid).set(record)
  return json(guestPublic(record))
}

async function loginGuest(db, body) {
  const name = normalizeGuestName(body?.name)
  const phone = normalizePhone(body?.phone)

  if (!name) return json({ ok: false, error: '请填写姓名' }, 400)
  if (!isValidPhone(phone)) return json({ ok: false, error: '请填写有效的手机号' }, 400)

  const found = await findGuestByPhone(db, phone)
  if (!found || !found.uuid) {
    return json({ ok: false, error: '未找到该登记信息，请先完善资料' }, 404)
  }
  if (normalizeGuestName(found.name) !== name) {
    return json({ ok: false, error: '姓名与手机号不匹配' }, 403)
  }
  return json(guestPublic(found))
}

exports.main = async (event) => {
  const method = getMethod(event)
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  const path = getPath(event)
  const app = getApp()
  const db = app.database()

  try {
    const wallLike = path.match(/\/api\/wall\/([^/]+)\/like\/?$/)
    if (wallLike) {
      const id = decodeURIComponent(wallLike[1])
      if (method === 'POST') return await likeWall(db, id)
      return json({ ok: false, error: 'Method Not Allowed' }, 405)
    }

    const rsvpItem = path.match(/\/api\/rsvp\/([^/]+)\/?$/)
    if (rsvpItem) {
      const id = decodeURIComponent(rsvpItem[1])
      if (method === 'PUT') return await updateRsvp(db, id, parseBody(event))
      if (method === 'DELETE') return await deleteRsvp(db, id)
      return json({ ok: false, error: 'Method Not Allowed' }, 405)
    }

    if (path === '/api/rsvp' || path.endsWith('/api/rsvp')) {
      if (method === 'GET') {
        const query = getQuery(event)
        return await listRsvp(db, query.name)
      }
      if (method === 'POST') return await createRsvp(db, parseBody(event))
      return json({ ok: false, error: 'Method Not Allowed' }, 405)
    }

    const wallItem = path.match(/\/api\/wall\/([^/]+)\/?$/)
    if (wallItem) {
      const id = decodeURIComponent(wallItem[1])
      if (method === 'PUT') return await updateWall(app, db, id, parseBody(event))
      if (method === 'DELETE') return await deleteWall(app, db, id)
      return json({ ok: false, error: 'Method Not Allowed' }, 405)
    }

    if (path === '/api/wall' || path.endsWith('/api/wall')) {
      if (method === 'GET') return await listWall(db)
      if (method === 'POST') return await createWall(app, db, parseBody(event))
      return json({ ok: false, error: 'Method Not Allowed' }, 405)
    }

    if (path === '/api/guest/bind' || path.endsWith('/api/guest/bind')) {
      if (method === 'POST') return await bindGuest(db, parseBody(event))
      return json({ ok: false, error: 'Method Not Allowed' }, 405)
    }

    if (path === '/api/guest/login' || path.endsWith('/api/guest/login')) {
      if (method === 'POST') return await loginGuest(db, parseBody(event))
      return json({ ok: false, error: 'Method Not Allowed' }, 405)
    }

    const wallMatch = path.match(/\/wall\/([^/]+)\/?$/)
    if (wallMatch && method === 'GET') {
      return await getWallImage(app, db, decodeURIComponent(wallMatch[1]))
    }

    return notFound()
  } catch (err) {
    console.error('wedding-api error', err)
    return json({ ok: false, error: err?.message || '服务器错误' }, 500)
  }
}
