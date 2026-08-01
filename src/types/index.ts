/** 全局业务类型定义 */

/** 新郎/新娘信息 */
export interface CoupleMember {
  /** 英文名 / 花体字标识 */
  initial: string
  /** 中文名 */
  name: string
  /** 中文名（带空格排版） */
  nameSpaced: string
  /** 简短描述 */
  motto: string
}

/** 场地信息 */
export interface Venue {
  /** 场地名 */
  name: string
  /** 完整地址 */
  address: string
  /** 地图链接（深链） */
  mapUrl: string
  /** 距离提示 */
  transitHint: string
}

/** 画廊图片项 */
export interface GalleryItem {
  /** 图片路径（public 下以 / 开头） */
  src: string
  /** 场景说明 */
  caption: string
  /** 网格布局类名 */
  span: 'g-1' | 'g-2'
}

/** 婚礼行程项 */
export interface ScheduleItem {
  time: string
  title: string
  desc: string
}

/** 温馨提示卡片 */
export interface TipItem {
  /** 图标类型（对应图标组件内 key） */
  icon: 'location' | 'home' | 'attire' | 'camera' | 'love' | 'phone'
  title: string
  desc: string
}

/** RSVP 表单负载 */
export interface RsvpPayload {
  name: string
  phone: string
  num: string
  attend: 'yes' | 'no'
  msg: string
  time: string
}

/** 图片墙上传负载 */
export interface WallUploadPayload {
  name: string
  caption: string
  /** base64 图片数据（data:image/...;base64,xxx） */
  image: string
  /** 压缩后图片宽高（PhotoSwipe 预览用） */
  width: number
  height: number
}

/** 图片墙条目（后端返回） */
export interface WallItem {
  id: string
  name: string
  caption: string
  /** 图片访问地址（相对 /wall/:id 或完整 URL） */
  url: string
  /** 原始图片宽高（PhotoSwipe 预览用） */
  width: number
  height: number
  createdAt: string
}

/** API 端点配置 */
export interface ApiConfig {
  /** RSVP 提交/查询接口 */
  rsvpEndpoint: string
  /** 图片墙接口 */
  wallEndpoint: string
}

/** 婚礼整体配置 */
export interface WeddingConfig {
  couple: {
    groom: CoupleMember
    bride: CoupleMember
    /** 封面 & 尾页花体 Logo 分段（用于对 & 单独样式化） */
    logoParts: string[]
    /** 新人落款 */
    names: string
  }
  /** 婚礼日期（本地时区） */
  weddingDate: string
  /** 日期展示文案 */
  dateText: string
  /** 农历/吉日提示 */
  dateSubText: string
  venue: Venue
  loveStory: string[]
  gallery: GalleryItem[]
  schedule: ScheduleItem[]
  tips: TipItem[]
  /** 配乐 */
  bgm: {
    src: string
    title: string
    artist: string
    /** 默认音量 0-1 */
    volume: number
  }
  /** API 端点（Cloudflare Pages Functions 同域部署用相对路径） */
  api: ApiConfig
  /** 图片墙 */
  wall: {
    title: string
    en: string
    sub: string
    /** 单张图片最大尺寸（长边 px，前端压缩用） */
    maxSize: number
    /** 单张图片最大体积（字节，超出提示） */
    maxBytes: number
  }
}
