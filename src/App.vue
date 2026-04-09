<script setup>
import { computed, onMounted, ref } from "vue";
import SearchBar from "./components/SearchBar.vue";
import ResultCard from "./components/ResultCard.vue";
import PaginationBar from "./components/PaginationBar.vue";
import LoadingSkeleton from "./components/LoadingSkeleton.vue";
import { createCase, searchCases } from "./services/searchService";

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
const showCreateModal = ref(false);
const caseSubmitting = ref(false);
const caseSubmitMsg = ref("");
const caseSubmitError = ref("");
const createForm = ref({
  id: "",
  title: "",
  module: "",
  scenario: "",
  preconditions: "",
  stepsText: "",
  expected_result: "",
  tagsText: "",
  source: "manual-ui",
  created_at: new Date().toISOString()
});

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

function openCreateCaseModal() {
  caseSubmitMsg.value = "";
  caseSubmitError.value = "";
  showCreateModal.value = true;
}

function closeCreateCaseModal() {
  if (caseSubmitting.value) return;
  showCreateModal.value = false;
}

function splitToList(text) {
  return String(text || "")
    .split(/\r?\n|,|，/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function submitCreateCase() {
  caseSubmitMsg.value = "";
  caseSubmitError.value = "";
  caseSubmitting.value = true;

  try {
    await createCase({
      id: createForm.value.id,
      title: createForm.value.title,
      module: createForm.value.module,
      scenario: createForm.value.scenario,
      preconditions: createForm.value.preconditions,
      steps: splitToList(createForm.value.stepsText),
      expected_result: createForm.value.expected_result,
      tags: splitToList(createForm.value.tagsText),
      source: createForm.value.source,
      created_at: createForm.value.created_at
    });

    caseSubmitMsg.value = "写入成功";
    showCreateModal.value = false;
    createForm.value = {
      id: "",
      title: "",
      module: "",
      scenario: "",
      preconditions: "",
      stepsText: "",
      expected_result: "",
      tagsText: "",
      source: "manual-ui",
      created_at: new Date().toISOString()
    };
  } catch (error) {
    caseSubmitError.value = error?.message || "写入失败";
  } finally {
    caseSubmitting.value = false;
  }
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
        <button class="create-case-btn" :disabled="caseSubmitting" @click="openCreateCaseModal">
          新增用例
        </button>
      </div>
      <p class="ok-msg" v-if="caseSubmitMsg">{{ caseSubmitMsg }}</p>
      <p class="error" v-if="errorMsg">{{ errorMsg }}</p>
      <p class="error" v-if="caseSubmitError">{{ caseSubmitError }}</p>
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

    <Teleport to="body">
      <div class="modal-mask" v-if="showCreateModal" @click.self="closeCreateCaseModal">
        <div class="modal-card create-modal">
          <div class="modal-head">
            <h3>新增测试用例</h3>
            <button class="close-btn" :disabled="caseSubmitting" @click="closeCreateCaseModal">关闭</button>
          </div>

          <form class="case-form" @submit.prevent="submitCreateCase">
            <label>
              <span>ID</span>
              <input v-model="createForm.id" required placeholder="case-0001" />
            </label>
            <label>
              <span>标题</span>
              <input v-model="createForm.title" required placeholder="登录-密码错误提示" />
            </label>
            <label>
              <span>模块</span>
              <input v-model="createForm.module" required placeholder="登录" />
            </label>
            <label class="full">
              <span>场景</span>
              <textarea v-model="createForm.scenario" required rows="2"></textarea>
            </label>
            <label class="full">
              <span>前置条件</span>
              <textarea v-model="createForm.preconditions" required rows="2"></textarea>
            </label>
            <label class="full">
              <span>步骤（换行/逗号分隔）</span>
              <textarea
                v-model="createForm.stepsText"
                required
                rows="3"
                placeholder="打开登录页&#10;输入正确账号和错误密码&#10;点击登录按钮"
              ></textarea>
            </label>
            <label class="full">
              <span>预期结果</span>
              <textarea v-model="createForm.expected_result" required rows="2"></textarea>
            </label>
            <label class="full">
              <span>标签（换行/逗号分隔）</span>
              <input
                v-model="createForm.tagsText"
                required
                placeholder="登录, 异常流, 认证"
              />
            </label>
            <label>
              <span>来源</span>
              <input v-model="createForm.source" required />
            </label>
            <label>
              <span>创建时间（ISO）</span>
              <input v-model="createForm.created_at" required />
            </label>

            <button class="submit-case-btn full" type="submit" :disabled="caseSubmitting">
              {{ caseSubmitting ? "提交中..." : "提交到 /api/cases" }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
