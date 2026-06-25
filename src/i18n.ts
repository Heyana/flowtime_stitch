/**
 * Minimal i18n — Chinese (default) + English.
 * No external dependency, just a reactive t() function.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type Locale = 'zh' | 'en';

const STORAGE_KEY = 'flowtime_locale';

// ---------------------------------------------------------------------------
// Reactive locale state (kept in a module-level variable for simplicity)
// ---------------------------------------------------------------------------
let _locale: Locale = (localStorage.getItem(STORAGE_KEY) as Locale) || 'zh';
let _listeners: Array<() => void> = [];

export function getLocale(): Locale {
  return _locale;
}

export function setLocale(locale: Locale): void {
  _locale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  _listeners.forEach((fn) => fn());
}

export function onLocaleChange(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((f) => f !== fn);
  };
}

// ---------------------------------------------------------------------------
// Translation map
// ---------------------------------------------------------------------------
const zh: Record<string, string> = {
  // App shell
  'app.hello': '你好，',
  'app.brand': 'Flowtime',

  // Timer
  'timer.readyFocus': '准备专注',
  'timer.working': '工作中',
  'timer.resting': '休息中',
  'timer.focusTarget': '专注目标',
  'timer.focusPlaceholder': '你在做什么？',
  'timer.startFocus': '开始专注',
  'timer.pause': '暂停',
  'timer.resume': '继续',
  'timer.finish': '结束',
  'timer.checkoutDay': '结束当天',
  'timer.checkinFocus': '开始专注',
  'timer.recommended': '推荐活动',
  'timer.shortWalk': '散步',
  'timer.hydrate': '喝水',
  'timer.deepBreathing': '深呼吸',
  'timer.stretchLegs': '活动一下',
  'timer.drinkWater': '喝点水',
  'timer.breathingGuide': '呼吸引导',
  'timer.skipRest': '跳过休息',
  'timer.endSession': '结束 Session',
  'timer.workComplete': '专注完成',
  'timer.restComplete': '休息结束',
  'timer.workCompleteBody': '该休息了，起来走动、喝水或深呼吸。',
  'timer.restCompleteBody': '准备开始下一段专注。',
  'timer.timeLeft': '剩余时间',

  // History
  'history.title': '今日 Session',
  'history.totalFocus': '总专注时长',
  'history.logSession': '记录 Session',
  'history.clearAll': '清除全部',
  'history.streak': '连续打卡',
  'history.efficiency': '效率',
  'history.totalRest': '总休息',
  'history.timeline': '时间线',
  'history.empty': '今天还没有完成的专注。',
  'history.emptyHint': '完成的专注和休息会在这里排列。',
  'history.delete': '删除',
  'history.deleteConfirm': '确认删除？',
  'history.focus': '专注',
  'history.rest': '休息',
  'history.logModal.title': '记录 Session',
  'history.logModal.type': '类型',
  'history.logModal.focusSession': '专注',
  'history.logModal.restBreak': '休息',
  'history.logModal.titleLabel': '标题',
  'history.logModal.focusPlaceholder': '例如：编码核心界面',
  'history.logModal.restPlaceholder': '例如：短暂咖啡休息',
  'history.logModal.duration': '时长',
  'history.logModal.startTime': '开始时间',
  'history.logModal.endTime': '结束时间',
  'history.logModal.save': '保存记录',

  // Breaks
  'breaks.title': '充电中心',
  'breaks.subtitle': '在休息和过渡时间照顾身心。',
  'breaks.recharge': '充电活动',
  'breaks.outdoor': '户外散步',
  'breaks.outdoorDesc': '站起来走 5 分钟，远离屏幕。',
  'breaks.guided': '呼吸引导',
  'breaks.guidedDesc': '通过可视化调节神经系统。',
  'breaks.launch': '启动',
  'breaks.water': '水分补充',
  'breaks.waterHydrated': '水分充足，精力充沛！',
  'breaks.waterSip': '持续喝水，防止大脑疲劳',
  'breaks.waterReduce': '减少',
  'breaks.waterAdd': '加一杯',
  'breaks.deskWellness': '办公健康',
  'breaks.stretchTitle': '3 分钟放松拉伸',
  'breaks.stretchReady': '准备拉伸？',
  'breaks.stretchActive': '保持拉伸，深呼吸...',
  'breaks.startStretch': '开始拉伸',
  'breaks.pause': '暂停',
  'breaks.currentMove': '当前动作',
  'breaks.stretchComplete': '拉伸完成！感觉如何？',

  // Breathing
  'breathing.title': '箱式呼吸',
  'breathing.inhale': '缓慢吸气',
  'breathing.hold': '屏住呼吸',
  'breathing.exhale': '缓慢呼气',
  'breathing.rest': '保持空灵',
  'breathing.complete': '正念练习完成',
  'breathing.return': '返回',
  'breathing.footer': '保持舒适的直立姿势。箱式呼吸有助于放松中枢神经系统，减轻紧张和疲劳。',

  // Settings
  'settings.title': '设置',
  'settings.profile': '个人资料',
  'settings.name': '你的名字',
  'settings.namePlaceholder': '输入名字',
  'settings.nameHint': '设置名字会显示在顶部，营造专注氛围。',
  'settings.avatar': '选择头像',
  'settings.rhythm': '节奏控制',
  'settings.workSession': '专注时长',
  'settings.restBreak': '休息时长',
  'settings.automation': '自动化',
  'settings.autoBreaks': '自动开始休息',
  'settings.autoBreaksDesc': '工作结束后自动计时',
  'settings.autoWork': '自动开始工作',
  'settings.autoWorkDesc': '休息结束后自动开始',
  'settings.lunchSync': '午休同步',
  'settings.lunchBypass': '午休时段跳过',
  'settings.lunchDesc': '安排较长的暂停，跳过标准休息。',
  'settings.startTime': '开始时间',
  'settings.endTime': '结束时间',
  'settings.save': '保存设置',
  'settings.saved': '设置已保存！',
  'settings.language': '语言',
  'settings.langZh': '中文',
  'settings.langEn': 'English',

  // Debug
  'debug.title': '调试面板',
  'debug.desc': '测试原生功能。在 Android 上触发真实系统通知、声音和状态栏倒计时。Web 上回退到浏览器等价实现。',
  'debug.testSound': '测试音效',
  'debug.testSoundWork': '测试工作铃',
  'debug.testSoundRest': '测试休息铃',
  'debug.testSoundWorkDesc': '播放专注完成提示音',
  'debug.testSoundRestDesc': '播放休息完成提示音',
  'debug.testPopup': '测试弹窗',
  'debug.testPopupDesc': '系统通知弹窗 + 声音',
  'debug.countdown': '状态栏倒计时',
  'debug.countdownDesc': '10 秒通知栏实时倒计时',
  'debug.run': '运行',
  'debug.start': '开始 10 秒倒计时',
  'debug.stop': '停止',
  'debug.msg.sound': '提示音已播放 (C5→E5→G5)',
  'debug.msg.soundWork': '专注铃已播放',
  'debug.msg.soundRest': '休息铃已播放',
  'debug.msg.popup': '通知弹窗已发送',
  'debug.msg.countdown': '倒计时已启动 — 最小化 App 查看状态栏',
  'debug.msg.countdownDone': '倒计时完成 — 通知已触发！',
  'debug.msg.countdownCancel': '倒计时已取消',
  'debug.notif.countdownTitle': 'Flowtime 倒计时',
  'debug.notif.countdownBody': '秒后完成',

  // Days
  'unit.days': '天',
  'unit.minutes': '分钟',
  'unit.cups': '杯',
};

const en: Record<string, string> = {
  'app.hello': 'Hello,',
  'app.brand': 'Flowtime',

  'timer.readyFocus': 'Ready to Focus',
  'timer.working': 'Working',
  'timer.resting': 'Resting',
  'timer.focusTarget': 'Focus Target',
  'timer.focusPlaceholder': 'What are you working on?',
  'timer.startFocus': 'Start focus session',
  'timer.pause': 'Pause',
  'timer.resume': 'Resume',
  'timer.finish': 'Finish',
  'timer.checkoutDay': 'Check-out for the day',
  'timer.checkinFocus': 'Check-in Focus',
  'timer.recommended': 'Recommended',
  'timer.shortWalk': 'Short Walk',
  'timer.hydrate': 'Hydrate',
  'timer.deepBreathing': 'Deep Breathing',
  'timer.stretchLegs': 'Stretch your legs',
  'timer.drinkWater': 'Drink some water',
  'timer.breathingGuide': 'Guided breathing visualizer',
  'timer.skipRest': 'Skip Rest',
  'timer.endSession': 'End Session',
  'timer.workComplete': 'Focus Session Complete',
  'timer.restComplete': 'Rest Break Over',
  'timer.workCompleteBody': 'Time to take a break. Stretch, hydrate, or breathe.',
  'timer.restCompleteBody': 'Ready to start your next focus session.',
  'timer.timeLeft': 'Time Left',

  'history.title': "Today's Sessions",
  'history.totalFocus': 'Total focus time',
  'history.logSession': 'Log Session',
  'history.clearAll': 'Clear All',
  'history.streak': 'Current Streak',
  'history.efficiency': 'Efficiency',
  'history.totalRest': 'Total Rest',
  'history.timeline': 'Timeline',
  'history.empty': 'No focus sessions completed today yet.',
  'history.emptyHint': 'Your completed focus periods and rest breaks will line up here.',
  'history.delete': 'Delete',
  'history.deleteConfirm': 'Delete?',
  'history.focus': 'FOCUS',
  'history.rest': 'REST',
  'history.logModal.title': 'Log a Session',
  'history.logModal.type': 'Type',
  'history.logModal.focusSession': 'Focus Session',
  'history.logModal.restBreak': 'Rest Break',
  'history.logModal.titleLabel': 'Title',
  'history.logModal.focusPlaceholder': 'e.g., Coding core interface',
  'history.logModal.restPlaceholder': 'e.g., Short coffee break',
  'history.logModal.duration': 'Duration',
  'history.logModal.startTime': 'Start Time',
  'history.logModal.endTime': 'End Time',
  'history.logModal.save': 'Save Session Log',

  'breaks.title': 'Recharge Center',
  'breaks.subtitle': 'Take care of your mind and body during transitions and breaks.',
  'breaks.recharge': 'Recharge Activities',
  'breaks.outdoor': 'Outdoor/Short Walk',
  'breaks.outdoorDesc': 'Stretch your legs and get offline for 5 mins.',
  'breaks.guided': 'Guided Breathing',
  'breaks.guidedDesc': 'Regulate your nervous system with visuals.',
  'breaks.launch': 'Launch',
  'breaks.water': 'Liquid Hydration',
  'breaks.waterHydrated': 'Hydrated & Energized!',
  'breaks.waterSip': 'Keep sipping to prevent brain fatigue',
  'breaks.waterReduce': 'Reduce',
  'breaks.waterAdd': 'Add Cup',
  'breaks.deskWellness': 'Desk Wellness',
  'breaks.stretchTitle': '3-Minute Tension Release Stretches',
  'breaks.stretchReady': 'Ready to stretch?',
  'breaks.stretchActive': 'Stretch & breathe deeply...',
  'breaks.startStretch': 'Start Stretch',
  'breaks.pause': 'Pause',
  'breaks.currentMove': 'Current Move',
  'breaks.stretchComplete': 'Stretching complete! Feel refreshed?',

  'breathing.title': 'Box Breathing Guide',
  'breathing.inhale': 'Inhale slowly',
  'breathing.hold': 'Hold your breath',
  'breathing.exhale': 'Exhale gently',
  'breathing.rest': 'Hold emptiness',
  'breathing.complete': 'Mindfulness Session Completed',
  'breathing.return': 'Return',
  'breathing.footer': 'Adopt a comfortable upright posture. Box breathing relaxes the central nervous system, reducing tension and mental fatigue.',

  'settings.title': 'Settings',
  'settings.profile': 'User Profile',
  'settings.name': 'Your Name',
  'settings.namePlaceholder': 'Enter your name',
  'settings.nameHint': 'Personalizing your name sets a custom header and encourages zen focus states.',
  'settings.avatar': 'Select Avatar',
  'settings.rhythm': 'Rhythm Controls',
  'settings.workSession': 'Work Session',
  'settings.restBreak': 'Rest Break',
  'settings.automation': 'Automation',
  'settings.autoBreaks': 'Auto-start Breaks',
  'settings.autoBreaksDesc': 'Timer begins automatically when work ends',
  'settings.autoWork': 'Auto-start Work',
  'settings.autoWorkDesc': 'Session begins automatically when break ends',
  'settings.lunchSync': 'Lunch Break Sync',
  'settings.lunchBypass': 'Bypass during Lunch hour',
  'settings.lunchDesc': 'Schedule a longer pause that bypasses standard rest durations.',
  'settings.startTime': 'Start Time',
  'settings.endTime': 'End Time',
  'settings.save': 'Save Profile & Settings',
  'settings.saved': 'Profile and Settings saved successfully!',
  'settings.language': 'Language',
  'settings.langZh': '中文',
  'settings.langEn': 'English',

  'debug.title': 'Debug Panel',
  'debug.desc': 'Test native features. On Android, these trigger real system notifications, sounds, and status bar countdowns. On web, they fall back to browser equivalents.',
  'debug.testSoundWork': 'Test Work Ring',
  'debug.testSoundWorkDesc': 'Play focus-complete chime',
  'debug.testSoundRest': 'Test Rest Ring',
  'debug.testSoundRestDesc': 'Play rest-complete chime',
  'debug.testPopup': 'Test Popup',
  'debug.testPopupDesc': 'System notification with sound',
  'debug.countdown': 'Status Bar Countdown',
  'debug.countdownDesc': '10-second notification in status bar',
  'debug.run': 'RUN',
  'debug.start': 'Start 10s Countdown',
  'debug.stop': 'Stop',
  'debug.msg.soundWork': 'Work ring played',
  'debug.msg.soundRest': 'Rest ring played',
  'debug.msg.popup': 'Notification popup sent',
  'debug.msg.countdown': 'Countdown started — minimize app to see status bar',
  'debug.msg.countdownDone': 'Countdown complete — notification fired!',
  'debug.msg.countdownCancel': 'Countdown cancelled',
  'debug.notif.countdownTitle': 'Flowtime Countdown',
  'debug.notif.countdownBody': 's remaining',

  'unit.days': 'Days',
  'unit.minutes': 'minutes',
  'unit.cups': 'cups',
};

export function t(key: string): string {
  const map = _locale === 'zh' ? zh : en;
  return map[key] || key;
}
