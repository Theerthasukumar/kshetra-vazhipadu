<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="bottom-sheet devotee-sheet">
      <div class="sheet-handle"></div>

      <!-- Header -->
      <div class="sheet-header">
        <div class="header-top-row">
          <div class="offering-summary-pill" v-if="selectedOffering">
            <span class="offering-emoji">{{ selectedOffering.icon }}</span>
            <span class="offering-title font-mal">{{ isMalayalam ? selectedOffering.nameMl : selectedOffering.nameEn }}</span>
            <span class="offering-price">₹{{ selectedOffering.price }}</span>
          </div>
          <button class="sheet-close-btn" @click="$emit('close')">✕</button>
        </div>

        <h2 class="sheet-title font-mal">
          {{ isMalayalam ? 'ഭക്തരുടെ വിവരങ്ങൾ നൽകുക' : 'Devotee & Nakshathram Details' }}
        </h2>
        <p class="sheet-subtitle font-mal">
          {{ isMalayalam ? 'മേൽശാന്തി പൂജ കഴിക്കുന്നതിനായി കുടുംബാംഗങ്ങളുടെ പേരും നാളും നൽകാം' : 'Enter names and birth stars for priests to chant sankalpam' }}
        </p>
      </div>

      <!-- Form Body -->
      <div class="sheet-body">
        <!-- Family Members / Devotees Section -->
        <div class="devotees-section">
          <div class="devotees-section-header">
            <div class="section-badge font-mal">
              <span>👥</span>
              <span>{{ isMalayalam ? 'ഭക്തരുടെ പട്ടിക (' + devotees.length + ' പേർ)' : 'Devotees List (' + devotees.length + ' Persons)' }}</span>
            </div>
            <button 
              type="button" 
              class="add-devotee-btn-top font-mal" 
              @click="addDevotee"
              title="Add family member"
            >
              <span>+</span>
              <span>{{ isMalayalam ? 'ആളെ ചേർക്കുക' : 'Add Person' }}</span>
            </button>
          </div>

          <!-- Devotee Cards List -->
          <div class="devotee-cards-list">
            <div 
              v-for="(devotee, index) in devotees" 
              :key="devotee.id"
              class="devotee-card"
            >
              <div class="devotee-card-header">
                <span class="devotee-num-pill font-mal">
                  <span>👤</span>
                  <span>{{ isMalayalam ? 'ഭക്തൻ ' + (index + 1) : 'Devotee #' + (index + 1) }}</span>
                </span>
                
                <button 
                  v-if="devotees.length > 1" 
                  type="button" 
                  class="remove-devotee-btn"
                  @click="removeDevotee(index)"
                  title="Remove this person"
                >
                  ✕ {{ isMalayalam ? 'ഒഴിവാക്കുക' : 'Remove' }}
                </button>
              </div>

              <!-- Name & Nakshathram Fields -->
              <div class="devotee-fields-grid">
                <!-- Name Field -->
                <div class="field-item">
                  <label class="input-label-sm">
                    <span>{{ isMalayalam ? 'പേര് (Name)' : 'Full Name' }} *</span>
                  </label>
                  <div class="input-wrap">
                    <span class="input-icon">👤</span>
                    <input 
                      type="text" 
                      v-model="devotee.name" 
                      class="temple-input pl-icon" 
                      :placeholder="isMalayalam ? 'ഉദാ: അനന്തകൃഷ്ണൻ' : 'e.g., Ananthakrishnan'"
                      required
                    />
                  </div>
                </div>

                <!-- 27 Nakshathram Selector -->
                <div class="field-item">
                  <label class="input-label-sm">
                    <span>{{ isMalayalam ? 'നക്ഷത്രം / നാൾ (Birth Star)' : 'Birth Star' }} *</span>
                  </label>
                  <div class="input-wrap">
                    <span class="input-icon">⭐</span>
                    <select v-model="devotee.nakshathram" class="temple-select pl-icon font-mal" required>
                      <option value="" disabled>{{ isMalayalam ? '-- നാൾ തിരഞ്ഞെടുക്കുക --' : '-- Select Star --' }}</option>
                      <option 
                        v-for="star in nakshathras" 
                        :key="star.id" 
                        :value="star.nameMl + ' (' + star.nameEn + ')'"
                      >
                        {{ star.id }}. {{ star.nameMl }} ({{ star.nameEn }})
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Quantity for this person (if applicable) -->
                <div class="field-item qty-item" v-if="selectedOffering?.category === 'nivedyam'">
                  <label class="input-label-sm">
                    <span>{{ isMalayalam ? 'എണ്ണം' : 'Qty' }}</span>
                  </label>
                  <div class="compact-stepper">
                    <button type="button" class="c-step-btn" @click="devotee.qty > 1 && devotee.qty--" :disabled="devotee.qty <= 1">-</button>
                    <span class="c-step-num">{{ devotee.qty }}</span>
                    <button type="button" class="c-step-btn" @click="devotee.qty++">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Prominent Add Devotee Button -->
          <button 
            type="button" 
            class="add-devotee-large-btn font-mal" 
            @click="addDevotee"
          >
            <span class="plus-circle">+</span>
            <span>{{ isMalayalam ? 'മറ്റൊരു ആളെ ചേർക്കുക (കുടുംബാംഗങ്ങൾ)' : 'Add Another Person / Family Member' }}</span>
          </button>
        </div>

        <!-- Shared Booking Details (Date & WhatsApp) -->
        <div class="shared-details-card">
          <!-- Date Picker -->
          <div class="form-group mb-3">
            <label class="input-label">
              <span>{{ isMalayalam ? 'വഴിപാട് തീയതി (Date of Pooja)' : 'Pooja Date' }} *</span>
            </label>
            <div class="date-quick-picks">
              <button 
                type="button" 
                class="date-pill font-mal" 
                :class="{ active: datePreset === 'today' }"
                @click="datePreset = 'today'"
              >
                {{ isMalayalam ? 'ഇന്ന് (Today)' : 'Today' }}
              </button>
              <button 
                type="button" 
                class="date-pill font-mal" 
                :class="{ active: datePreset === 'tomorrow' }"
                @click="datePreset = 'tomorrow'"
              >
                {{ isMalayalam ? 'നാളെ (Tomorrow)' : 'Tomorrow' }}
              </button>
              <button 
                type="button" 
                class="date-pill font-mal" 
                :class="{ active: datePreset === 'custom' }"
                @click="datePreset = 'custom'"
              >
                {{ isMalayalam ? 'മറ്റൊരു തീയതി' : 'Custom Date' }}
              </button>
            </div>

            <input 
              v-if="datePreset === 'custom'" 
              type="date" 
              v-model="customDate" 
              class="temple-input mt-2"
            />
          </div>

          <!-- Mobile / WhatsApp for Digital Receipt -->
          <div class="form-group">
            <label class="input-label">
              <span>{{ isMalayalam ? 'മൊബൈൽ നമ്പർ (Mobile / WhatsApp)' : 'WhatsApp / Mobile Number' }} *</span>
              <span class="label-hint">{{ isMalayalam ? 'രസീത് ലഭിക്കാൻ' : 'For Digital Receipt' }}</span>
            </label>
            <div class="input-wrap phone-input-wrap">
              <span class="country-code">+91</span>
              <input 
                type="tel" 
                v-model="phone" 
                class="temple-input phone-input" 
                :placeholder="isMalayalam ? '10 അക്ക മൊബൈൽ നമ്പർ' : 'Enter 10-digit mobile number'" 
                maxlength="10"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer CTA with Total Breakdown -->
      <div class="sheet-footer">
        <div class="price-calc">
          <span class="calc-label font-mal">
            {{ isMalayalam ? 'ആകെ തുക (' + totalVazhipaduCount + ' വഴിപാട്)' : 'Total (' + totalVazhipaduCount + ' Offerings)' }}
          </span>
          <span class="calc-amount">₹{{ totalAmount }}</span>
        </div>
        <button 
          class="gold-glow-btn submit-btn font-mal" 
          @click="handleSubmit" 
          :disabled="!isFormValid"
        >
          <span>{{ isMalayalam ? 'കാർട്ടിൽ ചേർക്കുക' : 'Add to Basket' }}</span>
          <span class="arrow-icon">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  selectedOffering: {
    type: Object,
    required: true
  },
  nakshathras: {
    type: Array,
    required: true
  },
  isMalayalam: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close', 'add-to-cart']);

// Multi-devotee list
const devotees = ref([
  {
    id: 1,
    name: '',
    nakshathram: '',
    qty: 1
  }
]);

// Shared Booking Details
const datePreset = ref('today');
const customDate = ref(new Date().toISOString().split('T')[0]);
const phone = ref('');

// Add devotee
const addDevotee = () => {
  devotees.value.push({
    id: Date.now() + Math.random(),
    name: '',
    nakshathram: '',
    qty: 1
  });
};

// Remove devotee
const removeDevotee = (index) => {
  if (devotees.value.length > 1) {
    devotees.value.splice(index, 1);
  }
};

// Calculations
const totalVazhipaduCount = computed(() => {
  return devotees.value.reduce((sum, d) => sum + (d.qty || 1), 0);
});

const totalAmount = computed(() => {
  return (props.selectedOffering?.price || 0) * totalVazhipaduCount.value;
});

// Validation
const isFormValid = computed(() => {
  const allDevoteesValid = devotees.value.every(d => 
    d.name.trim().length >= 2 && d.nakshathram
  );
  const isPhoneValid = phone.value.trim().length >= 10;
  return allDevoteesValid && isPhoneValid;
});

// Submit
const handleSubmit = () => {
  if (!isFormValid.value) return;

  const resolvedDate = datePreset.value === 'today'
    ? 'Today (' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ')'
    : datePreset.value === 'tomorrow'
      ? 'Tomorrow'
      : customDate.value;

  // Generate an array of individual devotee order items
  const orderItems = devotees.value.map(d => ({
    offering: props.selectedOffering,
    devoteeName: d.name.trim(),
    nakshathram: d.nakshathram,
    date: resolvedDate,
    phone: phone.value.trim(),
    quantity: d.qty || 1,
    totalPrice: props.selectedOffering.price * (d.qty || 1)
  }));

  emit('add-to-cart', orderItems);
};
</script>

<style scoped>
.devotee-sheet {
  max-height: 90vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.sheet-header {
  padding: 16px 20px 12px;
  background: #fdfbf7;
  border-bottom: 1.5px solid var(--border-subtle);
  position: relative;
}

.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.offering-summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
}

.offering-price {
  background: #fef08a;
  padding: 1px 7px;
  border-radius: 99px;
  color: #78350f;
  font-weight: 800;
}

.sheet-title {
  font-size: 18px;
  font-weight: 800;
  color: #7e1121;
  margin-bottom: 3px;
}

.sheet-subtitle {
  font-size: 12px;
  color: #57534e;
}

.sheet-close-btn {
  background: #f5eedf;
  border: none;
  color: #78716c;
  width: 28px;
  height: 28px;
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
  gap: 16px;
  background: #ffffff;
}

/* Devotees Section */
.devotees-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.devotees-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 800;
  color: #7e1121;
}

.add-devotee-btn-top {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.add-devotee-btn-top:hover {
  background: #fef3c7;
  border-color: #b45309;
}

/* Devotee Card */
.devotee-cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.devotee-card {
  background: #fdfbf7;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s ease;
}

.devotee-card:hover {
  border-color: #d97706;
}

.devotee-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.devotee-num-pill {
  font-size: 12px;
  font-weight: 800;
  color: #7e1121;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-devotee-btn {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-devotee-btn:hover {
  background: #fca5a5;
  color: #7f1d1d;
}

.devotee-fields-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  display: flex;
  flex-direction: column;
}

.input-label-sm {
  font-size: 11.5px;
  font-weight: 700;
  color: #44403c;
  margin-bottom: 4px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  color: #78716c;
}

.pl-icon {
  padding-left: 36px;
}

.qty-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
}

.compact-stepper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
}

.c-step-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: #f5eedf;
  border: none;
  font-weight: 800;
  cursor: pointer;
}

.c-step-btn:disabled {
  opacity: 0.3;
}

.c-step-num {
  font-size: 13px;
  font-weight: 800;
  color: #7e1121;
  min-width: 16px;
  text-align: center;
}

/* Large Add Devotee Button */
.add-devotee-large-btn {
  background: #ffffff;
  border: 1.5px dashed #b45309;
  color: #7e1121;
  padding: 11px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.add-devotee-large-btn:hover {
  background: #fffbeb;
  border-color: #7e1121;
}

.plus-circle {
  width: 20px;
  height: 20px;
  background: #7e1121;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

/* Shared Details Card */
.shared-details-card {
  background: #fdfbf7;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mb-3 {
  margin-bottom: 4px;
}

.date-quick-picks {
  display: flex;
  gap: 8px;
}

.date-pill {
  flex: 1;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  color: #44403c;
  padding: 8px;
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.date-pill.active {
  background: #7e1121;
  border-color: #7e1121;
  color: #ffffff;
}

.mt-2 {
  margin-top: 8px;
}

.phone-input-wrap {
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.country-code {
  padding: 10px 12px;
  background: #f5eedf;
  font-size: 13px;
  font-weight: 700;
  color: #44403c;
  border-right: 1.5px solid var(--border-subtle);
}

.phone-input {
  border: none;
  background: transparent;
  padding: 10px 12px;
  border-radius: 0;
}

.phone-input:focus {
  box-shadow: none;
}

.sheet-footer {
  padding: 14px 20px;
  background: #fdfbf7;
  border-top: 1.5px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.price-calc {
  display: flex;
  flex-direction: column;
}

.calc-label {
  font-size: 11px;
  color: #78716c;
  font-weight: 600;
}

.calc-amount {
  font-size: 21px;
  font-weight: 900;
  color: #b45309;
}

.submit-btn {
  padding: 12px 24px;
  font-size: 14px;
  flex-grow: 1;
}

.submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.arrow-icon {
  font-size: 16px;
}
</style>
