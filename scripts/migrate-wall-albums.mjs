/**
 * 将现有 wall 记录标记为婚纱照鉴赏（album=portrait）。
 * 用户说明：当前相册里实际都是婚纱照，需与后续宾客活动照区分。
 *
 * 用法：node scripts/migrate-wall-albums.mjs
 * 前置：已 tcb login
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ENV_ID = process.env.TCB_ENV_ID || 'wedding-invite-d9gdvtmrr73ff6b75'
const TCB_BIN = existsSync('D:/nvm/node_global/node_modules/@cloudbase/cli/bin/tcb')
  ? 'D:/nvm/node_global/node_modules/@cloudbase/cli/bin/tcb'
  : null

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
  return parseJsonPayload(tcb(['db', 'nosql', 'execute', '-e', ENV_ID, '--command', payload]))
}

function listWall() {
  const res = nosql({
    TableName: 'wall',
    CommandType: 'QUERY',
    Command: JSON.stringify({ find: 'wall', limit: 1000 })
  })
  return Array.isArray(res) ? res : []
}

function docId(doc) {
  return String(doc._id || doc.id || '')
}

async function main() {
  console.log(`[migrate] env=${ENV_ID}`)
  const docs = listWall()
  console.log(`[migrate] 读取 wall 记录 ${docs.length} 条`)

  let marked = 0
  let skipped = 0
  let removedInit = 0

  for (const doc of docs) {
    const id = docId(doc)
    if (!id) {
      skipped += 1
      continue
    }

    if (doc._init || (!doc.fileID && !doc.cloudPath && !doc.name)) {
      try {
        nosql({
          TableName: 'wall',
          CommandType: 'DELETE',
          Command: JSON.stringify({ delete: 'wall', deletes: [{ q: { _id: id }, limit: 1 }] })
        })
        removedInit += 1
        console.log(`[migrate] 删除占位文档 ${id}`)
      } catch (err) {
        console.warn(`[migrate] 删除占位失败 ${id}:`, err.message || err)
      }
      continue
    }

    if (doc.album === 'portrait') {
      skipped += 1
      continue
    }

    nosql({
      TableName: 'wall',
      CommandType: 'UPDATE',
      Command: JSON.stringify({
        update: 'wall',
        updates: [
          {
            q: { _id: id },
            u: {
              $set: {
                album: 'portrait',
                name: doc.name || '新人精选'
              }
            },
            multi: false
          }
        ]
      })
    })
    marked += 1
    if (marked % 10 === 0) console.log(`[migrate] 已标记 ${marked} …`)
  }

  console.log(
    `\n[migrate] 完成：标记 portrait=${marked}，跳过=${skipped}，删除占位=${removedInit}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
