# 测试用例 RAG 前端

这是一个基于 Vue 3 + Vite 的前端项目，用于管理测试用例知识库，并通过 RAG 生成可复用的测试思路。

## 功能说明

- 展示后端健康状态和模型状态（Chat / Embedding）
- 向知识库写入测试用例
- 浏览已索引的测试用例
- 基于新需求文本执行复用检索与生成

## 技术栈

- Vue 3
- Vite

## 环境要求

- Node.js 18+（建议使用 LTS 版本）
- npm 9+
- 可用的后端 API 服务（默认：`http://127.0.0.1:5000`）

## 快速开始

1. 安装依赖：

```bash
npm install
```

2. 创建环境变量文件：

```bash
cp .env.example .env
```

PowerShell：

```powershell
Copy-Item .env.example .env
```

3. 启动开发服务器：

```bash
npm run dev
```

默认访问地址：`http://127.0.0.1:5173`

## 环境变量

`VITE_API_BASE_URL` 用于指定后端服务地址：

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
```

## 后端 API 约定

当前前端会调用以下接口：

- `GET /api/health`
- `GET /api/cases`
- `POST /api/cases`
- `POST /api/reuse`

当前列表检索场景会在 `/api/reuse` 请求体中携带 `skip_generation: true`。

如果前后端分开部署，请在后端正确配置 CORS。

## 构建与预览

```bash
npm run build
npm run preview
```

## 项目结构

```text
.
|- src/
|  |- App.vue
|  |- main.js
|  `- style.css
|- .env.example
|- vite.config.js
`- package.json
```
