# NEXT_STEPS — Agentic Commerce Readiness Desk

> 2026-05-22 | 网页端复核发现 | 龙哥

## 复核结论：数据契约 → dashboard 链完整；执行 → 数据契约链有实质缺口

### ✅ 已验证通过（dashboard 侧）

| 验证项 | 状态 |
|--------|------|
| `audit.json` 是合法 JSON，结构符合 schema | ✅ |
| `index.html` JS 无语法错误 | ✅ |
| 所有 DOM ID 在 HTML 中存在且匹配 | ✅ |
| 证据选项卡切换（JSON-LD / Screenshots / DOM） | ✅ |
| Checkout Handoff 面板渲染 | ✅ |
| Pages Table 渲染 | ✅ |
| audit.json 文件导入/导出 | ✅ |
| 空状态覆盖层 + 双入口 | ✅ |
| 4 种导出格式（.md / .csv / .txt / audit.json） | ✅ |

### ⚠️ 发现的缺口（执行侧）

#### Gap 1: 截图采集 — `web_fetch` 不能截图

`openclaw-run.md` 和 `collector-template.md` 多处提到「Capture desktop and mobile screenshots」，但 `web_fetch` 只返回 text/markdown，**不产生图片**。

- `audit.json` 中 `screenshot` 和 `mobileScreenshot` 字段当前是字符串路径（如 `evidence/screenshots/...png`）
- Dashboard 用占位图标渲染，不尝试加载真实图片
- **影响**：真实 crawler 运行时 screenshot 字段不可填充，dashboard 始终显示占位符

**推荐解决方案**（选一）：
1. **Playwright via exec**：`openclaw-run.md` 增加 Phase 0，用 `exec` 工具调用 Playwright 脚本截图，保存到 `evidence/screenshots/`
2. **Base64 inline**：截图转 base64 直接写入 `audit.json` 的 `screenshot` 字段（dashboard 需改造支持 `data:image/...`）
3. **降级方案**：承认 screenshot 是可选的增强能力，crawler 只产出 JSON-LD + DOM + visibleText 证据，dashboard 已有对应面板

#### Gap 2: 购物车交互 — `web_fetch` 是无状态的

`openclaw-run.md` Phase 3 描述了完整的 checkout 验证链路：选 variant → 加购物车 → 改数量 → 输折扣码 → 点 checkout。`web_fetch` **没有 session 状态，不能 click/type/select**。

- 每个 `web_fetch(url)` 是独立的 HTTP GET，不携带 cookie/session
- 即使能抓到 `/cart` 页面，也是空购物车
- 无法验证「加购后 cart 显示正确 variant/数量/价格」

**推荐解决方案**（选一）：
1. **Playwright stateful flow**：用 `exec` 工具跑一个 Playwright 脚本，维护 browser context，执行完整 checkout 链路，记录每一步状态
2. **两级采集模式**：
   - **L1（纯 web_fetch）**：JSON-LD 提取 + schema 验证 + DOM selector 发现 + form action 分析
   - **L2（Playwright）**：完整 checkout handoff 验证 + 截图
3. **Form action 静态分析**：不真的点按钮，而是从 HTML 中提取 `<form action="...">`、`<a href="/checkout">`，推断 checkout 链路 — 这是 L1 就能做的

#### Gap 3: JSON-LD 提取方法不明确

`openclaw-run.md` 说「web_fetch(url, extractMode=markdown) → extract JSON-LD」。但 `extractMode=markdown` 会剥离 `<script>` 标签，**JSON-LD 数据会丢失**。

`collector-template.md` 说「web_fetch(url?view=source)」但没有说明 `?view=source` 在很多 Shopify 主题上不可用。

**推荐解决方案**：
- 用 `web_fetch(url, extractMode=text)` 获取包含 script 标签的原始文本
- 在 Phase 1 中明确写出 JSON-LD 提取正则：匹配 `<script type="application/ld+json">...</script>`
- 如果 text 模式也不含 script 标签，降级为手动检查 og 标签 + title + visible price

#### Gap 4: `audit.json` 引用了不存在的 `audit-schema.json`

`audit.json` 第一行：
```json
"$schema": "./audit-schema.json"
```
但项目中没有这个文件。Dashboard 不使用它（纯 JS 解析），但 IDE 校验会报 warning。

**修复**：要么删除 `$schema` 行，要么创建一个最小 `audit-schema.json`。

#### Gap 5: Screenshot 路径在 dashboard 中不解析

`audit.json` 中 `screenshot: "evidence/screenshots/...png"` 是相对路径。Dashboard 用 `<div class="screenshot-placeholder">` 占位，不尝试 `<img src="...">` 加载。

**这不是 bug**（demo 阶段设计如此），但升级到真实 crawler 时需要决定：
- 截图和 `index.html` 同目录 → `<img>` 直接加载
- 截图放 base64 到 audit.json → 需改造 dashboard
- 截图上传到 CDN → browser agent 需额外步骤

---

## 下一步最该做的 3 件事

### 1. 编写 Playwright collector 脚本（填补 Gap 1+2）

在项目目录新增 `collector-playwright.js`，一个独立的 Node 脚本：

```javascript
// 核心功能：
// - 打开 Shopify 店铺的 5-8 个 URL
// - 每个页面截图（desktop 1440×900 + mobile 390×844）
// - 提取 JSON-LD（document.querySelectorAll('script[type="application/ld+json"]')）
// - 提取 OG 标签、canonical、visibleText、domSelectors
// - 执行 checkout handoff 链路（add-to-cart → cart → discount → checkout redirect）
// - 输出 audit.json 到当前目录
// - 截图保存到 evidence/screenshots/

// 依赖：npm install playwright
// 运行：node collector-playwright.js --url https://client-store.myshopify.com
```

这是**从 demo 到产品最关键的一步**。没有它，`openclaw-run.md` 中描述的执行链路无法落地。

### 2. 补充 L1-only 降级模式文档

在 `openclaw-run.md` 和 `collector-template.md` 中明确区分两种采集模式：

| 模式 | 工具 | 能做什么 | 不能做什么 |
|------|------|---------|-----------|
| **L1 Stateless** | `web_fetch` | JSON-LD 提取、schema 校验、OG 标签、visibleText、DOM selector 发现、form action 分析 | 截图、cart 交互、variant 切换验证 |
| **L2 Stateful** | Playwright / Puppeteer | L1 全部 + 截图、checkout 验证、variant 价格一致性、折扣码测试 | （无） |

L1 模式已有完整 dashboard 支撑（JSON-LD + DOM + visibleText 面板）；L2 补全 screenshot + checkout 面板。

### 3. 用真实 Shopify 店铺跑一遍 L1

选一个公开的 Shopify 店铺（如 Allbirds、Gymshark、或任何 myshopify.com 店铺），手动执行 `openclaw-run.md` Phase 1-2：

1. `web_fetch` 5 个 URL
2. 手写提取 JSON-LD、OG 标签
3. 跑校验规则
4. 组装一份真实 `audit.json`
5. 拖入 dashboard 看渲染效果

这一步会暴露所有「文档里写着没问题、实际操作有问题」的细节。跑完后修正 `openclaw-run.md` 中的指令。

---

## 边界声明

- 以上所有方案**不需要 Shopify Admin token、支付凭证、客户 PII**
- Playwright 脚本只访问公开 storefront URL
- Cart → Checkout 验证停留在 redirect URL 检查，不提交支付
- 本文件不替代 `collector-template.md` 或 `openclaw-run.md`，是它们的补充
