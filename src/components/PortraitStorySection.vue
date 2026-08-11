<script setup lang="ts">
defineOptions({ name: 'portrait-story-section' })

withDefaults(
  defineProps<{
    src: string
    en: string
    cn: string
    sub: string
    caption: string
    /** formal 居中端正；art 偏移错落 */
    variant?: 'formal' | 'art'
    /** 深色底：艺术合照用墨蓝，衬托白色礼服 */
    tone?: 'light' | 'ink'
  }>(),
  { variant: 'formal', tone: 'light' }
)
</script>

<template>
  <section class="section story" :class="[variant, tone]">
    <span class="veil" aria-hidden="true"></span>

    <div class="wrap">
      <header class="head reveal">
        <p class="en">{{ en }}</p>
        <h2 class="cn">{{ cn }}</h2>
        <span class="orn" aria-hidden="true">❦</span>
        <p class="sub">{{ sub }}</p>
      </header>

      <figure class="frame reveal d1">
        <img class="glow" :src="src" alt="" aria-hidden="true" />
        <img class="main" :class="variant === 'art' ? 'soft-edge' : 'soft-edge-y'" :src="src" :alt="cn" loading="lazy" />
        <figcaption>{{ caption }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.story {
  padding-top: 96px;
  padding-bottom: 96px;
}
.story.light {
  background: linear-gradient(180deg, var(--cream) 0%, #faf8f4 50%, var(--cream) 100%);
}
.story.ink {
  /* 上下用渐变收口，避免与浅色区块硬切；正文区保持实色以保证文字可读 */
  background: linear-gradient(
    180deg,
    var(--cream) 0%,
    var(--ink-blue-deep) 11%,
    var(--ink-blue-deep) 89%,
    var(--cream) 100%
  );
  color: var(--gold-bright);
  padding-top: 128px;
  padding-bottom: 128px;
}

/* 顶底渐隐，避免与相邻区块硬切 */
.veil {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.story.ink .veil {
  background: radial-gradient(120% 70% at 50% 42%, rgba(89, 110, 142, 0.42), transparent 68%);
}
.story.light .veil {
  background: radial-gradient(110% 66% at 50% 46%, rgba(65, 83, 110, 0.09), transparent 70%);
}

.head {
  text-align: center;
}
.en {
  font-family: var(--font-script);
  font-size: clamp(34px, 6.4vw, 54px);
  line-height: 1.15;
  color: var(--gold);
}
.story.ink .en {
  color: var(--gold-light);
}
.cn {
  margin-top: 6px;
  font-family: var(--font-hand);
  font-size: clamp(24px, 4.4vw, 32px);
  font-weight: 400;
  letter-spacing: 0.2em;
  color: var(--green-deep);
}
.story.ink .cn {
  color: var(--gold-bright);
}
.orn {
  display: block;
  margin: 16px auto 0;
  font-size: 15px;
  color: var(--gold);
  opacity: 0.8;
}
.sub {
  margin-top: 12px;
  font-family: var(--font-hand);
  font-size: 16px;
  letter-spacing: 0.12em;
  color: var(--brown);
}
.story.ink .sub {
  color: rgba(242, 231, 214, 0.72);
}

.frame {
  position: relative;
  margin: 46px auto 0;
  width: min(560px, 100%);
}
.story.art .frame {
  width: min(620px, 100%);
  /* 艺术合照做轻微错落，脱离正中轴线 */
  margin-left: auto;
  margin-right: 6%;
  transform: rotate(-1.2deg);
}
.frame .main {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: auto;
  border-radius: 6px;
}
.story.light .frame .main {
  filter: saturate(0.95) contrast(1.03) brightness(1.01);
}
.story.ink .frame .main {
  filter: saturate(0.9) contrast(1.05);
}
.frame .glow {
  position: absolute;
  inset: -5%;
  z-index: 0;
  width: 110%;
  height: 110%;
  object-fit: cover;
  filter: blur(42px) saturate(1.3);
  opacity: 0.55;
}
/* 浅色礼服在墨蓝底上会过曝，光晕压弱只保留氛围 */
.story.ink .frame .glow {
  opacity: 0.4;
  filter: blur(56px) saturate(1.1);
}

figcaption {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.24em;
  color: var(--brown);
}
.story.ink figcaption {
  color: rgba(242, 231, 214, 0.72);
}
.story.art figcaption {
  transform: rotate(1.2deg);
}

@media (max-width: 640px) {
  .story {
    padding-top: 76px;
    padding-bottom: 76px;
  }
  .story.ink {
    padding-top: 100px;
    padding-bottom: 100px;
  }
  .story.art .frame {
    margin-right: 0;
    transform: none;
  }
  .story.art figcaption {
    transform: none;
  }
  .frame {
    margin-top: 34px;
  }
}
</style>
