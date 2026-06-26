# Flowtime 设计改进规格文档

> **状态**: Draft | **日期**: 2026-06-27 | **基于**: 设计审计报告 v1
> **父级 PRD**: [PRD-flowtime.md](./PRD-flowtime.md)

---

## 1. Executive Summary

针对 2026-06-27 设计审计发现的 8 项问题（2 个 P1 关键、6 个 P2 中等），进行系统性修复。核心目标：补齐暗色模式、消除弹跳动效、接入无障碍标准、替换原生 dialog、收敛导航结构。预计 P1 修复后设计评分从 15/20 提升至 17/20（Excellent 区间）。

---

## 2. Problem Statement

### 现状

审计发现 Flowtime 的设计基础扎实（语义 HTML、设计 Token 系统、意图明确的颜色体系），但存在以下具体问题：

| 严重度 | # | 问题 | 位置 |
|--------|---|------|------|
| P1 | 1 | 无暗色模式 — 与 "Zen" 产品定位冲突 | `index.html:2` |
| P1 | 2 | 弹跳缓动 — `cubic-bezier(0.34,1.56,0.64,1)` 玩具化感知 | `App.tsx:474` |
| P1 | 3 | 无 `prefers-reduced-motion` — WCAG 2.3.3 违规 | 全局 CSS |
| P2 | 4 | `transition-all` 性能反模式 | `TimerTab.tsx:78` |
| P2 | 5 | SVG 硬编码颜色 — 阻断暗色模式 | `TimerTab.tsx:76` |
| P2 | 6 | Debug Tab 侵入主导航 | `App.tsx:526-536` |
| P2 | 7 | `confirm()`/`alert()` 原生对话框 | `HistoryTab.tsx:66`, `BreaksTab.tsx:43` |
| P2 | 8 | 效率计算压制休息行为 | `HistoryTab.tsx:39-41` |

### 为什么现在修

- 暗色模式缺失是用户能直接感知的功能缺口
- 弹跳动效 + 无 reduced-motion 的组合对前庭功能障碍用户构成实际障碍
- `transition-all` 在低端设备上会造成可感知的卡顿
- Debug Tab 污染导航结构，阻碍后续功能迭代

---

## 3. Solution Overview

```
Phase 1 (P1)                    Phase 2 (P2)
┌──────────────────────┐       ┌──────────────────────┐
│ 1. 暗色模式 Token       │       │ 4. transition-all 修复  │
│ 2. 弹跳缓动 → Expo     │  ──▶  │ 5. SVG 颜色 → CSS 变量  │
│ 3. reduced-motion     │       │ 6. Debug 移入 Settings  │
└──────────────────────┘       │ 7. 自定义 Modal         │
                               │ 8. 效率指标重构         │
                               └──────────────────────┘
```

### 3.1 暗色模式设计 Token

基于现有浅色 Token 生成暗色对应。遵循 Material Design 3 的同色系映射规则：

| Token | 浅色 | 暗色 |
|-------|------|------|
| `--color-primary` | `#b3272e` | `#ffb3b3` (色调 5°) |
| `--color-on-primary` | `#ffffff` | `#680011` |
| `--color-secondary` | `#006d3e` | `#66d99a` |
| `--color-on-secondary` | `#ffffff` | `#00391b` |
| `--color-surface` | `#f9f9f9` | `#131316` |
| `--color-surface-container-lowest` | `#ffffff` | `#1e1e21` |
| `--color-surface-container-low` | `#f3edec` | `#272528` |
| `--color-surface-container` | `#ede7e6` | `#333134` |
| `--color-surface-container-high` | `#e7e2e1` | `#3e3c3d` |
| `--color-on-surface` | `#201a19` | `#ece0de` |
| `--color-on-surface-variant` | `#59413f` | `#d8c2bf` |
| `--shadow-soft` | `0 4px 20px rgba(0,0,0,0.04)` | `0 4px 20px rgba(0,0,0,0.25)` |
| `--shadow-lifted` | `0 8px 32px rgba(0,0,0,0.08)` | `0 8px 32px rgba(0,0,0,0.35)` |

策略：使用 Tailwind v4 的 `@media (prefers-color-scheme: dark)` 嵌入到 CSS token 定义中，不在 HTML class 做 `dark:` 模式切换。按系统设置自动跟随。

### 3.2 缓动函数替换

```
旧: cubic-bezier(0.34, 1.56, 0.64, 1)  ← 弹跳（超出 1.0 上界）
新: cubic-bezier(0.16, 1, 0.3, 1)      ← Expo-out 风格
```

同时定义全局 CSS easing 变量供复用：
- `--ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1)` — 强调型入场
- `--ease-standard: cubic-bezier(0.2, 0, 0, 1)` — 标准入场

### 3.3 `prefers-reduced-motion` 全局规则

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

呼吸 Modal 的缩放动画也受此规则约束，无需单独处理。

---

## 4. User Stories

### Story D1: 暗色模式支持

**作为** 用户，**我希望** 应用自动跟随系统亮暗模式切换，**以便** 在夜间或低光环境下舒适使用。

**验收标准**:
- [ ] `<html>` 移除 `class="light"` — 由 CSS 媒体查询接管
- [ ] 所有 `index.css` 中的设计 Token 添加 `@media (prefers-color-scheme: dark)` 对应值
- [ ] 卡片阴影在暗色模式下增强（`shadow-soft`/`shadow-lifted` 加深）
- [ ] Focus Red / Rest Green 在暗色下提亮（保持 AA 4.5:1 对比度）
- [ ] 圆环计时器 SVG 颜色跟随 CSS 变量切换（见 Story D3）
- [ ] 文字对比度在暗色下 ≥ 4.5:1（`on-surface` / `on-surface-variant`）

**代码影响**: `index.css:1-112`, `index.html:2`

---

### Story D2: 缓动函数规范化

**作为** 用户，**我希望** 导航和按钮的交互动效感觉专业而非玩具化，**以便** 每天使用不会产生视觉疲劳。

**验收标准**:
- [ ] 底部导航激活状态使用 `ease-emphasis`（`cubic-bezier(0.16, 1, 0.3, 1)`）替代弹跳缓动
- [ ] 导航缩放动画保持 `scale-110` 但配合新缓动
- [ ] `index.css` 中新增 `--ease-emphasis` 和 `--ease-standard` CSS 变量
- [ ] 对全局 `transition` 声明统一审计：卡片 hover、按钮 focus 等使用 `ease-standard`
- [ ] `prefers-reduced-motion` 规则覆盖所有动画（见 Story D3）

**代码影响**: `src/App.tsx:474`, `index.css:1-112`

---

### Story D3: `prefers-reduced-motion` 与 `transition-all` 修复

**作为** 具有前庭功能障碍的用户，**我希望** 可以关闭界面动画，**以便** 避免眩晕和其他不适。

**验收标准**:
- [ ] `index.css` 末尾添加 `@media (prefers-reduced-motion: reduce)` 全局规则
- [ ] 计时器圆环 `transition-all duration-1000` 改为 `transition-[stroke-dashoffset] duration-1000`
- [ ] 呼吸球体动画受 `prefers-reduced-motion` 影响自动关闭
- [ ] 全局验证：开启系统「减少动态效果」后，所有动画消失

**代码影响**: `index.css`, `src/components/TimerTab.tsx:78`

---

### Story D4: SVG 颜色 Token 化

**作为** 开发者，**我希望** 计时器圆环的 SVG 颜色通过 CSS 变量控制，**以便** 颜色跟随暗色/浅色模式自动切换而不需要 JS 分支。

**验收标准**:
- [ ] TimerTab 中 `stroke={isWork ? '#b3272e' : '#006d3e'}` 替换为 `stroke="var(--color-primary)"` / `stroke="var(--color-secondary)"`
- [ ] SVG 不在 JSX 中做条件颜色判断，完全由 CSS 控制
- [ ] 圆环在 Work/Rest 状态下颜色正确（红/绿）
- [ ] 暗色模式下红/绿自动切换为提亮版本

**代码影响**: `src/components/TimerTab.tsx:76`

---

### Story D5: 导航结构收敛

**作为** 用户，**我希望** 底部导航只包含核心功能，**以便** 减少认知负载和误触。

**验收标准**:
- [ ] 底部导航从 5 个 Tab 减为 4 个：Timer / History / Breaks / Settings
- [ ] Debug Tab 入口移至 Settings 页面底部，以 "Debug Panel" 链接形式呈现
- [ ] 点击 Settings 中的 Debug 入口跳转到 DebugTab（保路由）
- [ ] `App.tsx` 中 `activeTab` 类型排除 `'debug'` — Debug 通过独立状态管理
- [ ] 底部导航按钮间距重新分布（4 个按钮等宽）

**代码影响**: `src/App.tsx:526-536`, `src/components/SettingsTab.tsx`

---

### Story D6: 浏览器原生 Dialog 替换

**作为** 用户，**我希望** 确认和提示对话框与 App 设计一致，**以便** 不打断视觉连续性。

**验收标准**:
- [ ] 创建通用 `ConfirmModal` 组件（或复用现有 Modal 模式）
- [ ] `HistoryTab.tsx:66` 中 `confirm('Are you sure...')` 替换为自定义 `<ConfirmModal>`
- [ ] `BreaksTab.tsx:43` 中 `alert(t('breaks.stretchComplete'))` 替换为 `<Toast>` 或内联 `<div>` 完成提示
- [ ] Clear All 保留确认流程，但改用自定义 Modal
- [ ] ConfirmModal 样式与设计 Token 一致（`bg-surface-container-high` + `shadow-lifted` + `rounded-3xl`）

**代码影响**: `src/components/HistoryTab.tsx:66`, `src/components/BreaksTab.tsx:43`, 新增 `src/components/ConfirmModal.tsx`

---

### Story D7: 效率指标重构

**作为** 用户，**我希望** 效率指标不因休息而下降，**以便** 不被数据惩罚休息行为。

**验收标准**:
- [ ] 将 "Efficiency" 卡片移除 `focus / (focus + rest)` 公式
- [ ] 替换为「完成率」= 今日完成 Session 数 vs 昨日完成 Session 数（或本周均值）
- [ ] 若无昨日数据，显示「会话数」计数（如 "5 sessions"）
- [ ] 保留 totalFocusMinutes 和 totalRestMinutes 的独立展示（两者都有价值）

**备选方案**: 如果需要保留效率概念，使用 `focus / (workDuration * sessionCount)` (实际专注 / 理论值) 来计算专注利用率——这样休息不影响，只有未完成的 session 拖低效率。

**代码影响**: `src/components/HistoryTab.tsx:39-41`

---

## 5. Success Metrics

| # | 指标 | 当前 | 目标 | 验证方式 |
|---|------|------|------|---------|
| D1 | 暗色模式 Token 覆盖率 | 0 | 100% | 视觉回归：切换系统亮暗模式，所有页面色值正常 |
| D2 | 弹跳缓动消除 | 1 处 | 0 处 | Grep `cubic-bezier.*1\.56` 无结果 |
| D3 | `transition-all` 消除 | 1 处 | 0 处 | Grep `transition-all` 无结果 |
| D3 | reduced-motion 支持 | 无 | 1 条媒体查询 | 开启系统「减少动态效果」→ 动画消失 |
| D4 | SVG 硬编码颜色 | 2 处 | 0 处 | Grep `stroke={'#'` 无结果 |
| D5 | 底部导航 Tab 数 | 5 | 4 | 肉眼确认 |
| D6 | 原生 confirm/alert | 2 处 | 0 处 | Grep `confirm(` 和 `alert(` 在组件中无结果 |
| D7 | 效率指标是否惩罚休息 | 是 | 否 | 增加休息时长 → 指标不变差 |

---

## 6. Out of Scope

| 不做 | 原因 |
|------|------|
| 暗色模式手动切换（toggle） | v1 仅跟随系统 `prefers-color-scheme`，手动切换是 P2 |
| 完整动画系统重构 | 本次只修反模式（弹跳、transition-all），不动整体动画架构 |
| 底部导航改为顶部导航 | 单手操作场景下底部导航是正确的，只收敛 Tab 数 |
| 呼吸/拉伸时长自定义 | 本次是设计改进 Spec，不是功能 Spec |
| motion 包移除 | 未来可能用于更高级的动画（如确认弹窗入场），待评估后处理 |
| 11 项全部修复 | 本次聚焦审计中的 P1+P2 项（8 项），P3 留待后续 |

---

## 7. Dependencies & Risks

### 技术依赖

| 依赖 | 说明 |
|------|------|
| Tailwind CSS v4 | 已使用，暗色模式通过 CSS 变量媒体查询实现，不依赖 Tailwind dark mode plugin |
| `motion` (framer-motion) | 仍在 `package.json` 中，但本次不涉及变更 — ConfirmModal 可用其做入场动画 |
| Lucide React | 新增 ConfirmModal 的图标（AlertTriangle / Check / X）均来自现有图标集 |

### 风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| 暗色 Token 颜色选择不佳 | 对比度不足或视觉效果差 | 参考 MD3 同色系映射表，完成后用 DevTools 对比度检查器验证 |
| 移除 Debug Tab 后无处可放 | Debug 功能丢失 | Settings 底部保留入口，路由不变，只是不在底部导航显示 |
| ConfirmModal 实现过于复杂 | 引入新的包或状态管理 | 复用现有 Modal 模式（参考 LogSessionModal），用简单 state 驱动 |

---

## 8. Open Questions

- [ ] 暗色模式是否需要在 Settings 中添加强制切换 toggle？（建议 v2）
- [ ] 效率指标的新公式选 "完成率" 还是 "专注利用率"？
- [ ] Debug Tab 在 Settings 中的入口是否显眼？是否需要 icon + 文字，还是纯链接？
- [ ] ConfirmModal 的 "确认删除" 动画是否用 motion 包的 `AnimatePresence`？还是保持简单 CSS transition？
