# Agentic Commerce Readiness Sprint - Selling Notes

## 一句话定位

把 Shopify / DTC 店铺改造成 AI shopping agents 更容易理解、比较和推荐的 storefront，并用 OpenClaw 输出可复查的浏览器证据。

## 跟传统 SEO 审计的区别

传统 SEO 审计看的是 Google 排名因素。我们看的是 **machine readability**：AI shopping agent 能不能稳定地从你的商品页里提取价格、变体、库存、配送时间、退货政策。Google AI Mode、ChatGPT shopping、Perplexity shopping 都是这个逻辑。

## 客户画像

- 已经有 30+ SKU 的 DTC 店铺
- 正在投放 Shopping / Meta / TikTok / affiliate 流量
- 商品页和政策页多年没系统整理
- 团队有运营但缺前端工程能力
- 对 AI 搜索、Google AI Mode、ChatGPT shopping、agent checkout 有焦虑，但不知道先改哪里

## 外发私信模板

```text
我在做一个很窄的 Shopify readiness sprint：检查商品页、集合页、政策页和 checkout 是否能被 AI shopping/search agents 稳定读取。

交付不是泛泛 SEO 报告，而是：
- Product/Offer/ItemList schema 缺口（带 JSON-LD 证据）
- 价格/库存/变体一致性检查
- shipping/returns FAQ 机器可读性
- cart/checkout handoff 浏览器验证
- 可直接给前端执行的修复清单（按严重度排序）

不需要后台 token，也不碰支付数据。可以先用 5 个 URL 做一个小样。

附带截图证据和 OpenClaw 验证日志。
```

## 报价建议

| 套餐 | 范围 | 交付 | 价格 |
| --- | --- | --- | --- |
| Starter Audit | 5-8 个 URL | 报告 + CSV backlog + JSON-LD 证据 | USD 300-800 |
| Readiness Sprint | 15-40 个 URL + 轻量修复 | 报告 + 修复 PR/patch + 回归证据 + audit.json | USD 1,500-4,000 |
| Monitoring | 月度复测 | 变化报告 + 新增问题清单 + 截图对比 | USD 300-1,200/月 |

## 升单路径

1. 免费或低价检查 3 个 URL，展示一条真实 schema/checkout/policy 问题 + JSON-LD 证据截图
2. 转 Starter Audit（5-8 URL，2-3 天交付）
3. 转 Readiness Sprint（完整店铺 + 前端修复，1-2 周）
4. 加月度监控（防止主题更新、app 注入、商品导入后回归）

## 交付物清单

每次交付包含：

1. **客户报告** (`.md`) — 总分 + 子分数 + 问题表 + 修复建议
2. **修复清单** (`.csv`) — 可直接导入 Jira/Linear/Notion
3. **audit.json** — 完整数据，可用于后续自动化
4. **OpenClaw 任务 prompt** (`.txt`) — 可复制给 OpenClaw/Codex 执行修复
5. **截图证据**（Starter 起） — 每个问题页面的桌面+移动端截图
6. **JSON-LD 证据**（Starter 起） — 提取的结构化数据原文 + 标注缺失项

## 不要承诺

- 不承诺 Google / ChatGPT / Perplexity 排名
- 不承诺订单增长百分比
- 不请求 Shopify Admin token、支付后台、客户隐私数据
- 不替代完整 SEO、广告投放或法律合规
- 不进入付款提交环节

## 为什么现在做

- Google AI Mode 正在大规模推出
- ChatGPT shopping 已经支持直接比价
- Perplexity shopping 在做 agent checkout
- 店铺的 machine readability 会直接影响这些渠道的曝光和转化
- 大部分 Shopify 店铺的 schema 和 policy 还是 2018 年的水平

## 竞品差异

| | 传统 SEO 工具 | Agentic Commerce Readiness |
|---|---|---|
| 检查维度 | 排名因素、关键词、backlink | Schema 完整性、机器可读性、checkout 稳定性 |
| 证据类型 | SERP 截图 | JSON-LD diff、DOM 状态、checkout redirect、变体价格一致性 |
| 修复输出 | SEO 建议文档 | 前端可执行任务 + Codex/OpenClaw prompt |
| 技术依赖 | SEO 平台账号 | 零依赖，浏览器打开即用 |
