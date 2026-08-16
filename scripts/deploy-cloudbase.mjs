/**
 * CloudBase 一键部署：
 * 1. 构建前端 dist
 * 2. 部署云函数 wedding-api
 * 3. 创建/修复 HTTP 网关路由（含路径透传、`/` → 静态托管）
 * 4. 初始化 NoSQL 集合（rsvp / wall）
 * 5. 上传静态托管
 *
 * 前置：tcb login；cloudbaserc.json 中 envId 已替换为真实环境 ID
 */
import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const rcPath = resolve(root, 'cloudbaserc.json')

const tcbBin = existsSync('D:/nvm/node_global/node_modules/@cloudbase/cli/bin/tcb')
  ? 'D:/nvm/node_global/node_modules/@cloudbase/cli/bin/tcb'
  : null

function fail(msg) {
  console.error(`\n[deploy:cloudbase] ${msg}\n`)
  process.exit(1)
}

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}\n`)
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    ...opts
  })
  if (r.status !== 0) fail(`命令失败: ${cmd} ${args.join(' ')}`)
}

function tryRun(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(' ')}\n`)
  return spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true })
}

/** 避免 Windows shell 吃掉 JSON 引号 */
function runTcbArgs(args, { confirm = false, optional = false } = {}) {
  const useNode = Boolean(tcbBin)
  const cmd = useNode ? process.execPath : 'tcb'
  const fullArgs = useNode ? [tcbBin, ...args] : args
  console.log(`\n> tcb ${args.join(' ')}\n`)
  const r = spawnSync(cmd, fullArgs, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    input: confirm ? 'Y\n' : undefined
  })
  if (r.stdout) process.stdout.write(r.stdout)
  if (r.stderr) process.stderr.write(r.stderr)
  if (r.error) {
    if (optional) {
      console.warn(`[deploy:cloudbase] 可选步骤失败: ${r.error.message}`)
      return r
    }
    fail(r.error.message)
  }
  if (r.status !== 0 && !optional) fail(`tcb 命令失败: ${args.join(' ')}`)
  return r
}

if (!existsSync(rcPath)) fail('缺少 cloudbaserc.json')

const rc = JSON.parse(readFileSync(rcPath, 'utf8'))
const envId = process.env.TCB_ENV_ID || rc.envId
if (!envId || envId === 'YOUR_ENV_ID') {
  fail(
    '请先在腾讯云创建 CloudBase 免费环境，并将 cloudbaserc.json 的 envId 改为真实环境 ID（或设置环境变量 TCB_ENV_ID）'
  )
}

const tcbCheck = spawnSync('tcb', ['-v'], { shell: true, encoding: 'utf8' })
if (tcbCheck.status !== 0) {
  fail('未检测到 tcb CLI，请先执行: npm i -g @cloudbase/cli && tcb login')
}

run('pnpm', ['run', 'build:web'])

const fnPkg = resolve(root, 'cloudbase/functions/wedding-api')
run('pnpm', ['install', '--dir', fnPkg, '--prod'])

run('tcb', ['fn', 'deploy', 'wedding-api', '-e', envId, '--force', '--yes'])

const paths = [
  { path: 'api/rsvp', name: '/api/rsvp' },
  { path: 'api/wall', name: '/api/wall' },
  { path: 'wall', name: '/wall' }
]

for (const p of paths) {
  const r = tryRun('tcb', ['service', 'create', '-p', p.path, '-f', 'wedding-api', '-e', envId])
  if (r.status !== 0) {
    console.warn(`[deploy:cloudbase] 路由 ${p.name} 可能已存在，跳过创建`)
  }
}

runTcbArgs(
  [
    'routes',
    'edit',
    '-e',
    envId,
    '--data',
    JSON.stringify({
      domain: '*',
      routes: [
        { path: '/api/rsvp', enablePathTransmission: true },
        { path: '/api/wall', enablePathTransmission: true },
        { path: '/wall', enablePathTransmission: true }
      ]
    })
  ],
  { confirm: true, optional: true }
)

runTcbArgs(
  [
    'routes',
    'add',
    '-e',
    envId,
    '--data',
    JSON.stringify({
      domain: '*',
      routes: [
        {
          path: '/',
          upstreamResourceType: 'STATIC_STORE',
          upstreamResourceName: 'staticstore',
          enable: true
        }
      ]
    })
  ],
  { confirm: true, optional: true }
)

for (const name of ['rsvp', 'wall']) {
  runTcbArgs(
    [
      'db',
      'nosql',
      'execute',
      '-e',
      envId,
      '--command',
      JSON.stringify([
        {
          TableName: name,
          CommandType: 'INSERT',
          Command: JSON.stringify({
            insert: name,
            documents: [{ _init: true, createdAt: new Date().toISOString() }]
          })
        }
      ])
    ],
    { optional: true }
  )
}

run('tcb', ['hosting', 'deploy', 'dist', '-e', envId])

/**
 * CloudBase 静态托管未配置错误文档时，SPA 深链会 404。
 * 为已知前端路由补传 index.html，保证刷新/直达可用。
 */
const spaFallbackRoutes = [
  'live/index.html',
  'live/wall/index.html',
  'live/guide/index.html',
  'live/portraits/index.html',
  'live/lottery/index.html',
  'live/games/index.html',
  'live/moments/index.html',
  'admin/index.html',
  'admin/login/index.html',
  'admin/wall/index.html',
  'admin/rsvp/index.html'
]
const indexHtml = resolve(root, 'dist/index.html')
for (const cloudPath of spaFallbackRoutes) {
  const r = tryRun('tcb', ['hosting', 'deploy', indexHtml, cloudPath, '-e', envId])
  if (r.status !== 0) {
    console.warn(`[deploy:cloudbase] SPA 回退上传失败: ${cloudPath}`)
  }
}

const detail = spawnSync('tcb', ['hosting', 'detail', '-e', envId], {
  cwd: root,
  encoding: 'utf8',
  shell: true
})
const hostingMatch = detail.stdout?.match(/https:\/\/[^\s]+\.tcloudbaseapp\.com/)
const hosting = hostingMatch?.[0] || `(见 tcb hosting detail -e ${envId})`
const gatewayPrefix = hostingMatch?.[0]?.replace('https://', '').replace('.tcloudbaseapp.com', '')
const gateway = gatewayPrefix
  ? `https://${gatewayPrefix}.ap-shanghai.app.tcloudbase.com`
  : `https://${envId}.ap-shanghai.app.tcloudbase.com`

console.log(`
[deploy:cloudbase] 部署完成

统一默认域名（静态 + API，推荐）:
  ${gateway}

静态托管域名（仅前端，相对路径 API 不可用）:
  ${hosting}

HTTP 网关路由：
  /          → 静态网站托管
  /api/rsvp  → wedding-api（路径透传）
  /api/wall  → wedding-api（路径透传）
  /wall      → wedding-api（路径透传）

仍建议在控制台确认：
  1. 静态托管错误文档设为 index.html（SPA 回退）
  2. 数据库 rsvp / wall 安全规则（云函数走管理员权限即可）
`)
