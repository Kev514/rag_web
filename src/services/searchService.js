const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const MOCK_CASES = [
  {
    id: "tc-001",
    title: "登录失败-密码错误提示",
    description: "用户输入错误密码后，系统应给出明确提示且不泄露账号状态。",
    tags: ["登录", "异常流", "安全"]
  },
  {
    id: "tc-002",
    title: "账号锁定后登录拦截",
    description: "连续失败达到阈值后，账号锁定并提示剩余解锁时间。",
    tags: ["登录", "风控", "边界"]
  },
  {
    id: "tc-003",
    title: "验证码过期校验",
    description: "验证码超过有效期后应校验失败，并支持重新获取。",
    tags: ["验证码", "时效", "异常流"]
  },
  {
    id: "tc-004",
    title: "弱网环境下提交重试",
    description: "请求超时时展示可恢复提示，重试后不产生重复提交。",
    tags: ["网络", "稳定性", "幂等"]
  },
  {
    id: "tc-005",
    title: "Token 失效自动跳转登录",
    description: "接口返回未授权时，统一清理会话并引导用户重新登录。",
    tags: ["鉴权", "会话", "前后端联动"]
  },
  {
    id: "tc-006",
    title: "注册邮箱格式边界验证",
    description: "覆盖超长、非法字符与国际化邮箱格式输入场景。",
    tags: ["注册", "输入校验", "边界"]
  },
  {
    id: "tc-007",
    title: "支付回调重复通知处理",
    description: "重复回调不重复扣款，订单状态最终一致。",
    tags: ["支付", "幂等", "一致性"]
  },
  {
    id: "tc-008",
    title: "批量导入中断后恢复",
    description: "导入任务异常中断后可以续传，且错误记录可追踪。",
    tags: ["导入", "容错", "任务管理"]
  },
  {
    id: "tc-009",
    title: "搜索关键词为空行为",
    description: "空查询触发默认推荐并提示输入示例，不报错。",
    tags: ["搜索", "体验", "容错"]
  },
  {
    id: "tc-010",
    title: "多端并发登录冲突处理",
    description: "同账号在多端登录时，策略生效并及时提示用户。",
    tags: ["登录", "并发", "策略"]
  },
  {
    id: "tc-011",
    title: "权限变更后菜单实时刷新",
    description: "管理员调整权限后，用户端菜单立即按最新权限展示。",
    tags: ["权限", "实时性", "缓存"]
  },
  {
    id: "tc-012",
    title: "导出任务超时与重试",
    description: "导出大数据量超时后，用户可重试并收到进度反馈。",
    tags: ["导出", "任务", "超时"]
  }
];

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreByOverlap(query, candidate) {
  const queryTokens = tokenize(query);
  const text = `${candidate.title} ${candidate.description} ${(candidate.tags || []).join(" ")}`;
  const candidateTokens = new Set(tokenize(text));
  const hit = queryTokens.reduce((acc, token) => acc + (candidateTokens.has(token) ? 1 : 0), 0);

  if (queryTokens.length === 0) return 60;
  const ratio = hit / queryTokens.length;
  const base = Math.round(62 + ratio * 35);
  return Math.max(48, Math.min(98, base));
}

function buildMockResult({ query, page, pageSize }) {
  const ranked = MOCK_CASES.map((item) => ({
    ...item,
    score: scoreByOverlap(query, item)
  })).sort((a, b) => b.score - a.score);

  const total = ranked.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const items = ranked.slice(start, start + pageSize);

  return { items, total, page: currentPage, totalPages };
}

async function searchFromApi({ query, page, pageSize }) {
  const res = await fetch(`${apiBase}/api/reuse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      page,
      page_size: pageSize,
      top_k: pageSize,
      skip_generation: true
    })
  });

  if (!res.ok) {
    throw new Error(`接口请求失败: ${res.status}`);
  }

  const data = await res.json();
  const items = Array.isArray(data?.retrieved)
    ? data.retrieved.map((entry, index) => {
        const item = entry.case || {};
        const score = Math.round(Number(entry.score || 0) * 100);
        return {
          id: item.id || `api-${index}`,
          title: item.title || "未命名用例",
          description: item.scenario || item.description || "暂无描述",
          score: Math.max(0, Math.min(100, score || 66)),
          tags: Array.isArray(item.tags) ? item.tags : []
        };
      })
    : [];

  const total = Number(data?.total || items.length);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { items, total, page, totalPages };
}

export async function searchCases({ query, page = 1, pageSize = 6 }) {
  try {
    const result = await searchFromApi({ query, page, pageSize });
    if (result.items.length > 0) return result;
  } catch {
    // Fallback to local mock data when backend is unavailable.
  }

  await new Promise((resolve) => setTimeout(resolve, 900));
  return buildMockResult({ query, page, pageSize });
}

const REQUIRED_CASE_FIELDS = [
  "id",
  "title",
  "module",
  "scenario",
  "preconditions",
  "steps",
  "expected_result",
  "tags",
  "source",
  "created_at"
];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => isNonEmptyString(item));
}

function toCasePayload(input) {
  const payload = input || {};

  for (const field of REQUIRED_CASE_FIELDS) {
    if (!(field in payload)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!isNonEmptyString(payload.id)) throw new Error("Field `id` must be a non-empty string");
  if (!isNonEmptyString(payload.title)) throw new Error("Field `title` must be a non-empty string");
  if (!isNonEmptyString(payload.module)) throw new Error("Field `module` must be a non-empty string");
  if (!isNonEmptyString(payload.scenario)) throw new Error("Field `scenario` must be a non-empty string");
  if (!isNonEmptyString(payload.preconditions)) throw new Error("Field `preconditions` must be a non-empty string");
  if (!isStringArray(payload.steps) || payload.steps.length === 0) {
    throw new Error("Field `steps` must be a non-empty string array");
  }
  if (!isNonEmptyString(payload.expected_result)) {
    throw new Error("Field `expected_result` must be a non-empty string");
  }
  if (!isStringArray(payload.tags) || payload.tags.length === 0) {
    throw new Error("Field `tags` must be a non-empty string array");
  }
  if (!isNonEmptyString(payload.source)) throw new Error("Field `source` must be a non-empty string");
  if (!isNonEmptyString(payload.created_at) || Number.isNaN(Date.parse(payload.created_at))) {
    throw new Error("Field `created_at` must be a valid ISO datetime string");
  }

  return {
    id: payload.id.trim(),
    title: payload.title.trim(),
    module: payload.module.trim(),
    scenario: payload.scenario.trim(),
    preconditions: payload.preconditions.trim(),
    steps: payload.steps.map((item) => item.trim()),
    expected_result: payload.expected_result.trim(),
    tags: payload.tags.map((item) => item.trim()),
    source: payload.source.trim(),
    created_at: payload.created_at.trim()
  };
}

export async function createCase(input) {
  const payload = toCasePayload(input);

  const res = await fetch(`${apiBase}/api/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Create case failed: ${res.status}${errorText ? ` - ${errorText}` : ""}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return { success: true };
}
