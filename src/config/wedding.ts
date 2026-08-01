import type { WeddingConfig } from '@/types'

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
      motto: '沉稳如林 · 温柔似风'
    },
    bride: {
      initial: 'GMY',
      name: '高旻洋',
      nameSpaced: '高 旻 洋',
      motto: '明媚如光 · 温婉若溪'
    },
    logoParts: ['GMY', '&', 'WJ'],
    names: '吴极 · 高旻洋'
  },

  weddingDate: '2026-10-18T14:00:00+08:00',
  dateText: '2026 · 10 · 18  星期日',
  dateSubText: '2026年10月18日 星期日 · 宜嫁娶',

  venue: {
    name: '上海 · 阿丽那野奢度假庄园',
    address: '上海浦东新区笋王路168号',
    mapUrl: 'https://apis.map.qq.com/uri/v1/geocoder?coord=31.0289,121.5983&referer=wedding',
    transitHint: '距新场地铁站约 5.8 公里，建议自驾或拼车前往。'
  },

  loveStory: [
    '从青涩初见，到余生有约。',
    '我们决定，把往后所有的春夏秋冬，都交给彼此。',
    '诚邀您见证我们的誓言，共享这一场森林中的浪漫。'
  ],

  gallery: [
    { src: '/imgs/venue_01.jpg', caption: '梦幻池畔 · 婚礼仪式区', span: 'g-1' },
    { src: '/imgs/venue_02.jpg', caption: '森林泳池 · 倒影如画', span: 'g-2' },
    { src: '/imgs/venue_10.jpg', caption: '玻璃花房 · 浪漫迎宾', span: 'g-2' },
    { src: '/imgs/venue_09.jpg', caption: '大客厅 · 宴客厅', span: 'g-2' },
    { src: '/imgs/venue_06.jpg', caption: '黄昏下的玻璃屋', span: 'g-1' },
    { src: '/imgs/venue_11.jpg', caption: '水镜凉亭 · 誓言之地', span: 'g-2' },
    { src: '/imgs/venue_14.jpg', caption: '森林草坪 · 户外仪式', span: 'g-2' },
    { src: '/imgs/venue_23.jpg', caption: '室内长桌 · 亲友欢聚', span: 'g-2' },
    { src: '/imgs/venue_24.jpg', caption: '池畔休闲 · 星光晚宴', span: 'g-2' },
    { src: '/imgs/venue_31.jpg', caption: '木屋黄昏 · 静谧时光', span: 'g-1' },
    { src: '/imgs/venue_18.jpg', caption: '玻璃花房内景', span: 'g-2' },
    { src: '/imgs/venue_33.jpg', caption: '庄园夜色 · 灯火可亲', span: 'g-2' }
  ],

  schedule: [
    { time: '14:00', title: '庄园迎宾 · 自由打卡', desc: '森林草坪、景观泳池与玻璃花房已备好茶歇，欢迎提前到场，留下最美合影。' },
    { time: '16:08', title: '草坪仪式', desc: '在绿意与阳光之间，交换誓言，许下此生之约。' },
    { time: '17:30', title: '合影时光', desc: '与新人同框，将这一刻定格成永恒。' },
    { time: '18:18', title: '晚宴 · 玻璃星空厅', desc: '灯火与星光交织，举杯共庆，感谢每一份祝福。' },
    { time: '20:30', title: 'after party · 泳池星光', desc: '音乐、篝火与星光，把美好延续到夜深。' }
  ],

  tips: [
    { icon: 'location', title: '交通出行', desc: '导航至「上海阿丽那野奢度假庄园」（浦东新区笋王路168号）。距新场地铁站约 5.8 公里，建议自驾或拼车前往。' },
    { icon: 'home', title: '住宿安排', desc: '庄园提供森林木屋与景观客房，外埠亲友如需住宿请提前告知，我们为您预留房间。' },
    { icon: 'attire', title: '着装建议', desc: '户外草坪与池畔场景较多，建议着装轻盈舒适，浅色系与庄园更配哦。' },
    { icon: 'camera', title: '留影分享', desc: '欢迎把您镜头里的美好瞬间发给我们，也可现场扫二维码上传至共享相册。' },
    { icon: 'love', title: '宠物友好', desc: '庄园欢迎毛孩子同行，请牵好牵引绳，共同守护这份自然之美。' },
    { icon: 'phone', title: '联系我们', desc: '有任何疑问请联系我们：吴极 138-0000-0000 / 高旻洋 138-0000-0001' }
  ],

  bgm: {
    src: '/audio/bgm.mp3',
    title: 'Palpitation!',
    artist: '梶浦由記',
    volume: 0.5
  },

  /**
   * API 端点
   * Cloudflare Pages + Functions 同域部署：使用相对路径即可
   * 独立部署后端时改为绝对地址，如 https://your-worker.workers.dev/api/...
   */
  api: {
    rsvpEndpoint: '/api/rsvp',
    wallEndpoint: '/api/wall'
  },

  /** 图片墙 */
  wall: {
    title: '爱的瞬间',
    en: 'Photo Wall',
    sub: '把你们镜头里的美好，留在这面墙上',
    maxSize: 1280,
    maxBytes: 4 * 1024 * 1024
  }
}
