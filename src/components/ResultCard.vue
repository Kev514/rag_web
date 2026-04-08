<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["detail"]);

function onDetail() {
  emit("detail", props.item);
}
</script>

<template>
  <article class="result-card">
    <div class="card-head">
      <h3>{{ item.title }}</h3>
      <span class="score-badge">{{ item.score }}%</span>
    </div>

    <p class="description">{{ item.description }}</p>

    <div class="score-track">
      <span class="score-fill" :style="{ width: `${item.score}%` }"></span>
    </div>

    <div class="card-foot">
      <div class="tag-list">
        <span class="tag" v-for="tag in item.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
      </div>
      <button class="detail-btn" @click="onDetail">查看详情</button>
    </div>
  </article>
</template>

