<template>
  <div class="app-root-container">
    <!-- Top Global Switcher: Only shown on PC/Staff mode, hidden when scanned by Devotee -->
    <div v-if="!isDevoteeScan" class="global-portal-switch">
      <div class="portal-switch-inner">
        <!-- Left: Portal Mode Buttons -->
        <div class="portal-mode-group">
          <span class="switch-badge font-mono">PORTAL:</span>
          <div class="portal-buttons">
            <button 
              class="portal-btn" 
              :class="{ active: viewMode === 'devotee' }"
              @click="setViewMode('devotee')"
            >
              <span class="p-icon">📱</span>
              <span class="font-mal">
                {{ isMalayalam ? 'ഭക്തരുടെ QR സ്ക്രീൻ (Devotee)' : 'Devotee QR View' }}
              </span>
            </button>

            <button 
              class="portal-btn" 
              :class="{ active: viewMode === 'admin' }"
              @click="setViewMode('admin')"
            >
              <span class="p-icon">💻</span>
              <span class="font-mal">
                {{ isMalayalam ? 'ക്ഷേത്ര അഡ്മിൻ (Admin)' : 'Temple Admin Portal' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Right: Global Bilingual Language Switcher (Malayalam / English) -->
        <div class="global-lang-group">
          <span class="lang-label font-mono">LANG:</span>
          <div class="lang-pill-container">
            <button 
              class="lang-pill-btn font-mal"
              :class="{ active: isMalayalam }"
              @click="setLanguage(true)"
              title="മലയാളത്തിലേക്ക് മാറ്റുക"
            >
              മലയാളം (ML)
            </button>
            <button 
              class="lang-pill-btn"
              :class="{ active: !isMalayalam }"
              @click="setLanguage(false)"
              title="Switch to English"
            >
              English (EN)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. TEMPLE COMMITTEE FULL ADMIN DASHBOARD -->
    <AdminDashboardView 
      v-if="viewMode === 'admin'"
      :active-temple="activeTemple"
      :temples="TEMPLES"
      :all-bookings="allBookings"
      :is-malayalam="isMalayalam"
      :is-supabase-live="isSupabaseConnected"
      @change-temple="handleTempleChange"
      @switch-to-devotee="setViewMode('devotee')"
    />

    <!-- 2. DEVOTEE MOBILE QR VIEW (GURUVAYUR DEVASWOM LIGHT THEME) -->
    <div v-else class="devotee-mobile-wrapper">
      <!-- Temple Header (Admin tools hidden when scanned by Devotee) -->
      <TempleHeader 
        :active-temple="activeTemple"
        :temples="TEMPLES"
        :is-malayalam="isMalayalam"
        :show-admin-tools="!isDevoteeScan"
        @change-temple="handleTempleChange"
        @toggle-lang="setLanguage(!isMalayalam)"
        @open-admin="setViewMode('admin')"
      />

      <!-- Official Devaswom Notifications Marquee Banner -->
      <div class="notifications-strip" @click="openNotificationsModal">
        <div class="notif-badge-btn font-mal">
          <span class="bell-icon">🔔</span>
          <span>{{ isMalayalam ? 'വിജ്ഞാപനം' : 'Notice' }}</span>
        </div>
        <div class="notif-ticker-text font-mal">
          {{ isMalayalam ? activeNotification.titleMl : activeNotification.titleEn }}
        </div>
        <span class="notif-view-link font-mal">
          {{ isMalayalam ? 'കാണുക →' : 'View →' }}
        </span>
      </div>

      <!-- Quick Info Notice Strip -->
      <div class="quick-notice-strip">
        <span class="notice-icon">🪔</span>
        <span class="notice-text font-mal">
          {{ isMalayalam ? 'ക്യൂ നിൽക്കാതെ വഴിപാട് കഴിച്ച് രസീത് കൗണ്ടറിൽ കാണിക്കുക' : 'Book directly from sanctum and claim prasadam at counter' }}
        </span>
      </div>

      <!-- Category Filter & Search Navigation -->
      <VazhipaduCategoryNav 
        :categories="CATEGORIES"
        :selected-category="selectedCategory"
        v-model:search-query="searchQuery"
        :is-malayalam="isMalayalam"
        @select-category="selectedCategory = $event"
      />

      <!-- Main Offerings List -->
      <main class="offerings-main">
        <div class="offerings-header-row">
          <h2 class="section-title font-mal">
            {{ isMalayalam ? 'ലഭ്യമായ വഴിപാടുകൾ' : 'Available Offerings' }}
            <span class="count-pill">({{ filteredOfferings.length }})</span>
          </h2>
          <span class="temple-code-tag font-mono">{{ activeTemple.code }}</span>
        </div>

        <!-- Offerings Grid -->
        <div v-if="filteredOfferings.length > 0" class="offerings-grid">
          <VazhipaduCard 
            v-for="offering in filteredOfferings" 
            :key="offering.id"
            :offering="offering"
            :in-cart-count="getCartCountForOffering(offering.id)"
            :is-malayalam="isMalayalam"
            @select-offering="openDevoteeModal(offering)"
          />
        </div>

        <!-- Empty Search Fallback -->
        <div v-else class="empty-state-card glass-panel">
          <span class="empty-icon">🔍</span>
          <h3 class="empty-title font-mal">
            {{ isMalayalam ? 'വഴിപാടുകൾ കണ്ടെത്താനായില്ല' : 'No offerings found' }}
          </h3>
          <p class="empty-sub">
            {{ isMalayalam ? 'മറ്റൊരു പേരോ കാറ്റഗറിയോ തിരയുക' : 'Try searching with a different name or category' }}
          </p>
          <button class="gold-glow-btn reset-btn font-mal" @click="resetFilters">
            {{ isMalayalam ? 'എല്ലാം കാണിക്കുക' : 'Show All' }}
          </button>
        </div>

        <!-- Platform Footer Info -->
        <footer class="app-footer">
          <div class="footer-seal">🛕</div>
          <p class="footer-title font-mal">
            {{ isMalayalam ? activeTemple.nameMl + ' • ഡിജിറ്റൽ വഴിപാട് സംവിധാനം' : activeTemple.nameEn + ' • Digital Vazhipadu Platform' }}
          </p>
          <p class="footer-sub">
            {{ isMalayalam ? 'ഏകീകൃത കേരള ക്ഷേത്ര ക്യുആർ ബുക്കിംഗ് പ്ലാറ്റ്‌ഫോം' : 'Unified Kerala Temples QR Booking Platform' }}
          </p>
          <div class="footer-links-row">
            <button class="footer-notif-link" @click="openNotificationsModal">
              📋 {{ isMalayalam ? 'ക്ഷേത്ര വിജ്ഞാപനങ്ങൾ (Notifications)' : 'Temple Notifications' }}
            </button>
          </div>
          <button class="staff-portal-link-btn" @click="promptStaffLogin">
            🔒 {{ isMalayalam ? 'ക്ഷേത്ര ജീവനക്കാർക്ക് (Staff Portal)' : 'Temple Staff Portal' }}
          </button>
        </footer>
      </main>

      <!-- Floating Sticky Cart Summary Bar -->
      <CartSummaryBar 
        :item-count="cart.length"
        :total-amount="cartTotal"
        :is-malayalam="isMalayalam"
        @open-checkout="isCheckoutOpen = true"
      />

      <!-- Devotee Form Modal -->
      <DevoteeFormModal 
        v-if="isDevoteeModalOpen && selectedOffering"
        :selected-offering="selectedOffering"
        :nakshathras="NAKSHATHRANGAL"
        :is-malayalam="isMalayalam"
        @close="isDevoteeModalOpen = false"
        @add-to-cart="handleAddToCart"
      />

      <!-- Checkout Modal -->
      <CheckoutModal 
        v-if="isCheckoutOpen"
        :cart="cart"
        :active-temple="activeTemple"
        :total-amount="cartTotal"
        :is-malayalam="isMalayalam"
        @close="isCheckoutOpen = false"
        @remove-item="handleRemoveCartItem"
        @payment-success="handlePaymentSuccess"
      />

      <!-- Digital Token Receipt Modal -->
      <ReceiptModal 
        v-if="isReceiptOpen && latestReceiptData"
        :booking-data="latestReceiptData"
        :is-malayalam="isMalayalam"
        @close="isReceiptOpen = false"
      />

      <!-- Official Devaswom Notifications Board Modal (Ref: https://guruvayurdevaswom.in/#/notifications) -->
      <div v-if="isNotificationsModalOpen" class="modal-overlay" @click.self="isNotificationsModalOpen = false">
        <div class="bottom-sheet notif-modal-sheet">
          <div class="sheet-handle"></div>
          
          <div class="notif-modal-header">
            <div class="notif-crest">
              <span class="crest-icon">{{ activeTemple.icon }}</span>
              <div>
                <h2 class="notif-modal-title font-mal">
                  {{ isMalayalam ? activeTemple.nameMl + ' വിജ്ഞാപനങ്ങൾ' : activeTemple.nameEn + ' Official Notices' }}
                </h2>
                <p class="notif-modal-sub font-mal">
                  {{ isMalayalam ? activeTemple.locationMl + ' • ഔദ്യോഗിക അറിയിപ്പുകൾ' : activeTemple.locationEn + ' • Official Announcements' }}
                </p>
              </div>
            </div>
            <button class="sheet-close-btn" @click="isNotificationsModalOpen = false">✕</button>
          </div>

          <!-- Multi-Temple Filter Tabs -->
          <div class="notif-filter-bar">
            <button 
              type="button"
              class="notif-filter-pill font-mal"
              :class="{ active: selectedNotifFilter === 'active' || selectedNotifFilter === activeTempleId }"
              @click="selectedNotifFilter = 'active'"
            >
              <span>{{ activeTemple.icon }}</span>
              <span>{{ isMalayalam ? activeTemple.nameMl : activeTemple.nameEn }}</span>
            </button>

            <button 
              v-for="t in TEMPLES.filter(t => t.id !== activeTempleId)" 
              :key="t.id"
              type="button"
              class="notif-filter-pill font-mal"
              :class="{ active: selectedNotifFilter === t.id }"
              @click="selectedNotifFilter = t.id"
            >
              <span>{{ t.icon }}</span>
              <span>{{ isMalayalam ? t.nameMl : t.nameEn }}</span>
            </button>

            <button 
              type="button"
              class="notif-filter-pill font-mal"
              :class="{ active: selectedNotifFilter === 'all' }"
              @click="selectedNotifFilter = 'all'"
            >
              <span>📜</span>
              <span>{{ isMalayalam ? 'എല്ലാ ക്ഷേത്രങ്ങളും' : 'All Temples' }}</span>
            </button>
          </div>

          <div class="notif-modal-body">
            <div 
              v-for="notif in modalNotifications" 
              :key="notif.id"
              class="notif-card"
            >
              <div class="notif-card-top">
                <span class="notif-ref font-mono">{{ notif.refNo }}</span>
                <span class="notif-date">📅 {{ notif.date }}</span>
                <span class="badge-crimson" v-if="notif.badge">{{ notif.badge }}</span>
              </div>
              <h3 class="notif-item-title font-mal">
                {{ isMalayalam ? notif.titleMl : notif.titleEn }}
              </h3>
              <p class="notif-item-desc">
                {{ isMalayalam ? notif.descMl : notif.descEn }}
              </p>
            </div>

            <!-- Official Link Attribution Card -->
            <div class="notif-official-source-card">
              <span class="shield-sym">🏛️</span>
              <div>
                <div class="source-title font-mal">
                  {{ isMalayalam ? (activeTemple.nameMl + ' ഔദ്യോഗിക വെബ്സൈറ്റ് റഫറൻസ്') : (activeTemple.nameEn + ' Official Reference') }}
                </div>
                <div class="source-url font-mono">
                  {{ activeTemple.officialUrl || 'https://guruvayurdevaswom.in/#/notifications' }}
                </div>
              </div>
            </div>
          </div>

          <div class="notif-modal-footer">
            <button class="gold-glow-btn w-full" @click="isNotificationsModalOpen = false">
              <span>{{ isMalayalam ? 'മനസ്സിലായി / അടയ്ക്കുക' : 'Close Notifications' }}</span>
              <span>✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue';
import { TEMPLES, NAKSHATHRANGAL, CATEGORIES, INITIAL_BOOKINGS, OFFICIAL_NOTIFICATIONS } from './data/templeData.js';
import { isSupabaseConfigured, fetchAllBookings, insertBookings, subscribeToRealtimeBookings } from './lib/supabase.js';

import TempleHeader from './components/TempleHeader.vue';
import VazhipaduCategoryNav from './components/VazhipaduCategoryNav.vue';
import VazhipaduCard from './components/VazhipaduCard.vue';
import DevoteeFormModal from './components/DevoteeFormModal.vue';
import CartSummaryBar from './components/CartSummaryBar.vue';
import CheckoutModal from './components/CheckoutModal.vue';
import ReceiptModal from './components/ReceiptModal.vue';
import AdminDashboardView from './components/AdminDashboardView.vue';

// Synchronously read initial view mode so there is NO flicker on page reload/refresh
const getInitialViewMode = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam === 'admin') return 'admin';
    if (viewParam === 'devotee') return 'devotee';
    if (urlParams.get('devotee') === 'true') return 'devotee';

    const saved = localStorage.getItem('kshetra_portal_view_mode');
    if (saved === 'admin') return 'admin';
  } catch {}
  return 'devotee';
};

const viewMode = ref(getInitialViewMode());
const isDevoteeScan = ref(false);

const setViewMode = (mode) => {
  viewMode.value = mode;
  try {
    localStorage.setItem('kshetra_portal_view_mode', mode);
    const url = new URL(window.location.href);
    if (mode === 'admin') {
      url.searchParams.set('view', 'admin');
      url.searchParams.delete('devotee');
      isDevoteeScan.value = false;
    } else {
      url.searchParams.delete('view');
    }
    window.history.replaceState({}, '', url.toString());
  } catch (err) {
    console.warn('Could not persist view mode:', err);
  }
};

// Persistent Language (defaults to Malayalam)
const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem('kshetra_portal_lang');
    if (saved === 'en') return false;
  } catch {}
  return true;
};

const isMalayalam = ref(getInitialLanguage());

const setLanguage = (val) => {
  isMalayalam.value = val;
  try {
    localStorage.setItem('kshetra_portal_lang', val ? 'ml' : 'en');
  } catch {}
};

// Persistent Active Temple
const getInitialTemple = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const templeParam = params.get('temple');
    if (templeParam) {
      const matched = TEMPLES.find(t => 
        t.slug.toLowerCase() === templeParam.toLowerCase() || 
        t.code.toLowerCase() === templeParam.toLowerCase() ||
        t.id.toLowerCase() === templeParam.toLowerCase()
      );
      if (matched) return matched.id;
    }
    const saved = localStorage.getItem('kshetra_active_temple');
    if (saved && TEMPLES.some(t => t.id === saved)) {
      return saved;
    }
  } catch {}
  return 'temple-guruvayur';
};

// State
const activeTempleId = ref(getInitialTemple());
const searchQuery = ref('');
const selectedCategory = ref('all');

const cart = ref([]);
const allBookings = ref([...INITIAL_BOOKINGS]);
const isSupabaseConnected = ref(isSupabaseConfigured());

// Notifications State
const isNotificationsModalOpen = ref(false);
const activeNotificationIndex = ref(0);
const selectedNotifFilter = ref('active');

const openNotificationsModal = () => {
  selectedNotifFilter.value = 'active';
  isNotificationsModalOpen.value = true;
};

// Notifications relevant to active temple
const templeNotifications = computed(() => {
  const notifs = OFFICIAL_NOTIFICATIONS.filter(
    n => n.templeId === activeTempleId.value || n.templeId === 'all'
  );
  return notifs.length > 0 ? notifs : OFFICIAL_NOTIFICATIONS;
});

const activeNotification = computed(() => {
  const list = templeNotifications.value;
  return list[activeNotificationIndex.value % list.length] || list[0];
});

const modalNotifications = computed(() => {
  if (selectedNotifFilter.value === 'all') {
    return OFFICIAL_NOTIFICATIONS;
  }
  const targetId = selectedNotifFilter.value === 'active' 
    ? activeTempleId.value 
    : selectedNotifFilter.value;
  return OFFICIAL_NOTIFICATIONS.filter(n => n.templeId === targetId || n.templeId === 'all');
});

// Rotate notification ticker every 5 seconds
let notifTickerTimer = null;
onMounted(() => {
  notifTickerTimer = setInterval(() => {
    const list = templeNotifications.value;
    activeNotificationIndex.value = (activeNotificationIndex.value + 1) % list.length;
  }, 5000);
});

onUnmounted(() => {
  if (notifTickerTimer) clearInterval(notifTickerTimer);
  if (realtimeUnsub) realtimeUnsub();
});

// Staff PIN login prompt (PIN: 1234)
const promptStaffLogin = () => {
  const pin = prompt(
    isMalayalam.value 
      ? 'ക്ഷേത്ര സ്റ്റാഫ് പിൻ നമ്പർ നൽകുക (Default PIN: 1234):' 
      : 'Enter Temple Staff PIN (Default PIN: 1234):'
  );
  if (pin === '1234') {
    setViewMode('admin');
  } else if (pin !== null) {
    alert(isMalayalam.value ? 'തെറ്റായ പിൻ നമ്പർ! പ്രവേശനം അഡ്മിനുകൾക്ക് മാത്രം.' : 'Incorrect PIN! Access restricted to temple staff.');
  }
};

// Database Fetch
const fetchBookings = async () => {
  try {
    const data = await fetchAllBookings();
    if (data && data.length > 0) {
      allBookings.value = data;
    }
  } catch (err) {
    console.warn('Fetch bookings error:', err);
  }
};

let pollTimer = null;
let realtimeUnsub = null;

// Only poll if Supabase realtime is not active & in Admin mode
watchEffect(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  if (viewMode.value === 'admin' && !isSupabaseConfigured()) {
    fetchBookings();
    pollTimer = setInterval(fetchBookings, 3000);
  }
});

onMounted(() => {
  // 1. Initial bookings fetch
  fetchBookings();

  // 2. Subscribe to Supabase Realtime WebSockets if configured
  if (isSupabaseConfigured()) {
    realtimeUnsub = subscribeToRealtimeBookings(
      (newBooking) => {
        if (!allBookings.value.some(b => b.tokenNo === newBooking.tokenNo)) {
          allBookings.value = [newBooking, ...allBookings.value];
        }
      },
      (updatedBooking) => {
        const idx = allBookings.value.findIndex(b => b.tokenNo === updatedBooking.tokenNo);
        if (idx !== -1) {
          allBookings.value[idx] = { ...allBookings.value[idx], ...updatedBooking };
        }
      }
    );
  }

  // 3. Read query params (?temple=slug or ?view=admin or ?devotee=true)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const templeParam = urlParams.get('temple');
    const viewParam = urlParams.get('view');
    const isDevoteeParam = urlParams.get('devotee');

    if (templeParam) {
      const matched = TEMPLES.find(t => 
        t.slug.toLowerCase() === templeParam.toLowerCase() || 
        t.code.toLowerCase() === templeParam.toLowerCase() ||
        t.id.toLowerCase() === templeParam.toLowerCase()
      );
      if (matched) {
        activeTempleId.value = matched.id;
      }
    }

    if (viewParam === 'admin') {
      setViewMode('admin');
    } else if (isDevoteeParam === 'true') {
      setViewMode('devotee');
      isDevoteeScan.value = true;
    } else if (templeParam && !urlParams.get('view') && localStorage.getItem('kshetra_portal_view_mode') !== 'admin') {
      setViewMode('devotee');
      isDevoteeScan.value = true;
    } else {
      const savedMode = localStorage.getItem('kshetra_portal_view_mode');
      if (savedMode === 'admin') {
        setViewMode('admin');
      } else {
        viewMode.value = 'devotee';
      }
    }
  } catch (err) {
    console.error('URL parse error:', err);
  }
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

// Modals State
const selectedOffering = ref(null);
const isDevoteeModalOpen = ref(false);
const isCheckoutOpen = ref(false);
const isReceiptOpen = ref(false);
const latestReceiptData = ref(null);

// Sync #app class for wide desktop in admin mode
watchEffect(() => {
  const appEl = document.getElementById('app');
  if (appEl) {
    if (viewMode.value === 'admin') {
      appEl.classList.add('is-admin-mode');
    } else {
      appEl.classList.remove('is-admin-mode');
    }
  }
});

// Active Temple
const activeTemple = computed(() => {
  return TEMPLES.find(t => t.id === activeTempleId.value) || TEMPLES[0];
});

// Filtered Offerings
const filteredOfferings = computed(() => {
  let list = activeTemple.value.offerings || [];

  if (selectedCategory.value !== 'all') {
    list = list.filter(item => item.category === selectedCategory.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(item => 
      item.nameEn.toLowerCase().includes(q) || 
      item.nameMl.toLowerCase().includes(q) ||
      (item.descriptionEn && item.descriptionEn.toLowerCase().includes(q))
    );
  }

  return list;
});

// Cart calculations
const cartTotal = computed(() => {
  return cart.value.reduce((acc, curr) => acc + curr.totalPrice, 0);
});

const getCartCountForOffering = (offeringId) => {
  return cart.value
    .filter(item => item.offering.id === offeringId)
    .reduce((sum, item) => sum + (item.quantity || 1), 0);
};

// Actions
const handleTempleChange = (newTempleId) => {
  activeTempleId.value = newTempleId;
  try {
    localStorage.setItem('kshetra_active_temple', newTempleId);
  } catch {}
  selectedCategory.value = 'all';
  searchQuery.value = '';
  if (cart.value.length > 0) {
    if (confirm('Switching temples will reset your current basket. Proceed?')) {
      cart.value = [];
    }
  }
};

const openDevoteeModal = (offering) => {
  selectedOffering.value = offering;
  isDevoteeModalOpen.value = true;
};

const handleAddToCart = (orderData) => {
  if (Array.isArray(orderData)) {
    cart.value.push(...orderData);
  } else {
    cart.value.push(orderData);
  }
  isDevoteeModalOpen.value = false;
  selectedOffering.value = null;
};

const handleRemoveCartItem = (index) => {
  cart.value.splice(index, 1);
  if (cart.value.length === 0) {
    isCheckoutOpen.value = false;
  }
};

const handlePaymentSuccess = async (bookingDetails) => {
  isCheckoutOpen.value = false;

  const newItems = bookingDetails.cart.map((item, idx) => ({
    tokenNo: `${bookingDetails.tokenNo}-${idx + 1}`,
    templeId: bookingDetails.temple.id,
    vazhipaduName: item.offering.nameMl + ' (' + item.offering.nameEn + ')',
    devoteeName: item.devoteeName,
    nakshathram: item.nakshathram,
    date: item.date,
    time: bookingDetails.paidAt,
    amount: item.totalPrice,
    status: 'Ready for Collection',
    collected: false,
    phone: item.phone
  }));

  // Optimistic local update
  allBookings.value = [...newItems, ...allBookings.value];

  // Sync to Supabase cloud database (with local fallback)
  try {
    await insertBookings(newItems);
  } catch (err) {
    console.error('Failed to sync booking to database:', err);
  }

  latestReceiptData.value = bookingDetails;
  isReceiptOpen.value = true;
  cart.value = [];
};

const resetFilters = () => {
  selectedCategory.value = 'all';
  searchQuery.value = '';
};
</script>

<style scoped>
.app-root-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Top Global Switcher (Maroon Devaswom Bar) */
.global-portal-switch {
  background: #7e1121;
  border-bottom: 2px solid #b45309;
  padding: 8px 16px;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 4px 15px rgba(126, 17, 33, 0.2);
}

.portal-switch-inner {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.portal-mode-group, .global-lang-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch-badge, .lang-label {
  font-size: 11px;
  color: #fef08a;
  letter-spacing: 0.05em;
  font-weight: 800;
}

.portal-buttons {
  display: flex;
  gap: 8px;
}

.portal-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(254, 240, 138, 0.35);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.portal-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.portal-btn.active {
  background: #ffffff;
  color: #7e1121;
  font-weight: 800;
  border-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Language Pill Container */
.lang-pill-container {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(254, 240, 138, 0.4);
  border-radius: var(--radius-full);
  padding: 2px;
}

.lang-pill-btn {
  background: transparent;
  border: none;
  color: #fef08a;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-pill-btn:hover {
  color: #ffffff;
}

.lang-pill-btn.active {
  background: #fef08a;
  color: #7e1121;
  font-weight: 800;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.p-icon {
  font-size: 14px;
}

/* Devotee Mobile Wrapper */
.devotee-mobile-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
}

/* Guruvayur Devaswom Notification Marquee Strip */
.notifications-strip {
  background: #fef2f2;
  border-bottom: 1.5px solid #fecaca;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notifications-strip:hover {
  background: #fee2e2;
}

.notif-badge-btn {
  background: #7e1121;
  color: #ffffff;
  border: none;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(126, 17, 33, 0.2);
}

.bell-icon {
  font-size: 12px;
}

.notif-ticker-text {
  font-size: 12px;
  color: #991b1b;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.notif-view-link {
  font-size: 11px;
  color: #b45309;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
}

.quick-notice-strip {
  background: #fffbeb;
  border-bottom: 1px solid #fde68a;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #92400e;
  font-weight: 600;
}

.notice-icon {
  font-size: 13px;
}

.offerings-main {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.offerings-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #7e1121;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-pill {
  font-size: 12px;
  color: #78716c;
}

.temple-code-tag {
  background: #f8f6f0;
  border: 1px solid #ebd9c2;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: #b45309;
  font-weight: 700;
}

.offerings-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state-card {
  padding: 40px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1.5px solid #ebd9c2;
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(126, 17, 33, 0.04);
}

.empty-icon {
  font-size: 32px;
  color: #b45309;
}

.empty-title {
  font-size: 16px;
  font-weight: 800;
  color: #7e1121;
}

.empty-sub {
  font-size: 12px;
  color: #78716c;
}

.reset-btn {
  margin-top: 8px;
  padding: 9px 18px;
  border-radius: var(--radius-full);
}

.app-footer {
  margin-top: 32px;
  padding: 24px 16px 80px;
  text-align: center;
  border-top: 1.5px solid #ebd9c2;
  background: #fbf9f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.footer-seal {
  font-size: 26px;
}

.footer-title {
  font-size: 13px;
  font-weight: 800;
  color: #7e1121;
}

.footer-sub {
  font-size: 11px;
  color: #78716c;
}

.footer-links-row {
  margin-top: 8px;
}

.footer-notif-link {
  background: #ffffff;
  border: 1px solid #ebd9c2;
  color: #7e1121;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-notif-link:hover {
  background: #fef2f2;
  border-color: #7e1121;
}

.staff-portal-link-btn {
  margin-top: 10px;
  background: #ffffff;
  border: 1px dashed #d6cbba;
  color: #78716c;
  font-size: 11px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
}

.staff-portal-link-btn:hover {
  color: #7e1121;
  border-color: #7e1121;
  background: #ffffff;
}

/* Notifications Board Modal */
.notif-modal-sheet {
  max-height: 90vh;
  background: #ffffff;
}

.notif-modal-header {
  padding: 16px 20px 12px;
  background: #fdfbf7;
  border-bottom: 1.5px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notif-crest {
  display: flex;
  align-items: center;
  gap: 10px;
}

.crest-icon {
  font-size: 28px;
}

.notif-modal-title {
  font-size: 17px;
  font-weight: 800;
  color: #7e1121;
}

.notif-modal-sub {
  font-size: 11px;
  color: #78716c;
}

.notif-filter-bar {
  display: flex;
  gap: 8px;
  padding: 10px 18px;
  background: #fbf9f4;
  border-bottom: 1.5px solid var(--border-subtle);
  overflow-x: auto;
  scrollbar-width: none;
}

.notif-filter-bar::-webkit-scrollbar {
  display: none;
}

.notif-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 700;
  color: #44403c;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.notif-filter-pill:hover {
  border-color: #d97706;
  background: #fffbeb;
}

.notif-filter-pill.active {
  background: #7e1121;
  color: #ffffff;
  border-color: #7e1121;
  box-shadow: 0 2px 6px rgba(126, 17, 33, 0.2);
}

.notif-modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #ffffff;
}

.notif-card {
  background: #fdfcf9;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.notif-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  flex-wrap: wrap;
}

.notif-ref {
  color: #b45309;
  font-weight: 700;
}

.notif-date {
  color: #78716c;
}

.notif-item-title {
  font-size: 14px;
  font-weight: 800;
  color: #7e1121;
  line-height: 1.35;
}

.notif-item-desc {
  font-size: 12px;
  color: #44403c;
  line-height: 1.5;
}

.notif-official-source-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fffbeb;
  border: 1.5px dashed #f59e0b;
  border-radius: var(--radius-md);
  padding: 12px;
  margin-top: 4px;
}

.shield-sym {
  font-size: 24px;
}

.source-title {
  font-size: 12px;
  font-weight: 800;
  color: #92400e;
}

.source-url {
  font-size: 11px;
  color: #78350f;
  word-break: break-all;
}

.notif-modal-footer {
  padding: 14px 20px;
  background: #fdfbf7;
  border-top: 1.5px solid var(--border-subtle);
}

.w-full {
  width: 100%;
}
</style>
