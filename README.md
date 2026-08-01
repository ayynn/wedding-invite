# GMY &amp; WJ 婚礼邀请函（Vue3 + TypeScript + Vite）

> 上海阿丽那野奢度假庄园 · 2026.10.18 · 吴极 & 高旻洋

面向移动端的婚礼邀请函 Web 应用：封面动效、花瓣 / 萤火虫粒子、实时倒计时、场地实景画廊（灯箱）、**宾客图片墙（PhotoSwipe 预览）**、婚礼流程时间轴、温馨提示、RSVP 表单与 BGM 配乐（Web Audio 合成兜底）。

**零成本全栈部署**：前端托管在 Cloudflare Pages，后端为 Pages Functions + KV（RSVP 收集 + 图片墙存储），免备案、国内可访问，无需自建服务器。

## 技术栈

- **前端**：Vue 3（Composition API + `<script setup>`）、TypeScript（strict）、Vite 6、PhotoSwipe 5（图片预览）、pnpm
- **后端**：Cloudflare Pages Functions（Workers 运行时）+ Workers KV（存储）

## 快速开始

```bash
pnpm install          # 安装依赖

pnpm dev              # 本地开发（http://localhost:5173）
pnpm typecheck        # 前端类型检查
pnpm build            # 生产构建（输出 dist/）
pnpm preview          # 预览生产产物
pnpm typecheck:functions  # 后端 Functions 类型检查
```

## 本地联调（含后端模拟）

无需 Cloudflare 环境即可本地验证前后端交互（RSVP、图片墙上传/预览）：

```bash
pnpm build
node scripts/mock-server.mjs 8788
# 访问 http://localhost:8788 —— 静态页 + 模拟 KV 的 API 全可用
```

## 目录结构

```
wedding-invite/
├── index.html                     # 入口 HTML
├── vite.config.ts                 # Vite 配置
├── wrangler.toml                  # ★ Cloudflare 部署配置（KV 绑定）
├── tsconfig*.json                 # TS 工程引用（含 functions 独立配置）
├── public/
│   ├── imgs/                      # 场地实景图（13 张）
│   └── audio/bgm.mp3              # 配乐「梶浦由記 - Palpitation!」
├── functions/                     # ★ Cloudflare Pages Functions（后端）
│   ├── _lib.ts                    # 共享类型 / 工具
│   ├── api/rsvp.ts                # GET/POST /api/rsvp
│   ├── api/wall.ts                # GET/POST /api/wall（图片墙）
│   └── wall/[id].ts               # GET /wall/:id（图片二进制读取）
├── scripts/mock-server.mjs        # 本地模拟后端（联调用）
└── src/
    ├── main.ts / App.vue
    ├── assets/css/main.css        # 全局主题
    ├── config/wedding.ts          # ★ 内容配置中心
    ├── types/index.ts             # 业务类型
    ├── api/client.ts              # 前端 API 封装（RSVP / 图片墙）
    ├── composables/               # useCountdown / useAudio / useParticles / useReveal
    └── components/                # Cover / Couple / Countdown / Gallery
        ├── PhotoWallSection.vue   # ★ 图片墙（上传 + 瀑布流 + PhotoSwipe）
        ├── Schedule / Tips(+TipIcon) / Rsvp / Finale / MusicButton / SectionTitle
```

## 图片墙（Photo Wall）

- 宾客填写昵称 + 选择照片（可选一句话）上传
- **前端 canvas 自动压缩**（最长边 1280px、JPEG 0.82），控制存储体积
- 瀑布流网格展示，hover 显示昵称与留言
- **PhotoSwipe 5** 全屏预览：点击缩放、滑动切换、捏合手势、键盘 ← → / Esc
- 数据经 `POST /api/wall` 存入 KV，图片通过 `/wall/:id` 惰性加载（元数据与图片分键存储）

## 内容定制

业务内容全部集中在 `src/config/wedding.ts`：新人、花体 Logo（分段）、婚期、场地、爱情故事、画廊、图片墙、流程、温馨提示、配乐、API 端点。

## 部署（Cloudflare Pages，免备案）

### 1. 前置

- 注册 [Cloudflare](https://dash.cloudflare.com)（免费）
- 本地已登录 wrangler：`npx wrangler login`

### 2. 创建 KV 命名空间

```bash
npx wrangler kv namespace create WEDDING_KV
# 输出包含 id: xxxxxxxxxxxxxxxx
```

将返回的 **id** 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "WEDDING_KV"
id = "xxxxxxxxxxxxxxxx"   # ← 替换
```

### 3. 部署

```bash
pnpm deploy
# 等价于: pnpm build && wrangler pages deploy dist --project-name wedding-invite
```

首次部署完成后，Cloudflare 会分配 `https://wedding-invite.pages.dev` 域名，国内可直接访问（免备案）。

### 4. 验证接口

```bash
curl https://wedding-invite.pages.dev/api/wall          # → []
curl -X POST https://wedding-invite.pages.dev/api/rsvp \
  -H 'Content-Type: application/json' \
  -d '{"name":"测试","attend":"yes","msg":"新婚快乐"}'
```

### 5. 绑定自定义域名（可选）

Pages 控制台 → Custom domains → 添加已备案域名（**未备案域名无法绑定**，但 `*.pages.dev` 默认域名本身免备案可用）。自定义域名建议同时开启 HTTPS。

## 免费额度（Cloudflare 免费计划）

| 资源 | 免费额度 | 本项目用量估算 |
|---|---|---|
| Pages 托管 | 无限带宽、500 次构建/月 | 少量 |
| Workers / Functions | 10 万请求/天 | 图片墙列表每人 1 请求 |
| KV | 读 10 万次/天、写 1000 次/天、存储 1GB | 每张压缩图 ~0.3MB，数千张内无忧 |

## 注意事项

- **KV 最终一致性**：图片上传后约 60 秒内全地域可见，婚礼现场属正常
- **KV 值上限 25MB**：前端已压缩图片至 ~1MB，安全
- **Pages Functions 与 KV 绑定**：`wrangler pages dev` 本地跑 Functions 时同样读取 `wrangler.toml`
- 若自定义域名未备案，请直接使用 `*.pages.dev` 默认域名，或改用香港轻量服务器方案
