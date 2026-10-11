<template>
  <div class="admin-dashboard-view">
    <!-- Top Admin Header -->
    <header class="admin-topbar">
      <div class="brand-section">
        <span class="brand-seal">🛕</span>
        <div>
          <h1 class="brand-title font-mal">
            {{ isMalayalam ? 'ക്ഷേത്ര അഡ്മിൻ പോർട്ടൽ' : 'Temple Admin Portal' }}
          </h1>
          <p class="brand-sub">
            {{ isMalayalam ? 'മേൽശാന്തി ലിസ്റ്റും പ്രസാദ കൗണ്ടർ മാനേജ്‌മെന്റും' : 'Priest Pooja Sheet & Prasadam Counter Management System' }}
          </p>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Supabase Cloud Connection Status Badge -->
        <div class="db-status-wrap">
          <div v-if="isSupabaseLive || isConfigured" class="db-live-badge" title="Live Cloud Database Connected">
            <span class="db-live-dot"></span>
            <span class="font-mono">⚡ Supabase Cloud</span>
          </div>
          <button v-else class="db-setup-badge font-mal" @click="isDbGuideOpen = true" title="Click to view Supabase setup instructions">
            <span class="db-local-dot"></span>
            <span>{{ isMalayalam ? '💾 ലോക്കൽ മോഡ് (ക്ലൗഡ് കണക്റ്റ് ചെയ്യുക)' : '💾 Local Mode (Connect Cloud)' }}</span>
          </button>
        </div>

        <!-- Temple Selector for Admin -->
        <div class="admin-temple-picker">
          <label class="picker-label font-mal">
            {{ isMalayalam ? 'ക്ഷേത്രം:' : 'Temple:' }}
          </label>
          <select 
            class="temple-select-admin" 
            :value="activeTemple.id" 
            @change="$emit('change-temple', $event.target.value)"
          >
            <option v-for="t in temples" :key="t.id" :value="t.id">
              {{ isMalayalam ? t.nameMl : t.nameEn }} ({{ t.code }})
            </option>
          </select>
        </div>

        <!-- Switch to Devotee View Button -->
        <button class="switch-view-btn" @click="$emit('switch-to-devotee')">
          <span>📱</span>
          <span>{{ isMalayalam ? 'ഭക്തരുടെ QR സ്ക്രീൻ' : 'Switch to Devotee View' }}</span>
        </button>
      </div>
    </header>

    <!-- Admin Body Layout: Sidebar + Main Content -->
    <div class="admin-layout">
      <!-- Sidebar Navigation -->
      <aside class="admin-sidebar">
        <div class="sidebar-temple-card">
          <div class="sidebar-temple-icon">{{ activeTemple.icon }}</div>
          <div class="sidebar-temple-name font-mal">
            {{ isMalayalam ? activeTemple.nameMl : activeTemple.nameEn }}
          </div>
          <div class="sidebar-temple-code font-mono">Code: {{ activeTemple.code }}</div>
          <div class="sidebar-temple-upi font-mono">UPI: {{ activeTemple.upiId }}</div>
        </div>

        <nav class="sidebar-menu">
          <button 
            class="sidebar-item" 
            :class="{ active: currentTab === 'priest' }"
            @click="currentTab = 'priest'"
          >
            <span class="item-icon">📜</span>
            <span class="font-mal">
              {{ isMalayalam ? 'മേൽശാന്തി ലിസ്റ്റ്' : 'Priest Pooja Sheet' }}
            </span>
            <span class="item-count">{{ templeBookings.length }}</span>
          </button>

          <button 
            class="sidebar-item" 
            :class="{ active: currentTab === 'counter' }"
            @click="currentTab = 'counter'"
          >
            <span class="item-icon">🎫</span>
            <span class="font-mal">
              {{ isMalayalam ? 'പ്രസാദ കൗണ്ടർ' : 'Prasadam Verifier' }}
            </span>
            <span class="item-badge" v-if="pendingPrasadamCount > 0">{{ pendingPrasadamCount }}</span>
          </button>

          <button 
            class="sidebar-item" 
            :class="{ active: currentTab === 'menu' }"
            @click="currentTab = 'menu'"
          >
            <span class="item-icon">📋</span>
            <span class="font-mal">
              {{ isMalayalam ? 'വഴിപാട് മാനേജ്‌മെന്റ്' : 'Vazhipadu Menu' }}
            </span>
          </button>

          <button 
            class="sidebar-item" 
            :class="{ active: currentTab === 'qr_standee' }"
            @click="currentTab = 'qr_standee'"
          >
            <span class="item-icon">🖨️</span>
            <span class="font-mal">
              {{ isMalayalam ? 'QR പോസ്റ്റർ പ്രിന്റ്' : 'Printable QR Standee' }}
            </span>
          </button>

          <button 
            class="sidebar-item" 
            :class="{ active: currentTab === 'stats' }"
            @click="currentTab = 'stats'"
          >
            <span class="item-icon">📊</span>
            <span class="font-mal">
              {{ isMalayalam ? 'കളക്ഷൻ കണക്കുകൾ' : 'Daily Accounts' }}
            </span>
          </button>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="admin-main-panel">
        <!-- TAB 1: Priest Sheet (മേൽശാന്തി ലിസ്റ്റ്) -->
        <section v-if="currentTab === 'priest'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title font-mal">
                {{ isMalayalam ? 'മേൽശാന്തി പൂജാ ലിസ്റ്റ്' : 'Priest Sankalpam Sheet' }}
              </h2>
              <p class="section-sub">
                {{ isMalayalam ? 'ഇന്നത്തെ പൂജകൾക്കായി മേൽശാന്തിക്ക് നൽകേണ്ട ഭക്തരുടെ പേരും നാളും' : 'Names and birth stars list for the temple priest to perform rituals' }}
              </p>
            </div>
            <button class="gold-glow-btn" @click="handlePrint">
              <span>🖨️</span>
              <span>{{ isMalayalam ? 'ഷീറ്റ് പ്രിന്റ് ചെയ്യുക (Print A4)' : 'Print Priest Sheet (A4)' }}</span>
            </button>
          </div>

          <div class="card-box" id="priest-print-section">
            <div class="print-meta-header print-only">
              <h2>{{ isMalayalam ? activeTemple.nameMl : activeTemple.nameEn }}</h2>
              <p>{{ isMalayalam ? 'മേൽശാന്തി പൂജാ ലിസ്റ്റ് - തീയതി:' : 'Priest Pooja List - Date:' }} {{ todayFormatted }}</p>
            </div>

            <div class="table-wrap">
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th>{{ isMalayalam ? 'ടോക്കൺ #' : 'Token #' }}</th>
                    <th>{{ isMalayalam ? 'വഴിപാട് (Offering)' : 'Offering' }}</th>
                    <th>{{ isMalayalam ? 'ഭക്തന്റെ പേര്' : 'Devotee Name' }}</th>
                    <th>{{ isMalayalam ? 'നക്ഷത്രം / നാൾ' : 'Nakshathram (Star)' }}</th>
                    <th>{{ isMalayalam ? 'തീയതി & സമയം' : 'Date & Time' }}</th>
                    <th>{{ isMalayalam ? 'ഫോൺ നമ്പർ' : 'Phone' }}</th>
                    <th>{{ isMalayalam ? 'സ്റ്റാറ്റസ്' : 'Status' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in templeBookings" :key="b.tokenNo">
                    <td class="font-mono text-gold font-bold">{{ b.tokenNo }}</td>
                    <td class="font-mal font-bold">{{ b.vazhipaduName }}</td>
                    <td class="font-mal">{{ b.devoteeName }}</td>
                    <td class="font-mal text-cyan font-bold">{{ b.nakshathram }}</td>
                    <td>{{ b.date }} • {{ b.time }}</td>
                    <td class="font-mono">{{ b.phone || '+91 98471 23456' }}</td>
                    <td>
                      <span class="status-pill" :class="b.collected ? 'status-done' : 'status-pending'">
                        {{ b.collected ? (isMalayalam ? 'പ്രസാദം നൽകി' : 'Collected') : (isMalayalam ? 'പൂജയ്ക്ക് തയ്യാർ' : 'Ready') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- TAB 2: Prasadam Counter Distribution -->
        <section v-if="currentTab === 'counter'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title font-mal">
                {{ isMalayalam ? 'പ്രസാദ വിതരണ കൗണ്ടർ' : 'Prasadam Distribution Counter' }}
              </h2>
              <p class="section-sub">
                {{ isMalayalam ? 'ഭക്തർ ഫോണിൽ കാണിക്കുന്ന ടോക്കൺ നമ്പർ വെരിഫൈ ചെയ്ത് പ്രസാദം നൽകുക' : 'Enter devotee token number to verify and mark prasadam handed over' }}
              </p>
            </div>
          </div>

          <div class="counter-search-box">
            <span class="search-ico">🔍</span>
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="isMalayalam ? 'ടോക്കൺ നമ്പർ നൽകുക (ഉദാ: ' + activeTemple.code + '-101)...' : 'Search Token # (e.g. ' + activeTemple.code + '-101 or Name)...'"
              class="admin-text-input"
            />
          </div>

          <div class="cards-grid">
            <div 
              v-for="b in filteredBookings" 
              :key="b.tokenNo"
              class="booking-card"
              :class="{ 'card-distributed': b.collected }"
            >
              <div class="b-header">
                <span class="b-token font-mono">{{ b.tokenNo }}</span>
                <span class="b-time">{{ b.time }}</span>
              </div>
              <div class="b-body">
                <div class="b-offering font-mal">{{ b.vazhipaduName }}</div>
                <div class="b-devotee font-mal">
                  <span>{{ b.devoteeName }}</span> • <span class="text-gold">{{ b.nakshathram }}</span>
                </div>
                <div class="b-amount font-mono">Amount: ₹{{ b.amount }} (PAID)</div>
              </div>
              <div class="b-action">
                <button 
                  class="action-btn"
                  :class="b.collected ? 'btn-done' : 'btn-mark-ready'"
                  @click="toggleCollected(b)"
                >
                  <span v-if="b.collected">✓ {{ isMalayalam ? 'പ്രസാദം നൽകി (Collected)' : 'Distributed' }}</span>
                  <span v-else>👉 {{ isMalayalam ? 'പ്രസാദം നൽകിയതായി അടയാളപ്പെടുത്തുക' : 'Mark as Prasadam Handed Over' }}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 3: Vazhipadu Menu Manager -->
        <section v-if="currentTab === 'menu'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title font-mal">
                {{ isMalayalam ? 'വഴിപാടുകൾ ക്രമീകരിക്കുക' : 'Manage Vazhipadu Offerings' }}
              </h2>
              <p class="section-sub">
                {{ isMalayalam ? 'പുതിയ വഴിപാടുകൾ ചേർക്കാനും നിരക്കുകൾ മാറ്റാനും ഉള്ള സൗകര്യം' : 'Add offerings, adjust pricing, and set daily limits' }}
              </p>
            </div>
            <button class="gold-glow-btn" @click="showAddModal = true">
              <span>+</span>
              <span>{{ isMalayalam ? 'പുതിയ വഴിപാട് ചേർക്കുക' : 'Add New Offering' }}</span>
            </button>
          </div>

          <div class="card-box">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>{{ isMalayalam ? 'ഐക്കൺ' : 'Icon' }}</th>
                  <th>{{ isMalayalam ? 'വഴിപാടിന്റെ പേര് (Malayalam)' : 'Offering Name (Malayalam)' }}</th>
                  <th>{{ isMalayalam ? 'English Name' : 'English Name' }}</th>
                  <th>{{ isMalayalam ? 'തുക (Rate)' : 'Price' }}</th>
                  <th>{{ isMalayalam ? 'ഇന്നത്തെ ക്വാട്ട' : 'Daily Quota' }}</th>
                  <th>{{ isMalayalam ? 'ലഭ്യത' : 'Remaining' }}</th>
                  <th>{{ isMalayalam ? 'നടപടി' : 'Action' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="off in activeTemple.offerings" :key="off.id">
                  <td class="table-icon-col">{{ off.icon }}</td>
                  <td class="font-mal font-bold">{{ off.nameMl }}</td>
                  <td>{{ off.nameEn }}</td>
                  <td class="font-mono text-gold font-bold">₹{{ off.price }}</td>
                  <td class="font-mono">{{ off.dailyLimit }} {{ isMalayalam ? 'എണ്ണം' : 'units' }}</td>
                  <td>
                    <span class="quota-avail-pill">
                      {{ off.remaining }} / {{ off.dailyLimit }} {{ isMalayalam ? 'ബാക്കി' : 'left' }}
                    </span>
                  </td>
                  <td>
                    <button class="small-edit-btn" @click="editOfferingPrice(off)">
                      {{ isMalayalam ? 'റേറ്റ് മാറ്റുക' : 'Edit Price' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- TAB 4: Printable QR Poster Standee -->
        <section v-if="currentTab === 'qr_standee'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title font-mal">
                {{ isMalayalam ? 'ക്ഷേത്ര QR സ്റ്റാൻഡി / പോസ്റ്റർ' : 'Printable Temple Counter Standee' }}
              </h2>
              <p class="section-sub">
                {{ isMalayalam ? 'ഇത് പ്രിന്റ് ചെയ്ത് കൗണ്ടറുകളിലോ തൂണുകളിലോ ഫ്രെയിം ചെയ്ത് വെക്കാം' : 'Print and place at counters and pillars for devotees to scan' }}
              </p>
            </div>
            <div class="network-target-box">
              <span class="net-lbl">📱 QR ലിങ്ക് നെറ്റ്‌വർക്ക് ഐപി (Phone Testing):</span>
              <input 
                type="text" 
                v-model="networkHost" 
                class="net-input font-mono" 
                title="Phone-il test cheyyan PC-yude Wi-Fi IP (192.168.29.113)"
              />
              <span class="net-hint font-mono">{{ currentStandeeUrl }}</span>
            </div>
            <button class="gold-glow-btn" @click="handlePrint">
              <span>🖨️</span>
              <span>{{ isMalayalam ? 'A4 പോസ്റ്റർ പ്രിന്റ് ചെയ്യുക' : 'Print Standee (A4)' }}</span>
            </button>
          </div>

          <!-- Standee Preview -->
          <div class="standee-wrapper" id="printable-standee-poster">
            <div class="poster-sheet">
              <div class="poster-header">
                <span class="poster-icon">{{ activeTemple.icon }}</span>
                <h1 class="poster-name-ml font-mal">{{ activeTemple.nameMl }}</h1>
                <h2 class="poster-name-en">{{ activeTemple.nameEn }}</h2>
                <p class="poster-loc">{{ isMalayalam ? activeTemple.locationMl : activeTemple.locationEn }}</p>
              </div>

              <div class="poster-qr-container">
                <canvas ref="standeeCanvas" class="standee-qr-canvas"></canvas>
                <div class="scan-cta font-mal">
                  {{ isMalayalam ? 'സ്മാർട്ട്‌ഫോൺ ഉപയോഗിച്ച് സ്കാൻ ചെയ്ത് വഴിപാട് കഴിക്കുക' : 'Scan with Camera / Google Lens to Book Vazhipadu' }}
                </div>
                <div class="scan-cta-en">Scan with Camera or Google Lens to Book Vazhipadu</div>
              </div>

              <div class="poster-features">
                <div class="feature-item">
                  <span class="f-num">1</span>
                  <span>{{ isMalayalam ? 'ക്യുആർ സ്കാൻ ചെയ്യുക' : 'Scan QR' }}</span>
                </div>
                <div class="feature-item">
                  <span class="f-num">2</span>
                  <span>{{ isMalayalam ? 'പേരും നാളും നൽകുക' : 'Enter Name & Star' }}</span>
                </div>
                <div class="feature-item">
                  <span class="f-num">3</span>
                  <span>{{ isMalayalam ? 'UPI വഴി അടയ്ക്കുക' : 'Pay via UPI' }}</span>
                </div>
              </div>

              <div class="poster-footer">
                <div class="official-seal">Official Devaswom Digital Counter</div>
                <div class="poster-upi font-mono">UPI VPA: {{ activeTemple.upiId }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 5: Accounts & Daily Revenue Report -->
        <section v-if="currentTab === 'stats'" class="content-section">
          <div class="section-header">
            <div>
              <h2 class="section-title font-mal">
                {{ isMalayalam ? 'കളക്ഷൻ റിപ്പോർട്ട് & കണക്കുകൾ' : 'Daily Revenue & Collection Report' }}
              </h2>
              <p class="section-sub">
                {{ isMalayalam ? 'ഇന്നത്തെ ആകെ ബുക്കിംഗുകളും വരുമാനവും' : 'Overview of today\'s bookings and direct UPI payouts' }}
              </p>
            </div>
          </div>

          <div class="stats-overview-grid">
            <div class="overview-card">
              <span class="ov-title">
                {{ isMalayalam ? 'ഇന്നത്തെ ആകെ വരുമാനം' : 'Total Revenue Today' }}
              </span>
              <span class="ov-val text-gold">₹{{ totalRevenue }}</span>
              <span class="ov-foot text-green">100% Direct UPI Transfer</span>
            </div>

            <div class="overview-card">
              <span class="ov-title">
                {{ isMalayalam ? 'ആകെ വഴിപാടുകൾ' : 'Offerings Booked' }}
              </span>
              <span class="ov-val">{{ templeBookings.length }}</span>
              <span class="ov-foot">
                {{ pendingPrasadamCount }} {{ isMalayalam ? 'എണ്ണം വിതരണം ചെയ്യാനുണ്ട്' : 'pending collection' }}
              </span>
            </div>

            <div class="overview-card">
              <span class="ov-title">
                {{ isMalayalam ? 'പ്രസാദം കൈപ്പറ്റിയവർ' : 'Prasadam Distributed' }}
              </span>
              <span class="ov-val text-cyan">{{ collectedCount }}</span>
              <span class="ov-foot">
                {{ isMalayalam ? 'കൗണ്ടറിൽ നിന്ന് നൽകി' : 'Claimed at counter' }}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Supabase Setup Instructions Modal -->
    <div v-if="isDbGuideOpen" class="modal-overlay" @click.self="isDbGuideOpen = false">
      <div class="bottom-sheet db-guide-sheet">
        <div class="sheet-handle"></div>

        <div class="db-guide-header">
          <div class="guide-title-row">
            <span class="guide-icon">⚡</span>
            <div>
              <h2 class="guide-title font-mal">
                {{ isMalayalam ? 'Supabase ക്ലൗഡ് ഡാറ്റാബേസ് കണക്റ്റ് ചെയ്യാം' : 'Connect Supabase Cloud Database' }}
              </h2>
              <p class="guide-sub">
                {{ isMalayalam ? '3 ലളിതമായ സ്റ്റെപ്പുകൾ (100% സൗജന്യം / 100% Free)' : '3 Simple Steps to Connect Live Database' }}
              </p>
            </div>
          </div>
          <button class="sheet-close-btn" @click="isDbGuideOpen = false">✕</button>
        </div>

        <div class="db-guide-body">
          <div class="guide-step-card">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4 class="step-h font-mal">{{ isMalayalam ? 'സൗജന്യ Supabase അക്കൗണ്ട് തുറക്കുക' : 'Create Free Supabase Project' }}</h4>
              <p class="step-p">
                <a href="https://supabase.com" target="_blank" class="supabase-link font-mono">https://supabase.com</a> സന്ദർശിച്ച് ഒരു ഫ്രീ പ്രോജക്റ്റ് ആരംഭിക്കുക (Sign Up with GitHub/Google).
              </p>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4 class="step-h font-mal">{{ isMalayalam ? 'SQL Script റൺ ചെയ്യുക' : 'Run the 1-Click SQL Script' }}</h4>
              <p class="step-p">
                Supabase Dashboard-ൽ <strong>SQL Editor</strong> തുറന്ന് പ്രോജക്റ്റിലെ <code class="code-tag">supabase_schema.sql</code> ഫയലിലുള്ള കോഡ് പേസ്റ്റ് ചെയ്ത് <strong>RUN</strong> ക്ലിക്ക് ചെയ്യുക.
              </p>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4 class="step-h font-mal">{{ isMalayalam ? 'Project URL & Anon Key നൽകുക' : 'Add Credentials to .env' }}</h4>
              <p class="step-p">
                Project Settings &gt; API-ൽ നിന്ന് <strong>Project URL</strong>, <strong>anon public key</strong> എന്നിവ കോപ്പി ചെയ്ത് നിങ്ങളുടെ <code class="code-tag">.env</code> ഫയലിൽ പേസ്റ്റ് ചെയ്യുക.
              </p>
            </div>
          </div>

          <div class="guide-note font-mal">
            💡 <strong>ശ്രദ്ധിക്കുക:</strong> ഇപ്പോൾ ക്ലൗഡ് കണക്റ്റ് ചെയ്തില്ലെങ്കിലും നിങ്ങളുടെ സിസ്റ്റം തടസ്സമില്ലാതെ ലോക്കലായി സാധാരണ പോലെ പ്രവർത്തിക്കും!
          </div>
        </div>

        <div class="db-guide-footer">
          <button class="gold-glow-btn w-full font-mal" @click="isDbGuideOpen = false">
            <span>{{ isMalayalam ? 'മനസ്സിലായി (Done)' : 'Close Guide' }}</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import QRCode from 'qrcode';
import { toggleCollectedStatus, isSupabaseConfigured } from '../lib/supabase.js';

const props = defineProps({
  activeTemple: {
    type: Object,
    required: true
  },
  temples: {
    type: Array,
    required: true
  },
  allBookings: {
    type: Array,
    required: true
  },
  isMalayalam: {
    type: Boolean,
    default: true
  },
  isSupabaseLive: {
    type: Boolean,
    default: false
  }
});

defineEmits(['change-temple', 'switch-to-devotee']);

const validTabs = ['priest', 'counter', 'menu', 'qr_standee', 'stats'];
const initialTab = validTabs.includes(localStorage.getItem('kshetra_admin_tab'))
  ? localStorage.getItem('kshetra_admin_tab')
  : 'priest';
const currentTab = ref(initialTab);
const searchQuery = ref('');
const standeeCanvas = ref(null);
const showAddModal = ref(false);

const todayFormatted = new Date().toLocaleDateString('en-IN', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
});

const templeBookings = computed(() => {
  return props.allBookings.filter(b => b.templeId === props.activeTemple.id);
});

const filteredBookings = computed(() => {
  if (!searchQuery.value.trim()) return templeBookings.value;
  const q = searchQuery.value.toLowerCase().trim();
  return templeBookings.value.filter(b => 
    b.tokenNo.toLowerCase().includes(q) ||
    b.devoteeName.toLowerCase().includes(q) ||
    b.vazhipaduName.toLowerCase().includes(q)
  );
});

const pendingPrasadamCount = computed(() => {
  return templeBookings.value.filter(b => !b.collected).length;
});

const collectedCount = computed(() => {
  return templeBookings.value.filter(b => b.collected).length;
});

const isDbGuideOpen = ref(false);
const isConfigured = ref(isSupabaseConfigured());

const totalRevenue = computed(() => {
  return templeBookings.value.reduce((acc, curr) => acc + (curr.amount || 0), 0);
});

const toggleCollected = async (b) => {
  b.collected = !b.collected;
  try {
    await toggleCollectedStatus(b.tokenNo, b.collected);
  } catch (err) {
    console.error('Failed to sync collection status:', err);
  }
};

const editOfferingPrice = (off) => {
  const newPrice = prompt(`Enter new price for ${off.nameEn}:`, off.price);
  if (newPrice && !isNaN(newPrice)) {
    off.price = parseInt(newPrice, 10);
  }
};

// Network IP for testing across phone and PC on the same Wi-Fi
const networkHost = ref(
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '192.168.29.113'
    : window.location.hostname
);

const currentStandeeUrl = computed(() => {
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol || 'http:';
  return `${protocol}//${networkHost.value}${port}/?temple=${props.activeTemple.slug}`;
});

const renderStandee = async () => {
  await nextTick();
  if (standeeCanvas.value) {
    try {
      QRCode.toCanvas(standeeCanvas.value, currentStandeeUrl.value, {
        width: 220,
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

watch(() => props.activeTemple.slug, () => {
  renderStandee();
});

watch(networkHost, () => {
  renderStandee();
});

watch(currentTab, (val) => {
  try {
    localStorage.setItem('kshetra_admin_tab', val);
  } catch {}
  if (val === 'qr_standee') {
    renderStandee();
  }
});

onMounted(() => {
  if (currentTab.value === 'qr_standee') {
    renderStandee();
  }
});

const handlePrint = () => {
  window.print();
};
</script>

<style scoped>
.admin-dashboard-view {
  min-height: 100vh;
  background: #fbf9f4;
  color: #1c1917;
  display: flex;
  flex-direction: column;
}

/* Topbar - Authentic Temple Maroon Header */
.admin-topbar {
  background: #7e1121;
  border-bottom: 3px solid #b45309;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(126, 17, 33, 0.2);
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-seal {
  font-size: 28px;
}

.brand-title {
  font-size: 18px;
  font-weight: 800;
  color: #fef08a;
}

.brand-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-temple-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.picker-label {
  font-size: 13px;
  color: #fef08a;
  font-weight: 700;
}

.temple-select-admin {
  background: #ffffff;
  border: 1px solid #fde68a;
  color: #1c1917;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.switch-view-btn {
  background: #ffffff;
  border: 1.5px solid #ffffff;
  color: #7e1121;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.switch-view-btn:hover {
  background: #fef08a;
  color: #78350f;
  transform: translateY(-1px);
}

/* Layout */
.admin-layout {
  display: flex;
  flex: 1;
}

/* Sidebar */
.admin-sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1.5px solid var(--border-subtle);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-temple-card {
  background: #fdfbf7;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px;
  text-align: center;
}

.sidebar-temple-icon {
  font-size: 30px;
  margin-bottom: 6px;
}

.sidebar-temple-name {
  font-size: 15px;
  font-weight: 800;
  color: #7e1121;
  margin-bottom: 4px;
}

.sidebar-temple-code {
  font-size: 11px;
  color: #b45309;
  font-weight: 700;
}

.sidebar-temple-upi {
  font-size: 11px;
  color: #78716c;
  margin-top: 2px;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-item {
  background: none;
  border: none;
  color: #44403c;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition: all 0.2s ease;
  position: relative;
}

.sidebar-item:hover {
  background: #f8f6f0;
  color: #1c1917;
}

.sidebar-item.active {
  background: #7e1121;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(126, 17, 33, 0.2);
}

.item-count {
  margin-left: auto;
  background: #f5eedf;
  color: #44403c;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
}

.sidebar-item.active .item-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.item-badge {
  margin-left: auto;
  background: #b91c1c;
  color: #ffffff;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 800;
}

/* Main Panel */
.admin-main-panel {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
  background: #fbf9f4;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #7e1121;
}

.section-sub {
  font-size: 13px;
  color: #78716c;
  margin-top: 3px;
}

.card-box {
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(126, 17, 33, 0.04);
}

.table-wrap {
  overflow-x: auto;
}

.admin-data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.admin-data-table th {
  background: #7e1121;
  color: #ffffff;
  padding: 12px 16px;
  font-weight: 700;
  border-bottom: 2px solid #b45309;
}

.admin-data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1ebd9;
  color: #1c1917;
}

.admin-data-table tr:hover td {
  background: #fdfbf7;
}

.table-icon-col {
  font-size: 22px;
}

.text-gold {
  color: #b45309;
  font-weight: 700;
}

.text-cyan {
  color: #0369a1;
}

.font-bold {
  font-weight: 700;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
}

.status-done {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-pending {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.quota-avail-pill {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: #065f46;
  font-weight: 700;
}

.small-edit-btn {
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  color: #7e1121;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.small-edit-btn:hover {
  background: #7e1121;
  color: #ffffff;
  border-color: #7e1121;
}

/* Counter Screen */
.counter-search-box {
  position: relative;
  max-width: 450px;
}

.search-ico {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
  color: #78716c;
}

.admin-text-input {
  width: 100%;
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  color: #1c1917;
  padding: 12px 14px 12px 42px;
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.admin-text-input:focus {
  border-color: #7e1121;
  box-shadow: 0 0 0 3px rgba(126, 17, 33, 0.1);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.booking-card {
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.booking-card.card-distributed {
  border-color: #86efac;
  background: #f0fdf4;
}

.b-header {
  display: flex;
  justify-content: space-between;
}

.b-token {
  font-size: 18px;
  font-weight: 900;
  color: #7e1121;
}

.b-time {
  font-size: 11px;
  color: #78716c;
}

.b-offering {
  font-size: 15px;
  font-weight: 800;
  color: #1c1917;
}

.b-devotee {
  font-size: 13px;
  color: #57534e;
}

.b-amount {
  font-size: 12px;
  color: #065f46;
  font-weight: 700;
  margin-top: 2px;
}

.action-btn {
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-mark-ready {
  background: linear-gradient(135deg, #7e1121 0%, #991b1b 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(126, 17, 33, 0.2);
}

.btn-mark-ready:hover {
  background: linear-gradient(135deg, #991b1b 0%, #b91c1c 100%);
}

.btn-done {
  background: #ecfdf5;
  color: #065f46;
  border: 1.5px solid #a7f3d0;
}

.network-target-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  margin-left: auto;
  margin-right: 12px;
}

.net-lbl {
  font-size: 11px;
  font-weight: 800;
  color: #92400e;
  white-space: nowrap;
}

.net-input {
  background: #ffffff;
  border: 1.5px solid #ebd9c2;
  color: #b45309;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  width: 140px;
  outline: none;
}

.net-hint {
  font-size: 10px;
  color: #78716c;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Standee */
.standee-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.poster-sheet {
  width: 420px;
  background: #fffdf5;
  border: 4px solid #b45309;
  border-radius: var(--radius-xl);
  padding: 32px 24px;
  color: #1a1610;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  box-shadow: 0 10px 40px rgba(126, 17, 33, 0.15);
}

.poster-icon {
  font-size: 48px;
}

.poster-name-ml {
  font-size: 24px;
  font-weight: 900;
  color: #7e1121;
}

.poster-name-en {
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
}

.poster-loc {
  font-size: 12px;
  color: #b45309;
}

.poster-qr-container {
  background: #fff;
  border: 2px solid #fde68a;
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.standee-qr-canvas {
  border-radius: 8px;
}

.scan-cta {
  font-size: 15px;
  font-weight: 800;
  color: #7e1121;
  max-width: 280px;
}

.scan-cta-en {
  font-size: 11px;
  color: #92400e;
}

.poster-features {
  display: flex;
  gap: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #7e1121;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.f-num {
  width: 18px;
  height: 18px;
  background: #7e1121;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.poster-footer {
  border-top: 1px dashed #d97706;
  padding-top: 12px;
  width: 100%;
}

.official-seal {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #92400e;
}

.poster-upi {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

/* Stats Overview */
.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.overview-card {
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ov-title {
  font-size: 13px;
  color: #78716c;
  font-weight: 600;
}

.ov-val {
  font-size: 32px;
  font-weight: 900;
  color: #7e1121;
}

.ov-foot {
  font-size: 12px;
}

.text-green {
  color: #065f46;
  font-weight: 700;
}

.print-only {
  display: none;
}

/* Supabase Cloud Status Pill */
.db-status-wrap {
  display: flex;
  align-items: center;
}

.db-live-badge {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 4px rgba(6, 95, 70, 0.15);
}

.db-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.db-setup-badge {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.db-setup-badge:hover {
  background: #fef3c7;
  border-color: #b45309;
}

.db-local-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f59e0b;
}

/* Supabase Setup Instructions Modal */
.db-guide-sheet {
  max-width: 540px;
  background: #ffffff;
}

.db-guide-header {
  padding: 16px 20px 12px;
  background: #fdfbf7;
  border-bottom: 1.5px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.guide-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-icon {
  font-size: 26px;
}

.guide-title {
  font-size: 17px;
  font-weight: 800;
  color: #7e1121;
}

.guide-sub {
  font-size: 11.5px;
  color: #78716c;
}

.db-guide-body {
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
}

.guide-step-card {
  display: flex;
  gap: 12px;
  background: #fdfbf7;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #7e1121;
  color: #ffffff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-h {
  font-size: 13.5px;
  font-weight: 800;
  color: #1c1917;
}

.step-p {
  font-size: 12px;
  color: #44403c;
  line-height: 1.45;
}

.supabase-link {
  color: #0284c7;
  font-weight: 700;
  text-decoration: underline;
}

.code-tag {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.guide-note {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  line-height: 1.4;
}

.db-guide-footer {
  padding: 14px 20px;
  background: #fdfbf7;
  border-top: 1.5px solid var(--border-subtle);
}
</style>
