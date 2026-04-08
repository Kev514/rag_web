<script setup>
import { computed, onMounted, ref } from "vue";
import SearchBar from "./components/SearchBar.vue";
import ResultCard from "./components/ResultCard.vue";
import PaginationBar from "./components/PaginationBar.vue";
import LoadingSkeleton from "./components/LoadingSkeleton.vue";
import { searchCases } from "./services/searchService";

const query = ref("");
const results = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 6;
const totalPages = ref(1);
const total = ref(0);
const errorMsg = ref("");
const hasSearched = ref(false);
const selectedCase = ref(null);

const summaryText = computed(() => {
  if (!hasSearched.value) return "输入自然语言场景后开始检索";
  if (loading.value) return "正在分析需求并检索相似用例...";
  return `共找到 ${total.value} 条相关结果`;
});

async function performSearch(targetPage = 1) {
  if (!query.value.trim()) {
    errorMsg.value = "请输入检索内容";
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  hasSearched.value = true;

  try {
    const res = await searchCases({
      query: query.value.trim(),
      page: targetPage,
      pageSize
    });

    results.value = res.items;
    total.value = res.total;
    totalPages.value = res.totalPages;
    page.value = res.page;
  } catch (error) {
    errorMsg.value = error.message || "检索失败，请稍后重试";
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  performSearch(1);
}

function onPageChange(nextPage) {
  if (nextPage === page.value || loading.value) return;
  performSearch(nextPage);
}

function openDetail(item) {
  selectedCase.value = item;
}

function closeDetail() {
  selectedCase.value = null;
}

onMounted(() => {
  query.value = "登录失败边界测试";
  performSearch(1);
});
</script>

<template>
  <div class="app-shell">
    <div class="bg-grid"></div>
    <header class="hero">
      <p class="kicker">RAG Knowledge Search</p>
      <h1>测试用例智能检索系统</h1>
      <p class="desc">输入自然语言测试场景，快速定位历史用例并进行高质量复用。</p>
    </header>

    <section class="search-wrap">
      <SearchBar
        v-model="query"
        :loading="loading"
        placeholder="请输入测试场景，如“登录失败边界测试”"
        @search="onSearch"
      />
      <div class="tips-row">
        <p class="summary">{{ summaryText }}</p>
      </div>
      <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
    </section>

    <main class="result-wrap">
      <LoadingSkeleton v-if="loading" :count="6" />

      <template v-else>
        <div class="empty-state" v-if="hasSearched && results.length === 0">
          <h3>没有匹配结果</h3>
          <p>尝试使用更具体的业务词，例如模块名、异常类型、前置条件。</p>
        </div>

        <div class="cards" v-else>
          <ResultCard
            v-for="item in results"
            :key="item.id"
            :item="item"
            @detail="openDetail"
          />
        </div>

        <PaginationBar
          v-if="totalPages > 1"
          :page="page"
          :total-pages="totalPages"
          :disabled="loading"
          @change="onPageChange"
        />
      </template>
    </main>

    <Teleport to="body">
      <div class="modal-mask" v-if="selectedCase" @click.self="closeDetail">
        <div class="modal-card">
          <div class="modal-head">
            <h3>{{ selectedCase.title }}</h3>
            <button class="close-btn" @click="closeDetail">关闭</button>
          </div>
          <p class="modal-score">相似度：{{ selectedCase.score }}%</p>
          <p class="modal-desc">{{ selectedCase.description }}</p>
          <div class="meta-list">
            <span class="meta-tag" v-for="tag in selectedCase.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
