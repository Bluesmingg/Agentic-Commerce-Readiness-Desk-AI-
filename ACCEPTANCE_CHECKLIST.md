# Acceptance Checklist — Agentic Commerce Readiness Desk

## Demo 验收（增强版）

- [ ] `index.html` 可以直接双击打开，无控制台错误
- [ ] 页面在桌面宽度（>1080px）下显示双栏布局
- [ ] 页面在中等宽度（640-1080px）下单栏无重叠
- [ ] 页面在移动宽度（<640px）下单栏无重叠
- [ ] 加载样例数据后显示：
  - [ ] Overall + 3 个子分数（Discoverability / Checkout / Trust）
  - [ ] 6 个问题的可筛选列表
  - [ ] 选中问题的详情（page / signal / impact / fix / effort）
  - [ ] JSON-LD 证据面板（语法高亮）
  - [ ] Screenshot 证据面板（占位图标）
  - [ ] DOM Selector 证据面板
  - [ ] Evidence 选项卡切换正常
  - [ ] Checkout Handoff 验证面板（cart URL / redirect / items / subtotal / discount）
  - [ ] 已采集页面表（URL / type / status / JSON-LD / screenshots / warnings）
  - [ ] 采集概览统计
  - [ ] OpenClaw run plan
  - [ ] Implementation prompt（可复制）
- [ ] 严重度筛选下拉框可用（All / Critical / High / Medium / Low）
- [ ] 客户报告 Markdown 可导出，内容与当前数据一致
- [ ] 修复清单 CSV 可导出，包含所有问题
- [ ] OpenClaw 任务 txt 可导出，包含 store URL 和问题列表
- [ ] **audit.json 可导出**，文件格式与导入兼容
- [ ] **audit.json 可导入**：选择文件 → 页面更新
- [ ] 清空本地后回到空状态覆盖层
- [ ] 空状态覆盖层有两个入口：加载样例 / 上传 audit.json
- [ ] Prompt 复制按钮可将内容复制到剪贴板
- [ ] 工具不请求 token、cookie、后台密码或支付数据
- [ ] 控制台无 JavaScript 错误

## 客户交付验收（增强版）

- [ ] 报告列出被检查 URL、检查日期、平台、采集范围
- [ ] 每个问题包含 severity / page / signal / business impact / fix / effort
- [ ] 至少覆盖：schema（Product/Offer/ItemList）、product facts、policy readability、cart/checkout path
- [ ] JSON-LD 证据包含提取的原始结构化数据 + 标注缺失字段
- [ ] Checkout handoff 证据包含 cart→checkout 状态（items / subtotal / redirect / discount）
- [ ] Screenshot 证据包含桌面 + 移动端截图引用（或说明截图路径）
- [ ] OpenClaw 浏览器证据包含 URL / viewport / 操作步骤 / 预期行为
- [ ] 修复建议能直接变成前端任务（effort 标注 S/M/L）
- [ ] 明确写出非承诺项：不保证排名、不提交付款、不替代法律合规
- [ ] audit.json 文件结构清晰，可被其他工具消费

## Collector Bridge 验收

- [ ] `collector-template.md` 提供完整的 5 阶段升级指南
- [ ] `openclaw-run.md` 提供可直接粘贴给 OpenClaw browser agent 的执行脚本
- [ ] `audit.json` 结构清晰，包含 meta / crawlResults / issues / runPlan
- [ ] 数据流文档清晰：crawler → audit.json → dashboard → exports
- [ ] 边界声明明确：不接 Admin API、不提交付款、不存 PII

## 文档验收

- [ ] `README.md` 列出所有功能、文件说明、数据流图
- [ ] `SELLING.md` 包含客户画像、外发模板、报价、升单路径、竞品对比
- [ ] `CLIENT_INTAKE.md` 包含完整信息收集表 + 权限确认清单
- [ ] `ACCEPTANCE_CHECKLIST.md`（本文件）覆盖 demo / 交付 / collector / 文档
- [ ] `REVIEW.md` 包含 Codex 基础版的逐文件评估和改进点
- [ ] 样例客户报告包含 executive summary + findings table + evidence plan + boundary
