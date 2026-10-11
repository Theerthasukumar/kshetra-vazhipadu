<template>
  <div class="vazhipadu-card glass-panel" :class="{ 'is-added': inCartCount > 0 }">
    <div class="card-top">
      <div class="icon-wrap">
        <span class="offering-icon">{{ offering.icon }}</span>
      </div>

      <div class="title-wrap">
        <div class="badge-row" v-if="offering.badge">
          <span class="badge-gold">
            <span class="sparkle">✦</span> {{ offering.badge }}
          </span>
        </div>
        <h3 class="vazhipadu-name-ml font-mal">{{ isMalayalam ? offering.nameMl : offering.nameEn }}</h3>
        <h4 class="vazhipadu-name-en">{{ isMalayalam ? offering.nameEn : offering.nameMl }}</h4>
      </div>
    </div>

    <p class="vazhipadu-desc">
      {{ isMalayalam ? offering.descriptionMl : offering.descriptionEn }}
    </p>

    <!-- Daily Availability Indicator -->
    <div class="quota-bar" v-if="offering.dailyLimit < 100">
      <div class="quota-info">
        <span class="quota-label">{{ isMalayalam ? 'ഇന്നത്തെ ലഭ്യത:' : 'Today\'s Quota:' }}</span>
        <span class="quota-count" :class="{ 'quota-low': offering.remaining < 10 }">
          {{ offering.remaining }} / {{ offering.dailyLimit }}
        </span>
      </div>
      <div class="quota-track">
        <div 
          class="quota-fill" 
          :style="{ width: ((offering.remaining / offering.dailyLimit) * 100) + '%' }"
        ></div>
      </div>
    </div>

    <!-- Pricing & Action Row -->
    <div class="card-bottom">
      <div class="price-box">
        <span class="currency">₹</span>
        <span class="amount">{{ offering.price }}</span>
      </div>

      <button 
        class="book-action-btn"
        :class="{ 'in-basket': inCartCount > 0 }"
        @click="$emit('select-offering', offering)"
      >
        <span v-if="inCartCount === 0" class="btn-content">
          <span class="plus-icon">+</span>
          <span>{{ isMalayalam ? 'വഴിപാട് കഴിക്കുക' : 'Book Offering' }}</span>
        </span>
        <span v-else class="btn-content">
          <span class="check-icon">✓</span>
          <span>{{ inCartCount }} {{ isMalayalam ? 'ചേർത്തു' : 'Added' }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  offering: {
    type: Object,
    required: true
  },
  inCartCount: {
    type: Number,
    default: 0
  },
  isMalayalam: {
    type: Boolean,
    default: true
  }
});

defineEmits(['select-offering']);
</script>

<style scoped>
.vazhipadu-card {
  padding: 16px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(126, 17, 33, 0.04);
}

.vazhipadu-card:hover {
  transform: translateY(-2px);
  border-color: #d97706;
  box-shadow: 0 6px 18px rgba(126, 17, 33, 0.08);
}

.vazhipadu-card.is-added {
  border-color: #b45309;
  background: #fffdfa;
  box-shadow: 0 0 0 1px #b45309, 0 4px 14px rgba(180, 83, 9, 0.12);
}

.card-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: #fffbeb;
  border: 1px solid #fde68a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.offering-icon {
  font-size: 22px;
}

.title-wrap {
  flex-grow: 1;
}

.badge-row {
  margin-bottom: 4px;
}

.sparkle {
  font-size: 10px;
}

.vazhipadu-name-ml {
  font-size: 16px;
  font-weight: 800;
  color: #7e1121;
  line-height: 1.25;
}

.vazhipadu-name-en {
  font-size: 12px;
  font-weight: 600;
  color: #78716c;
  margin-top: 1px;
}

.vazhipadu-desc {
  font-size: 12.5px;
  color: #44403c;
  line-height: 1.45;
  margin-bottom: 12px;
}

.quota-bar {
  background: #f8f6f0;
  border: 1px solid #ebd9c2;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.quota-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 4px;
}

.quota-label {
  color: #78716c;
  font-weight: 500;
}

.quota-count {
  font-weight: 700;
  color: #065f46;
}

.quota-count.quota-low {
  color: #b91c1c;
}

.quota-track {
  width: 100%;
  height: 4px;
  background: #e7dfd1;
  border-radius: 99px;
  overflow: hidden;
}

.quota-fill {
  height: 100%;
  background: linear-gradient(90deg, #d97706, #059669);
  border-radius: 99px;
  transition: width 0.3s ease;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #f1ebd9;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 14px;
  font-weight: 700;
  color: #b45309;
}

.amount {
  font-size: 21px;
  font-weight: 900;
  color: #b45309;
  font-family: var(--font-sans);
}

.book-action-btn {
  background: linear-gradient(135deg, #7e1121 0%, #991b1b 100%);
  border: 1px solid #7e1121;
  color: #ffffff;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(126, 17, 33, 0.2);
}

.book-action-btn:hover {
  background: linear-gradient(135deg, #991b1b 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(126, 17, 33, 0.3);
}

.book-action-btn.in-basket {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-color: #059669;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.plus-icon {
  font-size: 15px;
  line-height: 1;
}

.check-icon {
  font-size: 13px;
  font-weight: bold;
}
</style>
