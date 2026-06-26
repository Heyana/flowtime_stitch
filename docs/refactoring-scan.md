# Flowtime 重构信号扫描

> **日期**: 2026-06-27 | **工具**: refactoring-guide (20+ 检测信号)
> **范围**: 14 个源文件 | **命中**: 10 / 20+

---

## 🔴 高严重度 (6)

### R1 — 上帝组件 (God Component)

**文件**: `src/App.tsx` (539 行)

App.tsx 同时承载 7 类不相关逻辑：

| 领域 | 行号 | 归类 |
|------|------|------|
| 计时器状态机 (start/pause/resume/finish/checkout/stop/skip) | 275-353 | 领域逻辑 |
| 连续打卡计算 (updateStreak) | 245-272 | 领域逻辑 |
| Session 持久化 (3 × useEffect → localStorage) | 74-92 | 基础设施 |
| 原生通知集成 (haptics/foreground/notification) | 107-154, 184-186 | 基础设施 |
| 后台时间追踪 (visibilitychange + capacitor) | 107-154 | 基础设施 |
| Tab 导航 + 条件渲染 (5 tabs) | 48, 415-535 | UI 编排 |
| UI 布局/品牌 (header/nav/avatar) | 377-538 | UI |

**建议**: 提取 `useTimer()`, `useStreak()`, `usePersistence()` 三个 hook，App.tsx 仅做编排。

---

### R2 — 混合关注点 (getter+副作用)

**文件**: `src/capacitor-native.ts:246-254`

```typescript
export function loadBackgroundCheckpoint(): BackgroundCheckpoint | null {
  const raw = localStorage.getItem(BG_KEY);
  if (!raw) return null;
  localStorage.removeItem(BG_KEY);  // 副作用：读的同时删除
  ...
}
```

伪装成 getter，实际行为是 `pop()`。两个消费者调用第二次会得到 `null`。违反命令-查询分离 (CQS)。

**建议**: 拆分为 `peekBackgroundCheckpoint()` (只读) + `consumeBackgroundCheckpoint()` (读+删)。

---

### R3 — 发散式变更

**文件**: `src/App.tsx`

App.tsx 因 7 种不相关的原因变更：改 timer 逻辑不应涉及 nav 栏、改 streak 不应涉及持久化。合并冲突风险高，无法按功能标志部署。

---

### R4 — 位置错误的业务逻辑

**文件**: `src/App.tsx:189-236, 245-272`

Session 工厂逻辑（构建 Session 对象）和 streak 计算都硬编码在 App.tsx 内部，无法单独测试。

**建议**: 提取 `createSession()` 工厂函数和 `calculateStreak()` 纯函数。

---

### R5 — 无错误边界

**文件**: 全局缺失

- React `<ErrorBoundary>` 不存在——计时器渲染崩溃会导致整个应用白屏
- `capacitor-native.ts` 中 9 处 `catch { /* ignore */ }` 静默吞错（L89, L104, L110...）
- `JSON.parse(localStorage)` 损坏数据会导致组件崩溃

**建议**: `main.tsx` 添加顶层 ErrorBoundary；capacitor 桥接层加 `onError` 回调。

---

### R6 — 时间耦合 (Temporal Coupling)

**文件**: `src/App.tsx:65, 159-163, 170-172, 240-242`

`handleTimerCompleteRef` + `shouldCompleteRef` 双 ref 同步链是绕过 React 闭包陈旧问题的变通方案。useEffect 重排或 Suspense 引入会导致 bug。

**建议**: 用 `useReducer` 替代分散的 `useState`，reducer 可原子操作 `timeLeft→0` + 触发完成。

---

## 🟡 中严重度 (4)

### R7 — 数据团块 (Data Clump)

**文件**: `src/capacitor-native.ts:67, 94, 165`

`(timeLeft, mode: 'focus'|'rest')` 元组在 3 个函数间重复。`'work'→'focus'` 映射在 App.tsx 5 处重复。

**建议**: 提取 `timerToNotificationMode()` 辅助函数。

---

### R8 — 缺少组合根 (Missing Composition Root)

**文件**: `src/main.tsx`

- `theme.initTheme()` 直接调 DOM API，测试无法 mock
- i18n 模块导入时自初始化
- App.tsx 内部自初始化 localStorage
- Capacitor 惰性初始化

没有统一启动顺序和依赖注入点。

**建议**: 创建 `bootstrap(config)` 函数，接受可替代的存储/通知/音频实现。

---

### R9 — 解析不验证 (Parse, Don't Validate)

**文件**: `src/App.tsx:32-45`

3 处 `JSON.parse(localStorage.getItem(...))` 无运行时校验。损坏数据（如 `workDuration: "twenty-five"`）会静默产生运行时错误。

**建议**: 用 Zod 或简单验证函数校验解析结果，无效时降级到默认值并记 warning。

---

### R10 — 非法状态可表示

**文件**: `src/types.ts`, `src/App.tsx`

- `timerState: 'paused'` + `timerMode: 'rest'` 是无效但合法的组合
- `timeLeft=300, totalDuration=150` (剩余 > 总时长) 可被 setState
- `lunchBreakEnabled: false` 时 `lunchStartTime/EndTime` 仍然必填

**建议**: 使用判别联合体 `TimerStatus`；`lunchBreak` 改为可选对象。

---

## ✅ 明确通过 (10 信号)

| 信号 | 说明 |
|------|------|
| 2 Feature Envy | 无 OOP 类 |
| 3 Import Cycles | 无循环依赖 |
| 4 Boolean Flag Args | 组件 props 中无布尔标志 |
| 6 Multi-directory Changes | 最多跨 2 目录 |
| 9 Leaked Integration | Capacitor 类型被妥善抽象 |
| 10 State Mutation Scatter | 每个 localStorage key 由单一模块拥有 |
| 11 Undefended Setters | TypeScript 类型校验覆盖 |
| 12 Pass-through Layers | 无无意义委托层 |
| 13 Dumping Ground | 无 utils/common/helpers 命名 |
| 16 Boolean Props | 组件 props 类型安全 |

---

## 修复优先级

| 优先级 | 信号 | 影响 | 工作量 |
|--------|------|------|--------|
| 1 | R5 错误边界 | 崩溃白屏 | 小 |
| 2 | R2 混合关注点 | 数据丢失风险 | 小 |
| 3 | R1 上帝组件 | 测试/维护困境 | 中 |
| 4 | R6 时间耦合 | 隐蔽 bug | 中 |
| 5 | R9 解析不验证 | 静默错误 | 小 |
| 6 | R10 非法状态 | 类型安全 | 中 |
| 7 | R7 数据团块 | 重复代码 | 小 |
| 8 | R8 组合根 | 可测试性 | 中 |
| 9 | R4 业务逻辑 | 可测试性 | 中 |
| 10 | R3 发散变更 | 合并冲突 | 中 |
