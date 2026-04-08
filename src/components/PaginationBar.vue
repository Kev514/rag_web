<script setup>
import { computed } from "vue";

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(["change"]);

const pages = computed(() => {
  const list = [];
  const start = Math.max(1, props.page - 2);
  const end = Math.min(props.totalPages, props.page + 2);
  for (let i = start; i <= end; i += 1) list.push(i);
  return list;
});

function go(target) {
  if (target < 1 || target > props.totalPages || props.disabled) return;
  emit("change", target);
}
</script>

<template>
  <nav class="pagination">
    <button :disabled="page <= 1 || disabled" @click="go(page - 1)">上一页</button>
    <button
      v-for="p in pages"
      :key="p"
      :class="{ active: p === page }"
      :disabled="disabled"
      @click="go(p)"
    >
      {{ p }}
    </button>
    <button :disabled="page >= totalPages || disabled" @click="go(page + 1)">下一页</button>
  </nav>
</template>

