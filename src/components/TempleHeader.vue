<template>
  <header class="temple-header">
    <!-- Top Utility Bar (Devaswom Ivory Nav) -->
    <div class="top-nav">
      <div class="qr-active-pill">
        <span class="pulsing-dot"></span>
        <span class="qr-text">
          <span class="qr-icon">📱</span>
          QR: <strong>{{ activeTemple.code }}</strong>
        </span>
      </div>

      <div class="top-actions">
        <!-- Language Switcher -->
        <button 
          class="util-btn lang-btn" 
          @click="$emit('toggle-lang')"
          :title="isMalayalam ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറ്റുക'"
        >
          <span class="lang-tag">{{ isMalayalam ? 'EN' : 'മല' }}</span>
        </button>

        <!-- Temple Switcher Dropdown (Only for Admin / Testing, hidden for regular devotees) -->
        <div v-if="showAdminTools" class="temple-dropdown-wrap">
          <select 
            class="temple-select-sm" 
            :value="activeTemple.id" 
            @change="$emit('change-temple', $event.target.value)"
            title="Switch temple QR code"
          >
            <option v-for="t in temples" :key="t.id" :value="t.id">
              {{ isMalayalam ? t.nameMl : t.nameEn }} ({{ t.code }})
            </option>
          </select>
        </div>

        <!-- Temple Admin / Priest Portal (Hidden for regular devotees) -->
        <button 
          v-if="showAdminTools"
          class="util-btn admin-btn" 
          @click="$emit('open-admin')"
          title="Temple Admin & Priest Sheet"
        >
          <span class="admin-icon">⚙️</span>
          <span class="admin-label">{{ isMalayalam ? 'കൗണ്ടർ' : 'Admin' }}</span>
        </button>
      </div>
    </div>

    <!-- Temple Banner & Identity (Auspicious Devaswom Maroon & Gold) -->
    <div class="hero-banner" :style="{ background: activeTemple.bannerGradient }">
      <div class="banner-gold-trim"></div>

      <div class="temple-top-seal">
        <span class="devaswom-title-tag font-sacred">
          {{ isMalayalam ? 'ക്ഷേത്ര ദേവസ്വം ബോർഡ് • KERALA DEVASWOM' : 'DEVASWOM BOARD • KERALA TEMPLES' }}
        </span>
      </div>

      <div class="temple-emblem-row">
        <div class="temple-emblem">
          <span class="deity-icon">{{ activeTemple.icon }}</span>
          <span class="lamp-flame">🪔</span>
        </div>

        <div class="temple-info">
          <div class="deity-tag font-sacred">
            {{ isMalayalam ? activeTemple.primaryDeityMl : activeTemple.primaryDeityEn }}
          </div>
          <h1 class="temple-title" :class="{ 'font-mal': isMalayalam }">
            {{ isMalayalam ? activeTemple.nameMl : activeTemple.nameEn }}
          </h1>
          <p class="temple-location">
            <span class="loc-pin">📍</span> {{ isMalayalam ? activeTemple.locationMl : activeTemple.locationEn }}
          </p>
        </div>
      </div>

      <!-- Live Sanctum Status & UPI Badge -->
      <div class="status-strip">
        <div class="darshan-badge">
          <span class="online-indicator"></span>
          <span>{{ activeTemple.statusText }}</span>
        </div>
        <div class="upi-badge" title="Official Temple Devaswom Bank Account">
          <span class="upi-label">UPI:</span> {{ activeTemple.upiId }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  activeTemple: {
    type: Object,
    required: true
  },
  temples: {
    type: Array,
    required: true
  },
  isMalayalam: {
    type: Boolean,
    default: true
  },
  showAdminTools: {
    type: Boolean,
    default: false
  }
});

defineEmits(['change-temple', 'toggle-lang', 'open-admin']);
</script>

<style scoped>
.temple-header {
  position: relative;
  z-index: 10;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fbf9f4;
  border-bottom: 1px solid var(--border-subtle);
  gap: 8px;
}

.qr-active-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  color: #92400e;
  font-weight: 600;
}

.pulsing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #059669;
  box-shadow: 0 0 6px #059669;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.qr-text strong {
  color: #7e1121;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.util-btn {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.util-btn:hover {
  border-color: #b45309;
  background: #fffdf9;
}

.lang-btn {
  font-weight: 700;
  color: #7e1121;
  border-color: #fecaca;
  background: #fef2f2;
}

.temple-dropdown-wrap {
  position: relative;
}

.temple-select-sm {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  color: #1c1917;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  max-width: 145px;
}

.admin-btn {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
  font-weight: 700;
}

/* Hero Banner */
.hero-banner {
  padding: 18px 18px 16px;
  position: relative;
  overflow: hidden;
  border-bottom: 2px solid #b45309;
  color: #ffffff;
}

.banner-gold-trim {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f59e0b, #fef08a, #d97706);
}

.temple-top-seal {
  margin-bottom: 8px;
}

.devaswom-title-tag {
  font-size: 9.5px;
  letter-spacing: 0.12em;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(254, 240, 138, 0.35);
  padding: 2px 8px;
  border-radius: 99px;
  color: #fef08a;
  display: inline-block;
  font-weight: 600;
}

.temple-emblem-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.temple-emblem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(254, 240, 138, 0.3);
  padding: 8px 10px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.deity-icon {
  font-size: 24px;
  filter: drop-shadow(0 0 8px rgba(254, 240, 138, 0.7));
}

.deity-tag {
  font-size: 11px;
  text-transform: uppercase;
  color: #fef08a;
  letter-spacing: 0.08em;
  font-weight: 700;
  margin-bottom: 2px;
}

.temple-title {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
  margin-bottom: 3px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.temple-location {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
}

.darshan-badge {
  font-size: 11px;
  color: #d1fae5;
  background: rgba(6, 95, 70, 0.35);
  border: 1px solid rgba(52, 211, 153, 0.3);
  padding: 3px 8px;
  border-radius: 99px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
}

.online-indicator {
  width: 7px;
  height: 7px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 6px #34d399;
}

.upi-badge {
  font-size: 11px;
  color: #fef08a;
  background: rgba(0, 0, 0, 0.22);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-family: monospace;
}

.upi-label {
  color: #ffffff;
  font-weight: 700;
}
</style>
