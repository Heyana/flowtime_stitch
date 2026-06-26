# Flowtime Migration Spec

> React (flowtime_stitch) → Flutter (flowtime)
>
> 最后更新: 2026-06-27

---

## 1. Overview

| 维度 | Source | Target |
|------|--------|--------|
| 框架 | React 19 + Vite + Capacitor | Flutter + signals |
| 平台 | Android (Capacitor) + Web | Android + Windows + macOS |
| 设计系统 | Liquid Round | Liquid Round (目标) |
| 状态管理 | useState + useRef + localStorage | signals (Dart) |
| 持久化 | localStorage | shared_preferences + SQLite |
| 音频 | Web Audio API 合成 | audioplayers (mp3) |
| 通知 | @capacitor/local-notifications | flutter_local_notifications |
| 触觉 | @capacitor/haptics | Flutter 内置 HapticFeedback |

---

## 2. Design System Migration

### 2.1 Color Tokens

| Token | Hex | 用途 |
|-------|-----|------|
| Focus Red (Primary) | `#b3272e` | 工作阶段、主按钮、进度环 |
| Focus Container | `#ff5f5f` | 工作标签、active tab |
| Rest Green (Secondary) | `#006d3e` | 休息阶段、水杯追踪、呼吸 |
| Rest Container | `#1fff9b` | 休息标签背景 |
| Background (Level 0) | `#f9f9f9` | 底层画布 |
| Card (Level 1) | `#ffffff` | 卡片、容器 |
| Content Primary | `#1a1c1c` | 标题、正文 |
| Content Secondary | `#59413f` | 描述文字、placeholder |

**Action**: 更新 `wind_theme.dart` 和 `shadcn_theme.dart`，替换全部颜色 token。

### 2.2 Typography

| Token | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| display-lg | Sora | 48px | 700 | 56px | -0.02em |
| display-lg-mobile | Sora | 36px | 700 | 42px | -0.02em |
| headline-md | Sora | 24px | 600 | 32px | — |
| body-lg | Inter | 18px | 400 | 28px | — |
| body-md | Inter | 16px | 400 | 24px | — |
| label-md | Inter | 14px | 600 | 20px | 0.01em |
| label-sm | Inter | 12px | 500 | 16px | — |

**Action**: 
- 在 Flutter 项目中注册 Sora + Inter 字体（pubspec.yaml assets）
- 更新 Wind theme 的 `fontFamilies` map：`'sans'/'display'/'body'/'label'` 指向对应字体
- 更新 Shadcn theme 的 `Typography`

### 2.3 Elevation & Shadows

| Level | Background | Shadow |
|-------|-----------|--------|
| 0 (Base) | `#f9f9f9` | None |
| 1 (Ambient Card) | Card `#ffffff` | `0 4px 20px rgba(0,0,0,0.04)` |
| 2 (Lifted Controls) | Card `#ffffff` | `0 8px 32px rgba(0,0,0,0.08)` |

### 2.4 Component Styles

**Floating Bottom Navigation Bar**:
- 高度圆角 pill 形状 (`rounded-full`)
- Active tab: 圆形彩色背景 (Focus Red / Rest Green) + 白色图标 ("Liquid Drop" 效果)

**Micro-Interaction Chips & Badges**:
- 全圆角 (`rounded-full`)
- 缩放过渡动画

**Progressive Circle Timer Ring**:
- 粗圆环 (`strokeWidth: 16`, `strokeLinecap="round"`)
- 动态颜色切换：工作 `#b3272e` / 休息 `#006d3e`

---

## 3. Architecture

### 3.1 Target File Structure

```
lib/
├── main.dart
├── core/
│   ├── i18n/
│   │   ├── locale_service.dart
│   │   └── strings.dart                    # [UPDATE] 补全所有 i18n keys
│   └── services/
│       ├── audio_service.dart              # [UPDATE] 确保 bell/chime 播放正常
│       ├── theme_mode_service.dart
│       ├── timer_service.dart              # [UPDATE] 补全 auto-start / lunch
│       ├── notification_service.dart       # [NEW] flutter_local_notifications 封装
│       └── haptic_service.dart             # [NEW] HapticFeedback 封装
├── data/
│   ├── database/
│   │   └── db_helper.dart                  # [UPDATE] Session 表扩展
│   └── models/
│       ├── session.dart                    # [UPDATE] 加 title / type / durationMinutes
│       └── user_profile.dart               # [NEW] name / avatarUrl / streak
├── my-wind/
│   └── ...
├── presentation/
│   ├── main_layout.dart                    # [UPDATE] 4 tab 导航 + Liquid Drop 样式
│   ├── timer/
│   │   └── timer_screen.dart               # [UPDATE] + title input, SVG ring style
│   ├── stats/
│   │   └── stats_screen.dart               # [UPDATE] + streak, efficiency, rest, manual add/delete
│   ├── breaks/                             # [NEW]
│   │   ├── breaks_screen.dart              # [NEW] 充电中心主页
│   │   ├── water_tracker.dart              # [NEW] 饮水追踪 0-8 杯
│   │   ├── stretch_guide.dart              # [NEW] 办公室拉伸 4 动作
│   │   └── breathing_modal.dart            # [NEW] 箱式呼吸 4 阶段动画
│   ├── settings/
│   │   └── settings_screen.dart            # [UPDATE] + avatar, sliders, toggles, lunch edit
│   ├── debug/
│   │   └── debug_screen.dart               # [NEW] 铃声/通知/倒计时测试
│   └── shared/
│       ├── theme/
│       │   ├── shadcn_theme.dart           # [UPDATE] Liquid Round colors
│       │   └── wind_theme.dart             # [UPDATE] Liquid Round tokens
│       └── widgets/
│           ├── progress_ring.dart           # [NEW] SVG 风格环形进度条
│           └── confirm_modal.dart           # [NEW] 通用确认弹窗
└── router/
    └── app_router.dart                      # [UPDATE] 4 tab + debug route
```

### 3.2 Navigation Update

| Tab Index | Route | Label | Icon |
|-----------|-------|-------|------|
| 0 | `/timer` | 计时器 | LucideIcons.timer |
| 1 | `/history` | 会话 | LucideIcons.barChart3 |
| 2 | `/breaks` | 充电 | LucideIcons.coffee |
| 3 | `/settings` | 设置 | LucideIcons.settings |

Debug page: 通过设置页底部入口 push，不在底部导航中。

---

## 4. Plugin Dependencies

### 4.1 New (add to pubspec.yaml)

| 包名 | 版本 | 用途 |
|------|------|------|
| `flutter_local_notifications` | ^22.0.1 | 本地通知 + Android 前台服务 ongoing 通知 |
| `google_fonts` | ^6.x | Sora + Inter 字体加载 |

### 4.2 Existing (keep)

| 包名 | 用途 |
|------|------|
| `signals` + `signals_flutter` | 状态管理 |
| `shadcn_flutter` | UI 组件库 |
| `fluttersdk_wind` | Tailwind 布局 |
| `lucide_icons_flutter` | 图标 |
| `audioplayers` | 音频播放 |
| `go_router` | 路由 |
| `shared_preferences` | KV 持久化 |
| `sqflite` + `sqflite_common_ffi` | SQLite |

---

## 5. Data Model Changes

### 5.1 Session (DB table → Dart model)

```dart
class Session {
  int? id;
  String type;           // 'work' | 'rest'     [NEW]
  String title;          // session title       [NEW]
  int durationMinutes;   // planned duration    [NEW]
  DateTime startTime;
  DateTime? endTime;
  int cyclesCompleted;
  int totalWorkSeconds;
  int totalBreakSeconds;
}
```

### 5.2 UserProfile (shared_preferences)

```dart
class UserProfile {
  String name;
  String avatarUrl;
  int streak;
  String? lastActiveDate;  // 'YYYY-MM-DD'
}
```

### 5.3 Settings (shared_preferences) — 扩展现有

```dart
class RhythmSettings {
  int workDuration;        // 已有
  int restDuration;        // 已有
  bool autoStartBreaks;    // [NEW]
  bool autoStartWork;      // [NEW]
  bool lunchBreakEnabled;  // 已有
  String lunchStartTime;   // 已有  'HH:MM'
  String lunchEndTime;     // 已有  'HH:MM'
}
```

---

## 6. Feature Implementation Checklist

### 6.0 Design System (Phase 0 — infrastructure)

- [ ] P0.1 在 pubspec.yaml 注册 Sora + Inter 字体
- [ ] P0.2 更新 `wind_theme.dart`：颜色、字体、阴影 per §2
- [ ] P0.3 更新 `shadcn_theme.dart`：ColorScheme + Typography
- [ ] P0.4 实现 `progress_ring.dart`：SVG 风格圆环组件 (round caps, 动态颜色)
- [ ] P0.5 更新 `main_layout.dart`：Liquid Drop 底部导航

### 6.1 Timer Screen (Phase 1)

| Feature | Source | Notes |
|---------|--------|-------|
| 任务标题输入框 | `TimerTab.tsx` ll.93-101 | 仅 work phase 显示，idle 状态可编辑 |
| 动态状态徽章 | `TimerTab.tsx` ll.46-69 | 工作=红色圆点动画 / 休息=绿色圆点动画 |
| SVG 风格进度环 | `TimerTab.tsx` ll.71-90 | 用 `progress_ring.dart` 组件 |
| 运行时控制按钮组 | `TimerTab.tsx` ll.107-140 | Start/Pause/Resume/Finish/StopAll |
| 休息推荐活动卡片 | `TimerTab.tsx` ll.143-177 | 散步/喝水/深呼吸快捷入口 |
| Check-in 完成记录到 Session | `App.tsx` (auto) | 每次 work session 完成写入 DB |

### 6.2 History Screen (Phase 2)

| Feature | Source | Notes |
|---------|--------|-------|
| Streak 连续天数卡片 | `HistoryTab.tsx` ll.75-78 | `userProfile.streak` + `Flame` 图标 |
| 效率统计卡片 | `HistoryTab.tsx` ll.79-82 | 今日完成 work session 数 |
| 休息时长卡片 | `HistoryTab.tsx` ll.83-86 | 今日 rest 总时长 |
| Timeline 时间线 | `HistoryTab.tsx` ll.99-133 | 竖线时间轴，work=红点/rest=绿点 |
| 手动添加 Session 模态 | `HistoryTab.tsx` ll.137-185 | 类型选择、标题、时长 slider、时间 |
| 删除单个 Session | `HistoryTab.tsx` ll.119-127 | 悬停显示 X → 二次确认 |
| 清空全部历史 | `HistoryTab.tsx` ll.187-197 | ConfirmModal danger 样式 |

### 6.3 Breaks Screen (Phase 3)

| Feature | Source | Notes |
|---------|--------|-------|
| 充电活动推荐 | `BreaksTab.tsx` ll.63-84 | 户外散步 + 呼吸引导，带 Launch 按钮 |
| 饮水追踪 0-8 杯 | `BreaksTab.tsx` ll.87-120 | 8 个竖条可视化，± 按钮，sharePreference 持久化 |
| 办公室拉伸 | `BreaksTab.tsx` ll.122-173 | 4 动作 30s 倒计时，自动切换，进度条 |
| 箱式呼吸模态 | `BreathingModal.tsx` (全文件) | 全屏，4 阶段 4s 循环，缩放动画圆，暂停/继续 |

#### Breathing Modal States

```
状态机: Inhale(4s) → Hold(4s) → Exhale(4s) → Rest(4s) → 循环
总时长: 2 分钟
视觉: 圆 scale(1.1 → 1.1→0.6→0.5) + 背景色随阶段切换
控制: Play/Pause toggle, X 关闭
```

### 6.4 Settings Screen (Phase 4)

| Feature | Source | Notes |
|---------|--------|-------|
| 用户头像选择 | `SettingsTab.tsx` ll.59-69 | 3 个 Google 头像，选中高亮 |
| 姓名输入 | `SettingsTab.tsx` ll.71-78 | 圆角输入框 |
| 工作/休息时长 slider | `SettingsTab.tsx` ll.84-105 | 工作 15-90 步进5，休息 5-30 步进1 |
| Auto-start 开关 | `SettingsTab.tsx` ll.109-133 | 自定义 toggle 组件 |
| 午休编辑 | `SettingsTab.tsx` ll.137-168 | 开关 + time picker |
| 语言切换 | `SettingsTab.tsx` ll.172-183 | 中/英 二选一 |
| 主题切换 | `SettingsTab.tsx` ll.186-214 | System/Light/Dark 三选一 |
| 保存 Button | `SettingsTab.tsx` ll.231-234 | Full-width pill button, toast |
| Debug 入口 | `SettingsTab.tsx` ll.217-228 | 底部隐藏入口 |

### 6.5 Debug Screen (Phase 5)

| Feature | Source | Notes |
|---------|--------|-------|
| 测试工作铃 | `DebugTab.tsx` ll.152-162 | 播放 work end chime |
| 测试休息铃 | `DebugTab.tsx` ll.165-174 | 播放 rest end chime |
| 测试弹窗通知 | `DebugTab.tsx` ll.177-188 | flutter_local_notifications 发送 |
| 状态栏倒计时 | `DebugTab.tsx` ll.190-210 | 10s ongoing notification 进度更新 |
| 返回设置 | `DebugTab.tsx` l.141 | ArrowLeft back button |

### 6.6 Infrastructure (Phase 6)

| Feature | Source | Notes |
|---------|--------|-------|
| 本地通知 | `App.tsx` + `capacitor-native.ts` | 计时完成时弹出通知 |
| 触觉反馈 | `capacitor-native.ts` (Haptics) | Light/Heavy impact on key actions |
| 后台时间追踪 | `capacitor-native.ts` | WidgetsBindingObserver + TimerService |
| Android 前台服务 | `capacitor-native.ts` | flutter_local_notifications ongoing 通知 |

---

## 7. i18n Strings

**Action**: 将 React 版 `i18n.ts` 中的所有 key 迁移到 Flutter 的 `strings.dart`，补全缺失的 section:
- `breaks.*` (整段遗漏)
- `breathing.*` (整段遗漏)
- `stretch.*` (整段遗漏)
- `debug.*` (整段遗漏)

Flutter 版 i18n 使用 signals 驱动的 `LocaleService`，保持现有架构。

---

## 8. Implementation Order

```
Phase 0: Design System
  └─ 字体 + 颜色 + 阴影 + progress_ring + Liquid Drop 导航
     （所有后续页面依赖此基础）

Phase 1: Timer Screen Enhancements
  └─ title input + 动态状态 + 改进进度环 + 休息推荐活动

Phase 2: History Screen Enhancements
  └─ Streak/Efficiency/Rest cards + Timeline + Manual add/delete

Phase 3: Breaks Screen (NEW)
  └─ 充电中心 + 水杯 + 拉伸 + 呼吸模态

Phase 4: Settings Screen Enhancements
  └─ 头像 + Sliders + Auto-start + 午休编辑 + Debug入口

Phase 5: Debug Screen (NEW)
  └─ 铃声/通知/倒计时测试

Phase 6: Infrastructure
  └─ flutter_local_notifications + HapticFeedback + 后台追踪 + Foreground Service
```

---

## 9. Notes

- **State management**: 保持 `signals` 方案，不引入新库
- **Audio**: 保持 `audioplayers` + mp3 文件，不模仿 React 的 Web Audio API 合成
- **Font loading**: 使用 `google_fonts` 包在线加载 Sora + Inter，避免打包字体文件
- **Progress ring**: 用 `CustomPainter` 实现 SVG 级别的圆环，支持 `strokeCap: StrokeCap.round` + 动态颜色
- **Bottom nav Liquid Drop**: 用 `Stack` + `Positioned` + `AnimatedContainer` 实现
- **Avoid re-inventing shadcn_flutter**: Switch/Toggle/Slider/Input 优先用 shadcn_flutter 已有组件
