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
  dateText: '2026.10.18 sunday',
  dateSubText: '2026年10月18日 星期日',

  venue: {
    name: '上海 · 阿丽那野奢度假庄园',
    engname: 'Alina Villa , Shanghai',
    address: '上海浦东新区笋王路168号',
    mapUrl:
      'https://apis.map.qq.com/uri/v1/geocoder?coord=31.011364,121.663706&referer=wedding',
    transitHint: '距新场地铁站约 5.8 公里，建议自驾或拼车前往。',
  },

  loveStory: [
    'Je voudrais remercier les femmes',
    'Et la mienne en particulier',
    'Tant de bonheur et quelques drames,',
    'Mais je ne suis que leur moitié',
    '',
    '我想感谢世间所有女性，',
    '尤其是属于我的那一位。',
    '喜乐相伴，偶有波折，',
    '而我，是你的另一半。',
    '',
    'Dans cette cérémonie étrange',
    'Où je suis nominé à vie',
    '',
    '在这场奇妙漫长的人生盛典，',
    '我获颁终身提名。',
    '',
    'And the winner is : la vie',
    "And the winner is : l'amour",
    '',
    '获奖者，是生活',
    '最终胜者，是爱意',
    '',
    'Je porte la main sur le cœur',
    'Et je vous salue encore une fois',
    '',
    '我将手抚于心口，',
    '再次向大家致意。',
  ],

  /**
   * 婚纱照素材（public/imgs/portrait/ 下，白色影棚）
   * 建议尺寸：人像 3:4 约 960×1280，封面背景长边约 1280，单张 300KB–1MB
   */
  portraits: {
    cover: '/imgs/portrait/cover-bg.jpg',
    intro: '/imgs/portrait/couple-intro.jpg',
    groom: '/imgs/portrait/groom.jpg',
    bride: '/imgs/portrait/bride.jpg',
    formal: '/imgs/portrait/couple-formal.jpg',
    finale: '/imgs/portrait/couple-finale.jpg',
  },

  portraitStories: {
    formal: {
      en: 'Till here, and for beyond',
      cn: '相逢此时，漫漫与共',
      sub: '在这场奇妙漫长的人生盛典，我获颁与你并肩的一生。',
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
    { src: '/imgs/venue_11.jpg', caption: '水镜凉亭 · 誓言之地', span: 'g-1' },
  ],

  schedule: [
    {
      time: '15:08',
      title: '宾客抵达 · Guest Arrival & Welcoming',
    },
    {
      time: '16:18',
      title: '水台仪式 · Ceremony',
    },
    {
      time: '16:58',
      title: '合影时间 · Photos',
    },
    {
      time: '17:58',
      title: '晚宴 · Dinner',
    },
    {
      time: '19:38',
      title: 'After Party · 派对',
    },
  ],

  tips: [
    {
      icon: 'location',
      title: '交通出行',
      desc: '导航至「上海阿丽那野奢度假庄园」\n（浦东新区笋王路168号）',
    },
    {
      icon: 'home',
      title: '住宿安排',
      desc: '外埠亲友如需住宿，我们为您安排住宿,请提前告知',
    },
    {
      icon: 'attire',
      title: '着装建议',
      desc: '户外草坪与池畔场景较多，建议莫兰迪/柔和色系',
    },
    {
      icon: 'phone',
      title: '联系我们',
      desc: '有任何疑问请联系我们',
    },
  ],

  bgm: {
    src: '/audio/bgm.mp3',
    title: "Jesu, Joy of Man's Desiring",
    artist: 'J.S. Bach',
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
    guestEndpoint: '/api/guest',
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
    url: 'https://wjgmywedding.cn',
    title: 'GMY & WJ · 我们结婚啦',
    text: '吴极 & 高旻洋 婚礼邀请 · 2026.10.18 · 上海阿丽那野奢度假庄园',
    /** 运行 pnpm share:qr 可重新生成 public/share/og-cover.jpg */
    image: '/share/og-cover.jpg',
    qrImage: '/share/invite-card.png',
  },
};
