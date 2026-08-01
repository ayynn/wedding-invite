# GMY &amp; WJ 婚礼邀请函（Vue3 + TypeScript + Vite）

> 上海阿丽那野奢度假庄园 · 2026.10.18 · 吴极 & 高旻洋

面向移动端的婚礼邀请函 Web 应用：封面动效、花瓣 / 萤火虫粒子、实时倒计时、场地实景画廊（灯箱）、**宾客图片墙（PhotoSwipe 预览）**、婚礼流程时间轴、温馨提示、RSVP 表单与 BGM 配乐（Web Audio 合成兜底）。

**部署**：腾讯云 CloudBase（静态托管 + 云函数 + NoSQL），RSVP 与图片墙走同域 API。

## 技术栈

- **前端**：Vue 3（Composition API + `<script setup>`）、TypeScript（strict）、Vite 6、PhotoSwipe 5（图片预览）、pnpm
- **后端**：腾讯云 CloudBase 云函数 + NoSQL（见 `cloudbase/`）

## 快速开始

```bash
pnpm install          # 安装依赖

pnpm dev              # 本地开发（http://localhost:5173）
pnpm typecheck        # 前端类型检查
pnpm build            # 生产构建（输出 dist/）
pnpm preview          # 预览生产产物
```

## 本地联调（含后端模拟）

无需云环境即可本地验证前后端交互（RSVP、图片墙上传/预览）：

```bash
pnpm build
node scripts/mock-server.mjs 8788
# 访问 http://localhost:8788 —— 静态页 + 模拟 API 全可用
```

## 目录结构

```
wedding-invite/
├── index.html                     # 入口 HTML
├── vite.config.ts                 # Vite 配置
├── cloudbaserc.json               # ★ CloudBase 环境配置
├── tsconfig*.json                 # TS 工程引用
├── public/
│   ├── imgs/                      # 场地实景图（13 张）
│   └── audio/bgm.mp3              # 配乐「梶浦由記 - Palpitation!」
├── cloudbase/functions/           # ★ CloudBase 云函数（后端）
│   └── wedding-api/               # RSVP / 图片墙 API
├── scripts/
│   ├── deploy-cloudbase.mjs       # CloudBase 一键部署
│   └── mock-server.mjs            # 本地模拟后端（联调用）
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
- 数据经 `POST /api/wall` 写入后端，图片通过 `/wall/:id` 惰性加载

## 内容定制

业务内容全部集中在 `src/config/wedding.ts`：新人、花体 Logo（分段）、婚期、场地、爱情故事、画廊、图片墙、流程、温馨提示、配乐、API 端点。

## 部署（腾讯云 CloudBase）

### 1. 前置

- 已安装并登录 CloudBase CLI：`tcb login`
- 将 `cloudbaserc.json` 中的 `envId` 设为真实环境 ID（或设置环境变量 `TCB_ENV_ID`）

### 2. 部署

```bash
pnpm deploy
# 或: pnpm deploy:cloudbase
```

脚本会构建前端、部署云函数 `wedding-api`、配置 HTTP 路由、初始化集合并上传静态托管。
