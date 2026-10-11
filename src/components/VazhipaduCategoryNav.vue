<template>
  <div class="category-nav-wrapper">
    <!-- Search Bar -->
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input 
        type="text" 
        :value="searchQuery" 
        @input="$emit('update:searchQuery', $event.target.value)"
        :placeholder="isMalayalam ? 'വഴിപാടുകൾ തിരയുക (Search Vazhipadu)...' : 'Search offerings (e.g. Palpayasam, Dhara)...'" 
        class="search-input"
      />
      <button 
        v-if="searchQuery" 
        class="clear-btn" 
        @click="$emit('update:searchQuery', '')"
      >
        ✕
      </button>
    </div>

    <!-- Category Filter Chips -->
    <div class="category-chips-scroll">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        class="chip-btn"
        :class="{ active: selectedCategory === cat.id }"
        @click="$emit('select-category', cat.id)"
      >
        <span>{{ isMalayalam ? cat.nameMl : cat.nameEn }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    required: true
  },
  selectedCategory: {
    type: String,
    default: 'all'
  },
  searchQuery: {
    type: String,
    default: ''
  },
  isMalayalam: {
    type: Boolean,
    default: true
  }
});

defineEmits(['update:searchQuery', 'select-category']);
</script>

<style scoped>
.category-nav-wrapper {
  padding: 12px 16px 8px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 9;
  box-shadow: 0 2px 8px rgba(126, 17, 33, 0.04);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 13px;
  color: #78716c;
}

.search-input {
  width: 100%;
  background: #fdfcf9;
  border: 1.5px solid var(--border-subtle);
  color: #1c1917;
  padding: 9px 34px 9px 34px;
  border-radius: var(--radius-full);
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #a8a29e;
}

.search-input:focus {
  border-color: #7e1121;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(126, 17, 33, 0.1);
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #78716c;
  cursor: pointer;
  font-size: 12px;
}

.category-chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-chips-scroll::-webkit-scrollbar {
  display: none;
}

.chip-btn {
  white-space: nowrap;
  background: #f8f6f0;
  border: 1px solid #ebd9c2;
  color: #44403c;
  padding: 7px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-btn:hover {
  background: #f1ebd9;
  color: #1c1917;
}

.chip-btn.active {
  background: #7e1121;
  border-color: #7e1121;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(126, 17, 33, 0.28);
}
</style>
