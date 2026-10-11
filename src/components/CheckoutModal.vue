<template>
  <div class="modal-overlay" @click.self="!isProcessing && $emit('close')">
    <div class="bottom-sheet checkout-sheet">
      <div class="sheet-handle"></div>

      <!-- Header -->
      <div class="sheet-header">
        <h2 class="sheet-title font-mal">
          {{ isMalayalam ? 'വഴിപാട് ഓർഡർ പരിശോധിക്കുക' : 'Review & Pay Offerings' }}
        </h2>
        <p class="sheet-subtitle">
          {{ isMalayalam ? activeTemple.nameMl : activeTemple.nameEn }}
        </p>
        <button v-if="!isProcessing" class="sheet-close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Sheet Body -->
      <div class="sheet-body">
        <!-- Cart Items List -->
        <div class="items-section">
          <div class="section-title">
            <span>{{ isMalayalam ? 'തിരഞ്ഞെടുത്ത വഴിപാടുകൾ' : 'Selected Offerings' }} ({{ cart.length }})</span>
          </div>

          <div class="cart-items-list">
            <div 
              v-for="(item, index) in cart" 
              :key="index"
              class="cart-item-card"
            >
              <div class="item-left">
                <span class="item-icon">{{ item.offering.icon }}</span>
                <div class="item-info">
                  <div class="item-name font-mal">
                    {{ isMalayalam ? item.offering.nameMl : item.offering.nameEn }}
                    <span v-if="item.quantity > 1" class="qty-badge">x{{ item.quantity }}</span>
                  </div>
                  <div class="item-devotee">
                    <span class="devotee-tag">👤 {{ item.devoteeName }}</span>
                    <span class="star-tag">⭐ {{ item.nakshathram }}</span>
                  </div>
                  <div class="item-date">
                    📅 {{ item.date }}
                  </div>
                </div>
              </div>

              <div class="item-right">
                <span class="item-price">₹{{ item.totalPrice }}</span>
                <button 
                  v-if="!isProcessing"
                  class="remove-item-btn" 
                  @click="$emit('remove-item', index)"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Official Temple Payment Routing Box -->
        <div class="payout-routing-card">
          <div class="payout-header">
            <span class="temple-bank-icon">🏛️</span>
            <div>
              <div class="payout-title">{{ isMalayalam ? 'നേരിട്ടുള്ള ക്ഷേത്ര ദേവസ്വം അക്കൗണ്ട്' : 'Direct Temple Devaswom Payout' }}</div>
              <div class="payout-upi font-mono">{{ activeTemple.upiId }}</div>
            </div>
          </div>
          <div class="payout-guarantee">
            <span class="shield-icon">🛡️</span>
            <span>{{ isMalayalam ? 'പണം 100% നേരിട്ട് ക്ഷേത്ര ട്രസ്റ്റിന്റെ അക്കൗണ്ടിലേക്ക് പോകുന്നു' : '100% funds transferred directly to temple committee bank account' }}</span>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="payment-method-section">
          <div class="section-title">
            <span>{{ isMalayalam ? 'പേയ്‌മെന്റ് രീതി തിരഞ്ഞെടുക്കുക' : 'Select Payment Method' }}</span>
          </div>

          <div class="payment-options-grid">
            <label 
              class="payment-option-card"
              :class="{ selected: selectedPaymentMethod === 'gpay' }"
            >
              <input type="radio" v-model="selectedPaymentMethod" value="gpay" name="payMethod" class="radio-hidden" />
              <div class="pay-icon-box gpay-box">GPay</div>
              <span class="pay-title">Google Pay</span>
            </label>

            <label 
              class="payment-option-card"
              :class="{ selected: selectedPaymentMethod === 'phonepe' }"
            >
              <input type="radio" v-model="selectedPaymentMethod" value="phonepe" name="payMethod" class="radio-hidden" />
              <div class="pay-icon-box phonepe-box">पे</div>
              <span class="pay-title">PhonePe</span>
            </label>

            <label 
              class="payment-option-card"
              :class="{ selected: selectedPaymentMethod === 'paytm' }"
            >
              <input type="radio" v-model="selectedPaymentMethod" value="paytm" name="payMethod" class="radio-hidden" />
              <div class="pay-icon-box paytm-box">Paytm</div>
              <span class="pay-title">Paytm / UPI</span>
            </label>

            <label 
              class="payment-option-card"
              :class="{ selected: selectedPaymentMethod === 'counter_cash' }"
            >
              <input type="radio" v-model="selectedPaymentMethod" value="counter_cash" name="payMethod" class="radio-hidden" />
              <div class="pay-icon-box cash-box">💵</div>
              <span class="pay-title">{{ isMalayalam ? 'കൗണ്ടർ ക്യാഷ്' : 'Counter Cash' }}</span>
            </label>
          </div>
        </div>

        <!-- Order Summary Breakdown -->
        <div class="bill-summary-card">
          <div class="bill-row">
            <span>{{ isMalayalam ? 'വഴിപാടുകളുടെ തുക' : 'Vazhipadu Subtotal' }}</span>
            <span class="font-bold">₹{{ totalAmount }}</span>
          </div>
          <div class="bill-row">
            <span>{{ isMalayalam ? 'പ്ലാറ്റ്‌ഫോം സർവീസ് ചാർജ്' : 'Platform Convenience Fee' }}</span>
            <span class="text-green">{{ isMalayalam ? 'സൗജന്യം (₹0)' : 'FREE (₹0)' }}</span>
          </div>
          <div class="bill-divider"></div>
          <div class="bill-row total-row">
            <span>{{ isMalayalam ? 'ആകെ അടയ്‌ക്കേണ്ട തുക' : 'Total Payable' }}</span>
            <span class="total-amount">₹{{ totalAmount }}</span>
          </div>
        </div>
      </div>

      <!-- Processing State Overlay -->
      <div v-if="isProcessing" class="processing-state-overlay">
        <div class="spinner-ring"></div>
        <div class="processing-text font-mal">
          {{ isMalayalam ? 'പേയ്‌മെന്റ് വെരിഫൈ ചെയ്യുന്നു...' : 'Connecting to UPI Gateway...' }}
        </div>
        <div class="processing-sub font-mono">
          {{ activeTemple.upiId }}
        </div>
      </div>

      <!-- Footer CTA -->
      <div class="sheet-footer" v-if="!isProcessing">
        <button 
          class="gold-glow-btn pay-now-btn"
          @click="initiatePayment"
        >
          <span class="shield-lock">🔒</span>
          <span>
            {{ isMalayalam ? 'തുക അടയ്ക്കുക (Pay ₹' + totalAmount + ')' : 'Pay ₹' + totalAmount + ' via UPI' }}
          </span>
          <span class="arrow-sym">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import confetti from 'canvas-confetti';

const props = defineProps({
  cart: {
    type: Array,
    required: true
  },
  activeTemple: {
    type: Object,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  isMalayalam: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close', 'remove-item', 'payment-success']);

const selectedPaymentMethod = ref('gpay');
const isProcessing = ref(false);

const initiatePayment = () => {
  isProcessing.value = true;

  // Simulate ultra-smooth realistic UPI processing (1.5 seconds)
  setTimeout(() => {
    isProcessing.value = false;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7e1121', '#f59e0b', '#059669', '#b45309']
      });
    } catch {
      // fallback if unavailable
    }

    // Generate random realistic token number
    const randomNum = Math.floor(100 + Math.random() * 900);
    const tokenNo = `${props.activeTemple.code}-${randomNum}`;

    emit('payment-success', {
      tokenNo,
      cart: [...props.cart],
      totalAmount: props.totalAmount,
      temple: props.activeTemple,
      paymentMethod: selectedPaymentMethod.value,
      paidAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  }, 1500);
};
</script>

<style scoped>
.checkout-sheet {
  max-height: 92vh;
  background: #ffffff;
  position: relative;
}

.sheet-header {
  padding: 16px 20px 12px;
  background: #fdfbf7;
  border-bottom: 1.5px solid var(--border-subtle);
  position: relative;
}

.sheet-title {
  font-size: 18px;
  font-weight: 800;
  color: #7e1121;
}

.sheet-subtitle {
  font-size: 12px;
  color: #b45309;
  font-weight: 700;
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
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #44403c;
  margin-bottom: 8px;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-item-card {
  background: #fdfcf9;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  font-size: 20px;
}

.item-name {
  font-size: 14px;
  font-weight: 800;
  color: #7e1121;
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-badge {
  font-size: 11px;
  background: #fef08a;
  color: #854d0e;
  padding: 1px 6px;
  border-radius: 99px;
  font-weight: 700;
}

.item-devotee {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #44403c;
  margin-top: 2px;
}

.devotee-tag {
  color: #b45309;
  font-weight: 600;
}

.item-date {
  font-size: 11px;
  color: #78716c;
  margin-top: 2px;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-price {
  font-size: 15px;
  font-weight: 800;
  color: #b45309;
}

.remove-item-btn {
  background: #f5eedf;
  border: none;
  color: #78716c;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.remove-item-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
}

/* Temple Bank Account Payout Box */
.payout-routing-card {
  background: #fffbeb;
  border: 1.5px dashed #f59e0b;
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.payout-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.temple-bank-icon {
  font-size: 22px;
}

.payout-title {
  font-size: 12px;
  font-weight: 800;
  color: #92400e;
}

.payout-upi {
  font-size: 11px;
  color: #78350f;
  font-weight: 700;
}

.payout-guarantee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #065f46;
  font-weight: 600;
}

.shield-icon {
  font-size: 12px;
}

/* Payment Method Cards */
.payment-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.payment-option-card {
  background: #f8f6f0;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option-card:hover {
  border-color: #b45309;
}

.payment-option-card.selected {
  border-color: #b45309;
  background: #fffbeb;
  box-shadow: 0 0 0 1px #b45309, 0 2px 8px rgba(180, 83, 9, 0.15);
}

.radio-hidden {
  display: none;
}

.pay-icon-box {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.gpay-box {
  background: #ffffff;
  color: #1a73e8;
  border: 1px solid #e2e8f0;
}

.phonepe-box {
  background: #5f259f;
  color: #ffffff;
  font-size: 15px;
}

.paytm-box {
  background: #002970;
  color: #00b9f5;
  font-size: 9px;
}

.cash-box {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  font-size: 16px;
}

.pay-title {
  font-size: 12px;
  font-weight: 700;
  color: #1c1917;
}

/* Bill Breakdown */
.bill-summary-card {
  background: #fdfbf7;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #44403c;
}

.font-bold {
  font-weight: 700;
}

.text-green {
  color: #065f46;
  font-weight: 700;
}

.bill-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 4px 0;
}

.total-row {
  font-size: 14px;
  font-weight: 800;
  color: #1c1917;
}

.total-amount {
  font-size: 19px;
  font-weight: 900;
  color: #b45309;
}

/* Processing Overlay */
.processing-state-overlay {
  padding: 30px 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.spinner-ring {
  width: 44px;
  height: 44px;
  border: 3px solid #fde68a;
  border-top-color: #7e1121;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.processing-text {
  font-size: 16px;
  font-weight: 800;
  color: #7e1121;
}

.processing-sub {
  font-size: 12px;
  color: #78716c;
}

.sheet-footer {
  padding: 14px 20px;
  background: #fdfbf7;
  border-top: 1.5px solid var(--border-subtle);
}

.pay-now-btn {
  width: 100%;
  padding: 14px;
  font-size: 15px;
}

.shield-lock {
  font-size: 14px;
}

.arrow-sym {
  font-size: 16px;
}
</style>
