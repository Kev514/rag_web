<script setup>
const props = defineProps({
  modelValue: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: "" }
});

const emit = defineEmits(["update:modelValue", "search"]);

function onInput(event) {
  emit("update:modelValue", event.target.value);
}

function onSearch() {
  emit("search");
}
</script>

<template>
  <div class="search-bar">
    <div class="input-wrap">
      <svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true">
        <path
          d="M10.8 3.2a7.6 7.6 0 1 1 0 15.2 7.6 7.6 0 0 1 0-15.2Zm0 1.8a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6Zm11 16.1-4.1-4.1 1.3-1.3 4.1 4.1-1.3 1.3Z"
        />
      </svg>
      <input
        :value="props.modelValue"
        :placeholder="props.placeholder"
        @input="onInput"
        @keydown.enter="onSearch"
      />
    </div>
    <button class="search-btn" :disabled="props.loading" @click="onSearch">
      <span v-if="props.loading" class="loading-dot"></span>
      <span>{{ props.loading ? "检索中..." : "开始检索" }}</span>
    </button>
  </div>
</template>

