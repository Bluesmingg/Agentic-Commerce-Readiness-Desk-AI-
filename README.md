# Agentic Commerce Readiness Desk

> **Enhanced Edition** — OpenClaw browser agent + Codex integration

Agentic Commerce Readiness Desk 是一个本地电商前端审计工作台，用来把 Shopify、WooCommerce 或独立 DTC 店铺的 AI shopping readiness 问题整理成客户报告、修复清单和 OpenClaw 任务提示词。

**与 Codex 基础版的核心区别**：本增强版新增了完整的数据契约（`audit.json`）、浏览器证据面板（JSON-LD / Screenshots / DOM）、Checkout Handoff 验证面板、已采集页面表、以及 collector bridge 文档，使得从"静态 demo"到"真实 crawler"的升级路径清晰可执行。

## 适合卖给谁

- Shopify / Shopify Hydrogen 店铺
- WooCommerce 小型品牌站
- 正在投放 Google Shopping、Meta catalog、TikTok Shop 或 affiliate 流量的 DTC 商家
- 想把商品页、政策页和 checkout 做得更适合 AI 搜索/购物 agent 读取的商家

## 它解决什么问题

AI 搜索和购物 agent 会读取商品事实、结构化数据、价格、库存、政策、信任信号和购买路径。很多店铺的人类界面看起来还可以，但机器读取时会遇到：

- Product / Offer / ItemList / Breadcrumb schema 缺失或与页面内容不一致
- 变体价格、库存、SKU 只在前端状态里变化，结构化数据仍是旧值
- 配送、退换货、保修和客服信息只有长段落，没有适合 agent 摘要的问答块
- 商品标题和描述缺少品牌、材质、尺寸、容量、兼容性、使用场景等比较属性
- 移动端 cart、折扣码、variant selector 或 checkout handoff 不稳定

## 如何运行

直接打开：

```text
index.html
```

不需要安装依赖，不需要后端，不需要 token。

如果想用本地 HTTP 服务运行：

```powershell
python -m http.server 8080
# 或
npx serve .
```

## Playwright Collector

如果要从公开店铺生成真实审计数据，先安装依赖：

```powershell
npm install
npx playwright install chromium
```

然后运行采集：

```powershell
npm run collect -- --url https://www.deathwishcoffee.com --out audit.generated.json --max-products 2
```

collector 会：

- 打开公开 storefront URL，不需要 Shopify Admin token、cookie、后台密码或支付数据。
- 自动发现首页、集合页、商品页、政策页和购物车页。
- 采集 desktop / mobile 截图到 `evidence/screenshots/`。
- 提取 JSON-LD、canonical、Open Graph、title、visible text 摘要和基础 DOM selector 信号。
- 尝试 add-to-cart、cart、checkout handoff，但不会填写支付信息，也不会提交付款。
- 输出与 `audit-schema.json` 兼容的 `audit.generated.json`。

本项目已用 `https://www.deathwishcoffee.com` 跑通过一次 smoke test：

- 采集页面：7 个。
- 生成截图：14 张。
- 输出文件：`audit.generated.json`。
- 发现 issue：1 条 checkout handoff 未验证成功。

如果自动 URL 发现漏页面，可以准备 `urls.txt` 并运行：

```powershell
npm run collect -- --urls urls.txt --out audit.generated.json
```

## 增强版核心功能（与基础版对比）

| 功能 | Codex 基础版 | 增强版 |
|------|-------------|--------|
| 静态 Dashboard | ✅ | ✅ |
| 评分 + 子分数 | ✅ | ✅ |
| 问题列表 + 筛选 | ✅ | ✅ |
| 问题详情面板 | ✅ | ✅ |
| Markdown 报告导出 | ✅ | ✅ |
| CSV 修复清单导出 | ✅ | ✅ |
| OpenClaw 任务 prompt 导出 | ✅ | ✅ |
| **audit.json 数据契约** | ❌ | ✅ 独立 JSON，可被 crawler 产出、dashboard 加载 |
| **JSON-LD 证据面板** | ❌ | ✅ 语法高亮、结构化数据展示 |
| **Screenshot 证据面板** | ❌ | ✅ 桌面/移动端截图占位 |
| **DOM Selector 证据面板** | ❌ | ✅ CSS 选择器列表 |
| **Checkout Handoff 验证面板** | ❌ | ✅ Cart→Checkout 全链路验证 |
| **已采集页面表** | ❌ | ✅ 带类型、状态、JSON-LD 数量、警告 |
| **采集概览统计** | ❌ | ✅ 侧边栏实时统计 |
| **audit.json 导入** | ❌ | ✅ 文件选择器 / 拖放加载 |
| **audit.json 导出** | ❌ | ✅ 一键导出完整数据 |
| **Collector Bridge 文档** | ❌ | ✅ 5 阶段升级指南 |
| **OpenClaw 执行脚本** | ❌ | ✅ 可直接粘贴的 agent 指令 |
| **空状态 / 错误状态** | ❌ | ✅ 加载骨架、空列表、覆盖层 |
| **Prompt 复制按钮** | ❌ | ✅ 一键复制到剪贴板 |

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 增强版工作台页面 |
| `styles.css` | 增强版界面样式 |
| `app.js` | 增强版本地审计数据、评分、证据、导出逻辑 |
| `audit.json` | **数据契约**：crawler 输出格式，dashboard 消费格式 |
| `collector-template.md` | **Collector Bridge**：如何从零构建 crawler，产出 audit.json |
| `openclaw-run.md` | **执行脚本**：可直接粘贴给 OpenClaw browser agent 的任务 prompt |
| `REVIEW.md` | Codex 基础版评审报告 |
| `README.md` | 本文件 |
| `SELLING.md` | 接单和报价说明 |
| `CLIENT_INTAKE.md` | 客户需求表 |
| `ACCEPTANCE_CHECKLIST.md` | 验收清单 |
| `sample-deliverables/` | 样例客户报告 |
| `evidence/` | 截图证据存放目录（crawler 产出后填充） |

## 数据流

```
OpenClaw Browser Agent (web_fetch + screenshot + click)
        │
        ▼
    audit.json (数据契约)
        │
        ▼
  index.html (Dashboard 渲染)
        │
        ▼
  导出：.md 报告 / .csv 修复清单 / .txt prompt
```

## 从 Demo 到生产

1. **Demo 阶段**：用 `index.html` + 样例数据做销售演示
2. **收集阶段**：用 `openclaw-run.md` 中的脚本指导 OpenClaw browser agent 真实采集
3. **数据阶段**：crawler 产出 `audit.json`
4. **分析阶段**：将 `audit.json` 加载到 dashboard，查看评分、证据、问题
5. **交付阶段**：导出客户报告、修复清单、实现 prompt
6. **修复阶段**：Codex 根据 prompt 产出 schema/policy/cart 修复代码

## 服务套餐

### Starter Audit
- 检查 5-8 个关键 URL
- 交付客户报告和修复清单
- 建议报价：USD 300-800

### Readiness Sprint
- 检查首页、集合页、10-30 个商品页、政策页、购物车和 checkout handoff
- 修复 schema、FAQ、商品内容模板和高优先级前端问题
- 建议报价：USD 1,500-4,000

### Monitoring Retainer
- 月度 OpenClaw 巡检
- 输出变化报告、截图证据和新增问题清单
- 建议报价：USD 300-1,200/月

## 已知限制

- 当前 demo 使用样例审计数据，不自动抓真实网站
- 不连接 Shopify Admin API
- 不进入付款提交，不处理支付数据
- 不承诺 AI 搜索排名、曝光或订单提升
- 不替代法律、隐私或平台政策合规审查
- 浏览器证据可以由 `collector-playwright.js` 填充；dashboard 当前主要展示截图路径和占位卡，不是完整图片查看器
- checkout handoff 会尝试进入 checkout URL，但不填写支付信息、不提交付款
- 自动 URL 发现依赖首页链接扫描；Hydrogen、SPA 或动态导航站点建议用 `--urls` 指定页面
