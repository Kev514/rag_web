<script setup>
const props = defineProps({
  count: {
    type: Number,
    default: 6
  }
});
</script>

<template>
  <div class="cards">
    <article class="skeleton-card" v-for="i in props.count" :key="i">
      <div class="skeleton-line w-65"></div>
      <div class="skeleton-line w-95"></div>
      <div class="skeleton-line w-82"></div>
      <div class="skeleton-line w-40"></div>
    </article>
  </div>
</template>

