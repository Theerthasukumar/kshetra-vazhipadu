<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="bottom-sheet admin-sheet">
      <div class="sheet-handle"></div>

      <!-- Header -->
      <div class="sheet-header">
        <div class="header-left">
          <div class="badge-gold">
            <span>⚙️</span>
            <span>{{ isMalayalam ? 'ക്ഷേത്ര കൗണ്ടർ & അഡ്മിൻ' : 'Temple Counter Admin' }}</span>
          </div>
          <h2 class="admin-title font-mal">
            {{ isMalayalam ? activeTemple.nameMl : activeTemple.nameEn }}
          </h2>
        </div>
        <button class="sheet-close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Navigation Tabs -->
      <div class="admin-tabs-nav">
        <button 
          class="admin-tab-btn" 
          :class="{ active: currentTab === 'priest' }"
          @click="currentTab = 'priest'"
        >
          <span>📜</span>
          <span>{{ isMalayalam ? 'മേൽശാന്തി ലിസ്റ്റ്' : 'Priest Sheet' }}</span>
        </button>

        <button 
          class="admin-tab-btn" 
          :class="{ active: currentTab === 'counter' }"
          @click="currentTab = 'counter'"
        >
          <span>🎫</span>
          <span>{{ isMalayalam ? 'പ്രസാദ കൗണ്ടർ' : 'Prasadam Verifier' }}</span>
        </button>

        <button 
          class="admin-tab-btn" 
          :class="{ active: currentTab === 'qr_standee' }"
          @click="currentTab = 'qr_standee'"
        >
          <span>📱</span>
          <span>{{ isMalayalam ? 'QR പോസ്റ്റർ' : 'QR Standee' }}</span>
        </button>

        <button 
          class="admin-tab-btn" 
          :class="{ active: currentTab === 'stats' }"
          @click="currentTab = 'stats'"
        >
          <span>📊</span>
          <span>{{ isMalayalam ? 'കണക്കുകൾ' : 'Accounts' }}</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="sheet-body">
        <!-- TAB 1: Priest Daily Pooja Sheet -->
        <div v-if="currentTab === 'priest'" class="priest-sheet-wrap">
          <div class="section-top-actions">
            <div>
              <h3 class="tab-heading font-mal">
                {{ isMalayalam ? 'ഇന്നത്തെ പൂജകൾ (മേൽശാന്തി ലിസ്റ്റ്)' : 'Today\'s Sankalpam Sheet for Priest' }}
              </h3>
              <p class="tab-sub">
                {{ isMalayalam ? 'പൂജാരിക്ക് പൂജ കഴിക്കാൻ നൽകേണ്ട പേരുകളും നാളുകളും' : 'List of names and birth stars for daily ritual' }}
              </p>
            </div>
            <button class="gold-glow-btn print-sheet-btn" @click="printPriestSheet">
              <span>🖨️</span>
              <span>{{ isMalayalam ? 'പ്രിന്റ് ഷീറ്റ്' : 'Print Sheet' }}</span>
            </button>
          </div>

          <div class="priest-table-card" id="priest-print-area">
            <div class="print-header print-only">
              <h2>{{ activeTemple.nameMl }} ({{ activeTemple.nameEn }})</h2>
              <p>മേൽശാന്തി പൂജാ ലിസ്റ്റ് - തീയതി: {{ todayDate }}</p>
            </div>

            <div class="table-responsive">
              <table class="priest-table">
                <thead>
                  <tr>
                    <th>ടോക്കൺ #</th>
                    <th>വഴിപാട് (Offering)</th>
                    <th>ഭക്തന്റെ പേര് (Name)</th>
                    <th>നക്ഷത്രം (Star)</th>
                    <th>സമയം</th>
                    <th>സ്റ്റാറ്റസ്</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in templeBookings" :key="b.tokenNo">
                    <td class="font-mono token-cell">{{ b.tokenNo }}</td>
                    <td class="font-mal offering-cell"><strong>{{ b.vazhipaduName }}</strong></td>
                    <td class="font-mal">{{ b.devoteeName }}</td>
                    <td class="font-mal star-cell">{{ b.nakshathram }}</td>
                    <td class="time-cell">{{ b.time }}</td>
                    <td>
                      <span class="badge-pill" :class="b.collected ? 'badge-collected' : 'badge-pending'">
                        {{ b.collected ? (isMalayalam ? 'പ്രസാദം നൽകി' : 'Collected') : (isMalayalam ? 'പൂജയ്ക്ക് തയ്യാർ' : 'Ready') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB 2: Counter Token Verifier -->
        <div v-if="currentTab === 'counter'" class="counter-verifier-wrap">
          <h3 class="tab-heading font-mal">
            {{ isMalayalam ? 'ടോക്കൺ നമ്പർ വെരിഫിക്കേഷൻ' : 'Token Prasadam Distribution' }}
          </h3>
          <p class="tab-sub">
            {{ isMalayalam ? 'ഭക്തർ കാണിക്കുന്ന ടോക്കൺ നമ്പർ നൽകി പ്രസാദം നൽകുക' : 'Enter token number to verify and hand over prasadam' }}
          </p>

          <div class="token-search-bar">
            <input 
              type="text" 
              v-model="searchToken" 
              :placeholder="isMalayalam ? 'ഉദാ: ' + activeTemple.code + '-101' : 'e.g., ' + activeTemple.code + '-101'"
              class="temple-input token-input font-mono"
            />
          </div>

          <div class="counter-results-list">
            <div 
              v-for="b in filteredBookings" 
              :key="b.tokenNo"
              class="verify-card"
              :class="{ 'is-distributed': b.collected }"
            >
              <div class="verify-top">
                <span class="verify-token font-mono">{{ b.tokenNo }}</span>
                <span class="verify-time">{{ b.time }}</span>
              </div>
              <div class="verify-details">
                <div class="verify-offering font-mal">{{ b.vazhipaduName }}</div>
                <div class="verify-devotee font-mal">
                  <span>{{ b.devoteeName }}</span> • <span class="text-gold">{{ b.nakshathram }}</span>
                </div>
              </div>
              <div class="verify-actions">
                <button 
                  class="verify-btn"
                  :class="b.collected ? 'btn-collected' : 'btn-mark'"
                  @click="toggleCollected(b)"
                >
                  <span v-if="b.collected">✓ {{ isMalayalam ? 'പ്രസാദം നൽകി' : 'Distributed' }}</span>
                  <span v-else>👉 {{ isMalayalam ? 'പ്രസാദം നൽകിയതായി മാർക്ക് ചെയ്യുക' : 'Mark as Handed Over' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: Printable Temple QR Standee Generator -->
        <div v-if="currentTab === 'qr_standee'" class="qr-standee-wrap">
          <div class="section-top-actions">
            <div>
              <h3 class="tab-heading font-mal">
                {{ isMalayalam ? 'ക്ഷേത്ര കൗണ്ടർ QR സ്റ്റാൻഡി / പോസ്റ്റർ' : 'Temple QR Counter Standee' }}
              </h3>
              <p class="tab-sub">
                {{ isMalayalam ? 'ഇത് പ്രിന്റ് ചെയ്ത് കൗണ്ടറിലോ മതിലുകളിലോ ഒട്ടിക്കാം' : 'Ready-to-print standee for counter tops and pillars' }}
              </p>
            </div>
            <button class="gold-glow-btn" @click="printStandee">
              <span>🖨️</span>
              <span>{{ isMalayalam ? 'പോസ്റ്റർ പ്രിന്റ് ചെയ്യുക' : 'Print Poster' }}</span>
            </button>
          </div>

          <!-- Live Standee Poster Preview -->
          <div class="standee-poster-preview" id="standee-print-area">
            <div class="standee-inner">
              <div class="standee-top">
                <span class="standee-icon">{{ activeTemple.icon }}</span>
                <h2 class="standee-temple-ml font-mal">{{ activeTemple.nameMl }}</h2>
                <h3 class="standee-temple-en">{{ activeTemple.nameEn }}</h3>
                <p class="standee-loc">{{ activeTemple.locationMl }}</p>
              </div>

              <div class="standee-qr-frame">
                <canvas ref="standeeCanvas" class="standee-canvas"></canvas>
                <div class="scan-instructions font-mal">
                  {{ isMalayalam ? 'ക്യാമറ ഉപയോഗിച്ച് സ്കാൻ ചെയ്ത് വഴിപാട് കഴിക്കുക' : 'Scan with Camera / Google Lens to Book Vazhipadu' }}
                </div>
              </div>

              <div class="standee-footer">
                <div class="standee-steps">
                  <span>1. സ്കാൻ ചെയ്യുക</span> • 
                  <span>2. പേരും നാളും നൽകുക</span> • 
                  <span>3. UPI പേയ്‌മെന്റ്</span>
                </div>
                <div class="standee-upi font-mono">
                  Official Devaswom UPI: {{ activeTemple.upiId }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: Accounts & Collection Stats -->
        <div v-if="currentTab === 'stats'" class="stats-wrap">
          <h3 class="tab-heading font-mal">
            {{ isMalayalam ? 'ഇന്നത്തെ കളക്ഷൻ കണക്കുകൾ' : 'Daily Collection & Summary' }}
          </h3>

          <div class="stats-cards-grid">
            <div class="stat-card">
              <span class="stat-lbl">{{ isMalayalam ? 'ആകെ വരുമാനം' : 'Total Collection' }}</span>
              <span class="stat-val text-gold">₹{{ totalRevenue }}</span>
              <span class="stat-sub">100% via UPI Direct</span>
            </div>
            <div class="stat-card">
              <span class="stat-lbl">{{ isMalayalam ? 'ആകെ വഴിപാടുകൾ' : 'Vazhipadus Booked' }}</span>
              <span class="stat-val">{{ templeBookings.length }}</span>
              <span class="stat-sub">{{ isMalayalam ? 'ഇന്നത്തെ ബുക്കിംഗുകൾ' : 'Orders today' }}</span>
            </div>
          </div>

          <div class="popular-section">
            <div class="section-title">
              <span>{{ isMalayalam ? 'കൂടുതൽ നടന്ന വഴിപാടുകൾ' : 'Most Popular Offerings Today' }}</span>
            </div>
            <div class="popular-list">
              <div 
                v-for="off in activeTemple.offerings.slice(0, 4)" 
                :key="off.id"
                class="popular-row"
              >
                <div class="pop-left">
                  <span>{{ off.icon }}</span>
                  <span class="font-mal">{{ isMalayalam ? off.nameMl : off.nameEn }}</span>
                </div>
                <span class="pop-price">₹{{ off.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  activeTemple: {
    type: Object,
    required: true
  },
  allBookings: {
    type: Array,
    required: true
  },
  isMalayalam: {
    type: Boolean,
    default: true
  }
});

defineEmits(['close']);

const currentTab = ref('priest');
const searchToken = ref('');
const standeeCanvas = ref(null);
const todayDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const templeBookings = computed(() => {
  return props.allBookings.filter(b => b.templeId === props.activeTemple.id);
});

const filteredBookings = computed(() => {
  if (!searchToken.value.trim()) return templeBookings.value;
  const q = searchToken.value.toLowerCase().trim();
  return templeBookings.value.filter(b => 
    b.tokenNo.toLowerCase().includes(q) ||
    b.devoteeName.toLowerCase().includes(q) ||
    b.vazhipaduName.toLowerCase().includes(q)
  );
});

const totalRevenue = computed(() => {
  return templeBookings.value.reduce((acc, curr) => acc + (curr.amount || 0), 0);
});

const toggleCollected = (booking) => {
  booking.collected = !booking.collected;
};

const renderStandeeQR = async () => {
  await nextTick();
  if (standeeCanvas.value) {
    try {
      const standeeUrl = `https://kshetravazhipadu.com/t/${props.activeTemple.slug}`;
      QRCode.toCanvas(standeeCanvas.value, standeeUrl, {
        width: 180,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
};

watch(currentTab, (newTab) => {
  if (newTab === 'qr_standee') {
    renderStandeeQR();
  }
});

onMounted(() => {
  if (currentTab.value === 'qr_standee') {
    renderStandeeQR();
  }
});

const printPriestSheet = () => {
  window.print();
};

const printStandee = () => {
  window.print();
};
</script>

<style scoped>
.admin-sheet {
  max-height: 94vh;
}

.sheet-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.admin-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-top: 4px;
}

.sheet-close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: var(--text-sub);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tabs */
.admin-tabs-nav {
  display: flex;
  background: rgba(14, 16, 24, 0.95);
  border-bottom: 1px solid var(--border-subtle);
  overflow-x: auto;
  scrollbar-width: none;
}

.admin-tabs-nav::-webkit-scrollbar {
  display: none;
}

.admin-tab-btn {
  flex: 1;
  white-space: nowrap;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.admin-tab-btn:hover {
  color: #fff;
}

.admin-tab-btn.active {
  color: #fbbf24;
  border-bottom-color: #fbbf24;
  background: rgba(245, 158, 11, 0.08);
}

.sheet-body {
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-top-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 10px;
}

.tab-heading {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.tab-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.print-sheet-btn {
  padding: 8px 14px;
  font-size: 12px;
}

/* Priest Table */
.priest-table-card {
  background: rgba(22, 25, 38, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.priest-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}

.priest-table th {
  background: rgba(30, 35, 52, 0.95);
  color: var(--text-muted);
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
}

.priest-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-main);
  white-space: nowrap;
}

.token-cell {
  font-weight: 700;
  color: #fbbf24;
}

.star-cell {
  color: #38bdf8;
}

.time-cell {
  color: var(--text-muted);
  font-size: 11px;
}

.badge-pill {
  padding: 3px 8px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
}

.badge-collected {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.badge-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

/* Counter Verifier */
.token-search-bar {
  margin-bottom: 12px;
}

.token-input {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.counter-results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verify-card {
  background: rgba(25, 28, 42, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.verify-card.is-distributed {
  border-color: rgba(16, 185, 129, 0.35);
  opacity: 0.75;
}

.verify-top {
  display: flex;
  justify-content: space-between;
}

.verify-token {
  font-size: 16px;
  font-weight: 800;
  color: #fbbf24;
}

.verify-time {
  font-size: 11px;
  color: var(--text-muted);
}

.verify-offering {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.verify-devotee {
  font-size: 12px;
  color: var(--text-sub);
}

.verify-btn {
  width: 100%;
  padding: 9px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-mark {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #10121a;
}

.btn-collected {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

/* Printable Standee Poster */
.standee-poster-preview {
  background: #fffdf5;
  border: 3px solid #b45309;
  border-radius: var(--radius-lg);
  padding: 24px 16px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5);
}

.standee-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
}

.standee-icon {
  font-size: 40px;
}

.standee-temple-ml {
  font-size: 20px;
  font-weight: 800;
  color: #78350f;
  margin-top: 4px;
}

.standee-temple-en {
  font-size: 13px;
  color: #92400e;
  font-weight: 600;
}

.standee-loc {
  font-size: 11px;
  color: #b45309;
}

.standee-qr-frame {
  background: #fff;
  border: 2px solid #fde68a;
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.standee-canvas {
  border-radius: 6px;
}

.scan-instructions {
  font-size: 13px;
  font-weight: 700;
  color: #78350f;
  max-width: 240px;
}

.standee-footer {
  border-top: 1px dashed #d97706;
  padding-top: 10px;
  width: 100%;
}

.standee-steps {
  font-size: 11px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 4px;
}

.standee-upi {
  font-size: 10px;
  color: #6b7280;
}

/* Stats */
.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-card {
  background: rgba(22, 25, 38, 0.85);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-lbl {
  font-size: 11px;
  color: var(--text-muted);
}

.stat-val {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
}

.stat-sub {
  font-size: 10px;
  color: #10b981;
}

.popular-section {
  margin-top: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub);
  margin-bottom: 8px;
}

.popular-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.popular-row {
  background: rgba(22, 25, 38, 0.7);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.pop-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pop-price {
  font-weight: 700;
  color: #fbbf24;
}

.print-only {
  display: none;
}
</style>
