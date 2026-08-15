import type { WeddingConfig } from '@/types';

/**
 * 婚礼邀请函配置中心
 * 新人信息 / 日期 / 场地 / 流程 / 温馨提示 / 配乐 / RSVP 接口
 * 修改本文件即可完成大部分内容定制，无需改动组件。
 */
export const weddingConfig: WeddingConfig = {
  couple: {
    groom: {
      initial: 'WJ',
      name: '吴极',
      nameSpaced: '吴 极',
      motto: '沉稳如林 · 温柔似风',
    },
    bride: {
      initial: 'GMY',
      name: '高旻洋',
      nameSpaced: '高 旻 洋',
      motto: '明媚如光 · 温婉若溪',
    },
    logoParts: ['GMY', '&', 'WJ'],
    names: '吴极 · 高旻洋',
  },

  weddingDate: '2026-10-18T14:00:00+08:00',
  dateText: '2026 · 10 · 18  星期日',
  dateSubText: '2026年10月18日 星期日 · 宜嫁娶',

  venue: {
    name: '上海 · 阿丽那野奢度假庄园',
    address: '上海浦东新区笋王路168号',
    mapUrl:
      'https://apis.map.qq.com/uri/v1/geocoder?coord=31.011364,121.663706&referer=wedding',
    transitHint: '距新场地铁站约 5.8 公里，建议自驾或拼车前往。',
  },

  loveStory: [
    '从青涩初见，到余生有约。',
    '我们决定，把往后所有的春夏秋冬，都交给彼此。',
    '诚邀您见证我们的誓言，共享这一场森林中的浪漫。',
  ],

  /**
   * 婚纱照素材（public/imgs/portrait/ 下，白色影棚）
   * 建议尺寸：人像 3:4 约 960×1280，单张 300KB–1MB
   */
  portraits: {
    cover: '/imgs/portrait/cover.jpg',
    groom: '/imgs/portrait/groom.jpg',
    bride: '/imgs/portrait/bride.jpg',
    formal: '/imgs/portrait/couple-formal.jpg',
    art: '/imgs/portrait/couple-art.jpg',
    finale: '/imgs/portrait/couple-formal.jpg',
  },

  portraitStories: {
    formal: {
      en: 'Us, Together',
      cn: '并肩而立',
      sub: '一袭白纱，一身素礼，从此并肩',
      caption: '白色影棚 · 正式合影',
    },
    art: {
      en: 'Quiet Moments',
      cn: '静好时光',
      sub: '依偎之间，是我们最自在的模样',
      caption: '白色影棚 · 依偎静好',
    },
  },

  gallery: [
    {
      src: '/imgs/venue_01.jpg',
      caption: '梦幻池畔 · 婚礼仪式区',
      span: 'g-1',
    },
    { src: '/imgs/venue_10.jpg', caption: '玻璃花房 · 浪漫迎宾', span: 'g-2' },
    { src: '/imgs/venue_09.jpg', caption: '大客厅 · 宴客厅', span: 'g-2' },
    { src: '/imgs/venue_11.jpg', caption: '水镜凉亭 · 誓言之地', span: 'g-2' },
    { src: '/imgs/venue_14.jpg', caption: '客房一隅 · 森居静好', span: 'g-2' },
    { src: '/imgs/venue_23.jpg', caption: '森林泳池 · 白帐午后', span: 'g-2' },
    { src: '/imgs/venue_24.jpg', caption: '开放厨房 · 石台暖光', span: 'g-2' },
    { src: '/imgs/venue_18.jpg', caption: '玻璃花房内景', span: 'g-2' },
    { src: '/imgs/venue_33.jpg', caption: '庄园黄昏 · 灯火可亲', span: 'g-1' },
  ],

  schedule: [
    {
      time: '14:00',
      title: '庄园迎宾 · 自由打卡',
      desc: '森林草坪、景观泳池与玻璃花房已备好茶歇，欢迎提前到场，留下最美合影。',
    },
    {
      time: '16:08',
      title: '草坪仪式',
      desc: '在绿意与阳光之间，交换誓言，许下此生之约。',
    },
    {
      time: '17:30',
      title: '合影时光',
      desc: '与新人同框，将这一刻定格成永恒。',
    },
    {
      time: '18:18',
      title: '晚宴 · 玻璃星空厅',
      desc: '灯火与星光交织，举杯共庆，感谢每一份祝福。',
    },
    {
      time: '20:30',
      title: 'after party · 泳池星光',
      desc: '音乐、篝火与星光，把美好延续到夜深。',
    },
  ],

  tips: [
    {
      icon: 'location',
      title: '交通出行',
      desc: '导航至「上海阿丽那野奢度假庄园」（浦东新区笋王路168号）。距新场地铁站约 5.8 公里，建议自驾或拼车前往。',
    },
    {
      icon: 'home',
      title: '住宿安排',
      desc: '庄园提供森林木屋与景观客房，外埠亲友如需住宿请提前告知，我们为您预留房间。',
    },
    {
      icon: 'attire',
      title: '着装建议',
      desc: '户外草坪与池畔场景较多，建议着装轻盈舒适，浅色系与庄园更配哦。',
    },
    {
      icon: 'camera',
      title: '留影分享',
      desc: '婚礼当天请打开现场互动页，把镜头里的美好瞬间上传到照片墙，与大家一起分享。',
    },
    {
      icon: 'love',
      title: '宠物友好',
      desc: '庄园欢迎毛孩子同行，请牵好牵引绳，共同守护这份自然之美。',
    },
    {
      icon: 'phone',
      title: '联系我们',
      desc: '有任何疑问请联系我们：吴极 150-218-29298 / 高旻洋 159-0009-55906',
    },
  ],

  bgm: {
    src: '/audio/bgm.mp3',
    title: 'Palpitation!',
    artist: '梶浦由記',
    volume: 0.5,
  },

  /**
   * API 端点
   * CloudBase 同域部署：使用相对路径即可
   * 独立部署后端时改为绝对地址
   */
  api: {
    rsvpEndpoint: '/api/rsvp',
    wallEndpoint: '/api/wall',
  },

  /** 图片墙（婚礼现场互动页 /live/wall） */
  wall: {
    title: '爱的瞬间',
    en: 'Photo Wall',
    sub: '婚礼现场 · 把你们镜头里的美好，留在这面墙上',
    maxSize: 1280,
    /** 与云函数 MAX_IMG_BYTES 对齐；base64 膨胀后仍需落在 SCF 非文本 6MB 内 */
    maxBytes: 3 * 1024 * 1024,
  },

  /**
   * 分享给朋友（微信内引导右上角菜单；站外优先系统分享 / 复制链接 / 二维码）
   * 微信链接卡片图：依赖 index.html / applyShareMeta 的 og:image（绝对 HTTPS）。
   * 页面已打开后由 JS 定制分享卡需公众号 JS-SDK，本项目未接入。
   */
  share: {
    url: 'https://wedding-invite-d9gdvtmrr73ff6b75-1461874135.ap-shanghai.app.tcloudbase.com',
    title: 'GMY & WJ · 我们结婚啦',
    text: '吴极 & 高旻洋 婚礼邀请 · 2026.10.18 · 上海阿丽那野奢度假庄园',
    /** 运行 pnpm share:qr 可重新生成 public/share/og-cover.png */
    image: '/share/og-cover.png',
    qrImage: '/share/invite-card.png',
  },
};
