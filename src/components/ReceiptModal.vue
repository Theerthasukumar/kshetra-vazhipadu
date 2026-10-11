<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="bottom-sheet receipt-sheet">
      <div class="sheet-handle"></div>

      <!-- Header with Status -->
      <div class="sheet-header text-center">
        <div class="success-icon-wrap">
          <span class="lamp-flame">🪔</span>
        </div>
        <h2 class="success-title font-mal">
          {{ isMalayalam ? 'വഴിപാട് ബുക്കിംഗ് വിജയകരം!' : 'Vazhipadu Booked Successfully!' }}
        </h2>
        <p class="success-subtitle">
          {{ isMalayalam ? 'കൗണ്ടറിൽ ഈ രസീത് / ടോക്കൺ കാണിച്ച് പ്രസാദം വാങ്ങുക' : 'Show this token at the counter to collect consecrated prasadam' }}
        </p>
        <button class="sheet-close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Printable Digital Receipt Card -->
      <div class="sheet-body">
        <div class="temple-receipt-paper" id="printable-receipt">
          <!-- Receipt Header -->
          <div class="receipt-top-banner">
            <span class="devaswom-seal">🛕</span>
            <div class="receipt-temple-name font-mal">
              {{ isMalayalam ? bookingData.temple.nameMl : bookingData.temple.nameEn }}
            </div>
            <div class="receipt-temple-loc font-sacred">
              {{ isMalayalam ? bookingData.temple.locationMl : bookingData.temple.locationEn }}
            </div>
            <div class="receipt-doc-title">
              {{ isMalayalam ? 'ദേവസ്വം ഡിജിറ്റൽ വഴിപാട് രസീത്' : 'OFFICIAL VAZHIPADU TOKEN & RECEIPT' }}
            </div>
          </div>

          <!-- Token Number Highlight -->
          <div class="token-banner">
            <span class="token-lbl">{{ isMalayalam ? 'ടോക്കൺ നമ്പർ' : 'TOKEN NUMBER' }}</span>
            <div class="token-big font-mono">{{ bookingData.tokenNo }}</div>
            <span class="token-time">📅 {{ bookingData.date }} • {{ bookingData.paidAt }}</span>
          </div>

          <!-- Verification QR Code -->
          <div class="qr-verify-box">
            <canvas ref="qrCanvas" class="qr-canvas"></canvas>
            <span class="qr-caption">{{ isMalayalam ? 'കൗണ്ടർ വെരിഫിക്കേഷൻ ക്യുആർ കോഡ്' : 'Scan to Verify at Prasadam Counter' }}</span>
          </div>

          <!-- Devotee Details -->
          <div class="receipt-table">
            <div class="receipt-row" v-for="(item, idx) in bookingData.cart" :key="idx">
              <div class="row-left">
                <div class="pooja-name font-mal">
                  {{ isMalayalam ? item.offering.nameMl : item.offering.nameEn }}
                  <span v-if="item.quantity > 1" class="qty-tag">x{{ item.quantity }}</span>
                </div>
                <div class="devotee-detail font-mal">
                  {{ isMalayalam ? 'പേര്' : 'Name' }}: <strong>{{ item.devoteeName }}</strong> | 
                  {{ isMalayalam ? 'നാൾ' : 'Star' }}: <strong>{{ item.nakshathram }}</strong>
                </div>
              </div>
              <div class="row-right">
                <span class="row-cost">₹{{ item.totalPrice }}</span>
              </div>
            </div>
          </div>

          <!-- Total & Transaction Stamp -->
          <div class="receipt-summary">
            <div class="summary-line">
              <span>{{ isMalayalam ? 'അടച്ച തുക (Paid Amount)' : 'Total Amount Paid' }}</span>
              <span class="summary-total">₹{{ bookingData.totalAmount }}</span>
            </div>
            <div class="summary-line sub-line">
              <span>{{ isMalayalam ? 'പേയ്‌മെന്റ് രീതി' : 'Payment Mode' }}</span>
              <span class="font-mono">UPI Instant (Verified)</span>
            </div>
            <div class="summary-line sub-line">
              <span>{{ isMalayalam ? 'റഫറൻസ് നമ്പർ' : 'Ref No' }}</span>
              <span class="font-mono">KVZ-{{ Math.floor(100000 + Math.random() * 900000) }}</span>
            </div>
          </div>

          <!-- Auspicious Blessings Footer -->
          <div class="receipt-footer">
            <span class="blessing-text font-mal">
              {{ isMalayalam ? 'സ്വാമി ശരണം • സർവൈശ്വര്യങ്ങളും നേരുന്നു' : 'May the Divine Blessings be with you always' }}
            </span>
          </div>
        </div>

        <!-- Notification Status Alert -->
        <div class="whatsapp-alert-pill">
          <span class="wa-icon">📲</span>
          <span>
            {{ isMalayalam ? 'ടോക്കൺ വിവരങ്ങൾ മൊബൈൽ നമ്പറിലേക്ക് അയച്ചിട്ടുണ്ട്' : 'Receipt & token details sent to your WhatsApp / SMS' }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="sheet-footer-actions">
        <button class="receipt-action-btn print-btn" @click="handlePrint">
          <span>🖨️</span>
          <span>{{ isMalayalam ? 'പ്രിന്റ് / സേവ്' : 'Print / Save Receipt' }}</span>
        </button>

        <button class="gold-glow-btn close-done-btn" @click="$emit('close')">
          <span>{{ isMalayalam ? 'പൂർത്തിയായി' : 'Done' }}</span>
          <span>✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  bookingData: {
    type: Object,
    required: true
  },
  isMalayalam: {
    type: Boolean,
    default: true
  }
});

defineEmits(['close']);

const qrCanvas = ref(null);

onMounted(async () => {
  await nextTick();
  if (qrCanvas.value) {
    try {
      const qrData = `VERIFY_TOKEN:${props.bookingData.tokenNo}|TEMPLE:${props.bookingData.temple.code}|AMOUNT:${props.bookingData.totalAmount}`;
      QRCode.toCanvas(qrCanvas.value, qrData, {
        width: 130,
        margin: 1,
        color: {
          dark: '#111827',
          light: '#ffffff'
        }
      });
    } catch (e) {
      console.error('QR generation error:', e);
    }
  }
});

const handlePrint = () => {
  window.print();
};
</script>

<style scoped>
.receipt-sheet {
  max-height: 94vh;
  background: #ffffff;
}

.text-center {
  text-align: center;
}

.sheet-header {
  padding: 18px 20px 12px;
  position: relative;
  background: #fdfbf7;
  border-bottom: 1.5px solid var(--border-subtle);
}

.success-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 24px;
}

.success-title {
  font-size: 19px;
  font-weight: 800;
  color: #7e1121;
  margin-bottom: 4px;
}

.success-subtitle {
  font-size: 12px;
  color: #57534e;
}

.sheet-close-btn {
  position: absolute;
  top: 16px;
  right: 18px;
  background: #f5eedf;
  border: none;
  color: #78716c;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.sheet-body {
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #ffffff;
}

/* Authentic Paper Receipt Design */
.temple-receipt-paper {
  background: #fffdf5;
  color: #1a1610;
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  border: 2px dashed #b45309;
  box-shadow: 0 4px 20px rgba(126, 17, 33, 0.08);
  position: relative;
}

.receipt-top-banner {
  text-align: center;
  border-bottom: 2px solid #ecd5ab;
  padding-bottom: 12px;
  margin-bottom: 14px;
}

.devaswom-seal {
  font-size: 30px;
  display: block;
  margin-bottom: 4px;
}

.receipt-temple-name {
  font-size: 16px;
  font-weight: 800;
  color: #7e1121;
}

.receipt-temple-loc {
  font-size: 11px;
  color: #78350f;
  margin-top: 1px;
}

.receipt-doc-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: #fef08a;
  color: #854d0e;
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  margin-top: 8px;
}

.token-banner {
  background: #ffffff;
  border: 1.5px solid #ebd3b0;
  border-radius: var(--radius-md);
  padding: 12px;
  text-align: center;
  margin-bottom: 14px;
}

.token-lbl {
  font-size: 10px;
  font-weight: 800;
  color: #92400e;
  letter-spacing: 0.05em;
}

.token-big {
  font-size: 26px;
  font-weight: 900;
  color: #7e1121;
  letter-spacing: 0.04em;
  margin: 2px 0;
}

.token-time {
  font-size: 11px;
  color: #78716c;
}

.qr-verify-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1.5px solid #ebd3b0;
  border-radius: var(--radius-md);
  padding: 10px;
  margin-bottom: 14px;
}

.qr-canvas {
  border-radius: 6px;
}

.qr-caption {
  font-size: 11px;
  font-weight: 700;
  color: #78350f;
}

.receipt-table {
  border-top: 1px dashed #d1b48c;
  border-bottom: 1px dashed #d1b48c;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 12px;
}

.pooja-name {
  font-weight: 700;
  color: #7e1121;
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-tag {
  background: #fde68a;
  color: #78350f;
  padding: 1px 5px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
}

.devotee-detail {
  font-size: 11px;
  color: #57534e;
  margin-top: 2px;
}

.row-cost {
  font-weight: 800;
  color: #b45309;
}

.receipt-summary {
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: #1e1b18;
}

.summary-total {
  font-size: 18px;
  font-weight: 900;
  color: #b45309;
}

.sub-line {
  font-size: 11px;
  font-weight: normal;
  color: #78716c;
}

.receipt-footer {
  text-align: center;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #ebd3b0;
}

.blessing-text {
  font-size: 11px;
  font-weight: 700;
  color: #92400e;
}

.whatsapp-alert-pill {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sheet-footer-actions {
  padding: 14px 20px;
  background: #fdfbf7;
  border-top: 1.5px solid var(--border-subtle);
  display: flex;
  gap: 10px;
}

.receipt-action-btn {
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  color: #1c1917;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.receipt-action-btn:hover {
  border-color: #7e1121;
  color: #7e1121;
}

.close-done-btn {
  flex-grow: 1;
  padding: 12px;
  font-size: 14px;
}
</style>
