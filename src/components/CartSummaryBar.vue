<template>
  <div v-if="itemCount > 0" class="cart-floating-bar-wrap">
    <div class="cart-bar">
      <div class="cart-left">
        <div class="cart-badge-icon">
          <span class="bag-icon">🪔</span>
          <span class="count-pill">{{ itemCount }}</span>
        </div>
        <div class="cart-pricing">
          <span class="pricing-label">{{ isMalayalam ? 'ആകെ തുക' : 'Total Amount' }}</span>
          <span class="pricing-val">₹{{ totalAmount }}</span>
        </div>
      </div>

      <button class="checkout-cta-btn" @click="$emit('open-checkout')">
        <span>{{ isMalayalam ? 'ഓർഡർ ചെയ്യുക' : 'Review & Pay' }}</span>
        <span class="arrow-sym">→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  itemCount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  isMalayalam: {
    type: Boolean,
    default: true
  }
});

defineEmits(['open-checkout']);
</script>

<style scoped>
.cart-floating-bar-wrap {
  position: sticky;
  bottom: 14px;
  left: 0;
  right: 0;
  padding: 0 16px;
  z-index: 50;
  pointer-events: none;
  animation: bounceUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes bounceUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.cart-bar {
  pointer-events: auto;
  background: linear-gradient(135deg, #7e1121 0%, #991b1b 100%);
  border: 1.5px solid #d97706;
  box-shadow: 0 8px 30px rgba(126, 17, 33, 0.35), 0 2px 10px rgba(180, 83, 9, 0.25);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--radius-xl);
}

.cart-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-badge-icon {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(254, 240, 138, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bag-icon {
  font-size: 20px;
}

.count-pill {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f59e0b;
  color: #7e1121;
  font-size: 10px;
  font-weight: 900;
  min-width: 18px;
  height: 18px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

.cart-pricing {
  display: flex;
  flex-direction: column;
}

.pricing-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
}

.pricing-val {
  font-size: 20px;
  font-weight: 900;
  color: #fef08a;
}

.checkout-cta-btn {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #7e1121;
  font-weight: 800;
  border: none;
  padding: 10px 18px;
  font-size: 13px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.checkout-cta-btn:hover {
  background: #fde68a;
  transform: translateY(-1px);
}

.arrow-sym {
  font-size: 15px;
}
</style>
