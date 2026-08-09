<script setup lang="ts">
defineOptions({ name: 'share-invite-button' })

import { weddingConfig } from '@/config/wedding'
import { useShareInvite } from '@/composables/useShareInvite'

const { share: shareCfg } = weddingConfig
const { showWeChatTip, showFallback, copyOk, share, copyLink, closeAll } = useShareInvite({
  url: shareCfg.url,
  title: shareCfg.title,
  text: shareCfg.text
})
</script>

<template>
  <div class="share-invite no-export">
    <button type="button" class="share-btn" @click="share">
      <span class="share-ic" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="2.4" />
          <circle cx="6" cy="12" r="2.4" />
          <circle cx="18" cy="19" r="2.4" />
          <path d="M8.2 10.8 15.7 6.4M8.2 13.2l7.5 4.4" />
        </svg>
      </span>
      分享给朋友
    </button>

    <Teleport to="body">
      <div
        v-if="showWeChatTip"
        class="wx-tip"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wx-tip-title"
        @click.self="closeAll"
      >
        <div class="wx-arrow" aria-hidden="true">
          <svg viewBox="0 0 80 90" fill="none">
            <path
              d="M12 78 C28 52, 48 34, 68 14"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
            />
            <path
              d="M52 12 L70 10 L64 28"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="wx-card">
          <p id="wx-tip-title" class="wx-title">分享给朋友</p>
          <p class="wx-desc">
            请点击右上角 <b>···</b><br />
            选择「发送给朋友」或「分享到朋友圈」
          </p>
          <button type="button" class="wx-ok" @click="closeAll">知道了</button>
        </div>
      </div>

      <div
        v-else-if="showFallback"
        class="fb-mask"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-title"
        @click.self="closeAll"
      >
        <div class="fb-panel">
          <p id="fb-title" class="fb-title">分享婚礼邀请</p>
          <p class="fb-desc">复制链接发给好友，或扫码打开邀请函</p>
          <img class="fb-qr" :src="shareCfg.qrImage" alt="婚礼邀请函二维码" width="280" height="280" />
          <div class="fb-actions">
            <button type="button" class="fb-copy" @click="copyLink">
              {{ copyOk ? '已复制链接' : '复制邀请链接' }}
            </button>
            <button type="button" class="fb-close" @click="closeAll">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.share-invite {
  margin-top: 14px;
}

.share-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 60px;
  border: 1px solid rgba(201, 168, 106, 0.65);
  background: transparent;
  color: var(--green);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 0.28em;
  cursor: pointer;
  transition: 0.35s var(--ease);
}

.share-btn:hover {
  background: rgba(201, 168, 106, 0.12);
  border-color: var(--gold);
  color: var(--green-deep);
  transform: translateY(-2px);
}

.share-btn:active {
  transform: scale(0.98);
  transition: 0.1s;
}

.share-ic {
  width: 18px;
  height: 18px;
  display: inline-flex;
  margin-right: -0.2em;
}

.share-ic svg {
  width: 100%;
  height: 100%;
}

.wx-tip {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(16, 26, 20, 0.72);
  padding: max(12px, env(safe-area-inset-top)) 20px 24px;
  animation: fadeIn 0.25s ease both;
}

.wx-arrow {
  position: absolute;
  top: max(8px, env(safe-area-inset-top));
  right: 18px;
  width: 72px;
  height: 82px;
  color: var(--gold-bright);
  animation: tipPulse 1.6s ease-in-out infinite;
}

.wx-arrow svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

.wx-card {
  position: absolute;
  top: min(28vh, 220px);
  left: 50%;
  transform: translateX(-50%);
  width: min(320px, calc(100% - 40px));
  padding: 26px 22px 20px;
  text-align: center;
  background:
    linear-gradient(165deg, rgba(250, 246, 238, 0.98), rgba(243, 236, 221, 0.96));
  border: 1px solid rgba(201, 168, 106, 0.45);
  border-radius: 18px;
  box-shadow: 0 22px 50px rgba(12, 22, 16, 0.35);
  animation: riseIn 0.35s var(--ease) both;
}

.wx-title {
  font-size: 18px;
  letter-spacing: 0.28em;
  color: var(--green-deep);
  font-weight: 500;
}

.wx-desc {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.85;
  color: var(--brown);
  letter-spacing: 0.06em;
}

.wx-desc b {
  color: var(--green);
  font-weight: 600;
  letter-spacing: 0.2em;
}

.wx-ok {
  margin-top: 20px;
  min-width: 140px;
  padding: 11px 22px;
  border: none;
  border-radius: 60px;
  background: var(--green);
  color: var(--ivory);
  font: inherit;
  font-size: 14px;
  letter-spacing: 0.22em;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(45, 74, 54, 0.28);
}

.fb-mask {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(16, 26, 20, 0.5);
  animation: fadeIn 0.25s ease both;
}

.fb-panel {
  width: min(360px, 100%);
  padding: 24px 20px 18px;
  text-align: center;
  background: #fffaf2;
  border: 1px solid rgba(201, 168, 106, 0.4);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(16, 26, 20, 0.22);
  animation: panelIn 0.35s var(--ease) both;
}

.fb-title {
  font-size: 18px;
  letter-spacing: 0.22em;
  color: var(--green-deep);
  font-weight: 500;
}

.fb-desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--brown);
  letter-spacing: 0.08em;
}

.fb-qr {
  display: block;
  width: min(240px, 72vw);
  height: auto;
  margin: 18px auto 0;
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(28, 46, 36, 0.18);
}

.fb-actions {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.fb-copy,
.fb-close {
  font: inherit;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 60px;
  letter-spacing: 0.16em;
}

.fb-copy {
  border: none;
  background: var(--green);
  color: var(--ivory);
  box-shadow: 0 8px 20px rgba(45, 74, 54, 0.25);
}

.fb-close {
  border: 1px solid rgba(45, 74, 54, 0.22);
  background: transparent;
  color: var(--green-deep);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tipPulse {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.9;
  }
  50% {
    transform: translateY(4px);
    opacity: 1;
  }
}
</style>
