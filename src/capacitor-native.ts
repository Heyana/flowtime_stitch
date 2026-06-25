/**
 * Capacitor Native Bridge
 *
 * Wraps Capacitor plugin calls with web fallbacks.
 * On web: uses Web Audio / browser APIs as before.
 * On mobile (Capacitor): uses system notifications, haptics, background tracking.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

// ---------------------------------------------------------------------------
// Capacitor availability check
// ---------------------------------------------------------------------------

let _capChecked = false;
let _capAvailable = false;

async function isCapacitorAvailable(): Promise<boolean> {
  if (_capChecked) return _capAvailable;
  try {
    const { Capacitor } = await import('@capacitor/core');
    _capAvailable = Capacitor.isNativePlatform();
  } catch {
    _capAvailable = false;
  }
  _capChecked = true;
  return _capAvailable;
}

// ---------------------------------------------------------------------------
// Timer foreground notification (prevents Android from killing the app)
// ---------------------------------------------------------------------------

const TIMER_NOTIF_ID = 7777;
let _timerNotifInterval: ReturnType<typeof setInterval> | null = null;

function formatTimerText(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function countdownBar(filled: number, total: number): string {
  const ratio = Math.max(0, Math.min(1, filled / total));
  const barLen = 12;
  const filledLen = Math.round(barLen * ratio);
  return '█'.repeat(filledLen) + '░'.repeat(barLen - filledLen);
}

let _foregroundServiceReady = false;

async function ensureForegroundServiceChannel(): Promise<void> {
  if (_foregroundServiceReady) return;
  if (!(await isCapacitorAvailable())) return;
  try {
    const { ForegroundService, Importance } = await import('@capawesome-team/capacitor-android-foreground-service');
    await ForegroundService.createNotificationChannel({
      id: 'flowtime_timer',
      name: 'Flowtime Timer',
      description: 'Persistent countdown while timer is active',
      importance: Importance.Low,
    });
    _foregroundServiceReady = true;
  } catch (e) { console.error('[Flowtime] Channel creation failed:', e); }
}

export async function startTimerNotification(timeLeft: number, mode: 'focus' | 'rest'): Promise<void> {
  if (!(await isCapacitorAvailable())) return;
  stopTimerNotification();
  try {
    await ensureForegroundServiceChannel();
    const { ForegroundService } = await import('@capawesome-team/capacitor-android-foreground-service');
    const title = mode === 'focus' ? '🔴 专注中' : '🟢 休息中';
    const body = `${formatTimerText(timeLeft)}\n${countdownBar(timeLeft, timeLeft)}`;
    await ForegroundService.startForegroundService({
      id: TIMER_NOTIF_ID, title, body, smallIcon: 'ic_stat_flowtime', silent: true, notificationChannelId: 'flowtime_timer',
    });
    const total = timeLeft;
    let remaining = timeLeft;
    _timerNotifInterval = setInterval(async () => {
      remaining -= 3;
      if (remaining <= 0) return;
      try {
        const bar = countdownBar(remaining, total);
        const { ForegroundService: FS } = await import('@capawesome-team/capacitor-android-foreground-service');
        await FS.updateForegroundService({
          id: TIMER_NOTIF_ID, title, body: `${formatTimerText(remaining)}\n${bar}`, smallIcon: 'ic_stat_flowtime', silent: true, notificationChannelId: 'flowtime_timer',
        });
      } catch { /* ignore */ }
    }, 3000);
  } catch (e) { console.error('[Flowtime] Foreground service start failed:', e); }
}

export async function pauseTimerNotification(timeLeft: number, mode: 'focus' | 'rest'): Promise<void> {
  if (!(await isCapacitorAvailable())) return;
  stopTimerNotification();
  try {
    await ensureForegroundServiceChannel();
    const { ForegroundService } = await import('@capawesome-team/capacitor-android-foreground-service');
    const title = mode === 'focus' ? '⏸ 专注已暂停' : '⏸ 休息已暂停';
    await ForegroundService.startForegroundService({
      id: TIMER_NOTIF_ID, title, body: formatTimerText(timeLeft), smallIcon: 'ic_stat_flowtime', silent: true, notificationChannelId: 'flowtime_timer',
    });
  } catch { /* ignore */ }
}

export async function stopTimerNotification(): Promise<void> {
  if (_timerNotifInterval) { clearInterval(_timerNotifInterval); _timerNotifInterval = null; }
  if (!(await isCapacitorAvailable())) return;
  try { const { ForegroundService } = await import('@capawesome-team/capacitor-android-foreground-service'); await ForegroundService.stopForegroundService(); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Web Audio — two distinct chimes
// ---------------------------------------------------------------------------

/** Focus-complete chime: ascending C5→E5→G5 (bright, energetic) */
export function playWorkChime(): void {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);      // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);  // G5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.log('[Flowtime] Web Audio work chime failed:', e);
  }
}

/** Rest-complete chime: descending G4→E4→C4 (soft, calming) */
export function playRestChime(): void {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(392.00, ctx.currentTime);      // G4
    osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.2); // E4
    osc.frequency.setValueAtTime(261.63, ctx.currentTime + 0.4); // C4
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.log('[Flowtime] Web Audio rest chime failed:', e);
  }
}

// ---------------------------------------------------------------------------
// Local Notifications (ring + popup)
// ---------------------------------------------------------------------------

export async function notifyTimerComplete(mode: 'focus' | 'rest'): Promise<void> {
  if (await isCapacitorAvailable()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== 'granted') {
        console.warn('[Flowtime] Notification permission denied, falling back to web audio');
        mode === 'focus' ? playWorkChime() : playRestChime();
        return;
      }

      const title = mode === 'focus' ? 'Focus Session Complete' : 'Rest Break Over';
      const body = mode === 'focus'
        ? 'Time to take a break. Stretch, hydrate, or breathe.'
        : 'Ready to start your next focus session.';

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            sound: mode === 'focus' ? 'focus_end.wav' : 'rest_end.wav',
            smallIcon: 'ic_stat_flowtime',
            iconColor: mode === 'focus' ? '#b3272e' : '#006d3e',
            schedule: { at: new Date(Date.now() + 100) },
          },
        ],
      });
    } catch (e) {
      console.error('[Flowtime] LocalNotifications failed:', e);
      mode === 'focus' ? playWorkChime() : playRestChime();
    }
  } else {
    mode === 'focus' ? playWorkChime() : playRestChime();
  }
}

// ---------------------------------------------------------------------------
// Haptics
// ---------------------------------------------------------------------------

export async function hapticLight(): Promise<void> {
  if (!(await isCapacitorAvailable())) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // silently ignore
  }
}

export async function hapticHeavy(): Promise<void> {
  if (!(await isCapacitorAvailable())) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {
    // silently ignore
  }
}

// ---------------------------------------------------------------------------
// Background time tracking
// ---------------------------------------------------------------------------

const BG_KEY = 'flowtime_bg_checkpoint';

export interface BackgroundCheckpoint {
  timestamp: number;
  timeLeft: number;
  totalDuration: number;
  timerMode: 'work' | 'rest';
  timerState: 'running' | 'paused' | 'idle';
}

export function saveBackgroundCheckpoint(checkpoint: BackgroundCheckpoint): void {
  localStorage.setItem(BG_KEY, JSON.stringify(checkpoint));
}

export function loadBackgroundCheckpoint(): BackgroundCheckpoint | null {
  const raw = localStorage.getItem(BG_KEY);
  if (!raw) return null;
  localStorage.removeItem(BG_KEY);
  try {
    return JSON.parse(raw) as BackgroundCheckpoint;
  } catch {
    return null;
  }
}

export function calculateAdjustedTimeLeft(checkpoint: BackgroundCheckpoint): number {
  const now = Date.now();
  const elapsedMs = now - checkpoint.timestamp;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  return Math.max(0, checkpoint.timeLeft - elapsedSeconds);
}

// ---------------------------------------------------------------------------
// App state listener
// ---------------------------------------------------------------------------

type BackgroundResumeCallback = (adjustedTimeLeft: number) => void;

export async function setupBackgroundListener(
  onResume: BackgroundResumeCallback,
): Promise<() => void> {
  if (!(await isCapacitorAvailable())) return () => {};

  try {
    const { App } = await import('@capacitor/app');

    const listener = await App.addListener('appStateChange', (state: { isActive: boolean }) => {
      if (state.isActive) {
        const checkpoint = loadBackgroundCheckpoint();
        if (checkpoint && checkpoint.timerState === 'running') {
          const adjusted = calculateAdjustedTimeLeft(checkpoint);
          onResume(adjusted);
        }
      }
    });

    return () => {
      (listener as any).remove?.();
    };
  } catch {
    return () => {};
  }
}
