/**
 * DebugTab — native feature test panel
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Bug, Volume2, Bell, Timer } from 'lucide-react';
import { playWorkChime, playRestChime } from '../capacitor-native';
import { t } from '../i18n';

async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

async function showTestNotification(): Promise<void> {
  if (await isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.requestPermissions();
      await LocalNotifications.schedule({
        notifications: [{
          id: 9998,
          title: 'Flowtime Debug',
          body: 'This is a test notification popup!',
          schedule: { at: new Date(Date.now() + 200) },
        }],
      });
    } catch (e) {
      console.error('[Debug] Notification failed:', e);
    }
  } else {
    playWorkChime();
    alert('Web mode: Notification would appear here.\n\nOn Android, this shows a system notification with sound.');
  }
}

export default function DebugTab() {
  const [testResult, setTestResult] = useState('');
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(10);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!countdownActive) return;
    const tick = () => {
      setCountdownLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setCountdownActive(false);
          triggerCountdownComplete();
          return 0;
        }
        updateCountdownNotification(next);
        return next;
      });
    };
    countdownRef.current = setInterval(tick, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [countdownActive]);

  const startCountdown = async () => {
    setCountdownLeft(10);
    setCountdownActive(true);
    setTestResult(t('debug.msg.countdown'));
    if (await isNative()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.requestPermissions();
        await LocalNotifications.schedule({
          notifications: [{
            id: 9999,
            title: t('debug.notif.countdownTitle'),
            body: `10${t('debug.notif.countdownBody')}`,
            ongoing: true,
            schedule: { at: new Date(Date.now() + 100) },
          }],
        });
      } catch { /* ignore */ }
    }
  };

  const updateCountdownNotification = async (remaining: number) => {
    if (!(await isNative())) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
      await LocalNotifications.schedule({
        notifications: [{
          id: 9999,
          title: t('debug.notif.countdownTitle'),
          body: `${remaining}${t('debug.notif.countdownBody')}`,
          ongoing: true,
          schedule: { at: new Date(Date.now() + 200) },
        }],
      });
    } catch { /* ignore */ }
  };

  const triggerCountdownComplete = async () => {
    setTestResult(t('debug.msg.countdownDone'));
    playWorkChime();
    if (await isNative()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
        await LocalNotifications.schedule({
          notifications: [{
            id: 9990,
            title: 'Flowtime',
            body: 'Countdown finished! Time to focus.',
            schedule: { at: new Date(Date.now() + 100) },
          }],
        });
      } catch { /* ignore */ }
    }
  };

  const handleStopCountdown = async () => {
    setCountdownActive(false);
    setCountdownLeft(10);
    setTestResult(t('debug.msg.countdownCancel'));
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (await isNative()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
      } catch { /* ignore */ }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 py-4 animate-fade-in">
      <div className="flex items-center gap-2 px-1">
        <Bug className="w-5 h-5 text-tertiary" />
        <h2 className="font-display text-2xl font-bold text-on-surface">{t('debug.title')}</h2>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">{t('debug.desc')}</p>

      <div className="grid grid-cols-1 gap-3">
        {/* Test Work Ring */}
        <button
          onClick={() => { playWorkChime(); setTestResult(t('debug.msg.soundWork')); }}
          className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-primary/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Volume2 className="w-5 h-5" /></div>
          <div className="text-left flex-grow">
            <h4 className="text-sm font-semibold text-on-surface">{t('debug.testSoundWork')}</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">{t('debug.testSoundWorkDesc')}</p>
          </div>
          <span className="text-[10px] text-primary font-bold tracking-wider uppercase bg-primary/5 px-2 py-1 rounded-full">{t('debug.run')}</span>
        </button>

        {/* Test Rest Ring */}
        <button
          onClick={() => { playRestChime(); setTestResult(t('debug.msg.soundRest')); }}
          className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-secondary/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary"><Volume2 className="w-5 h-5" /></div>
          <div className="text-left flex-grow">
            <h4 className="text-sm font-semibold text-on-surface">{t('debug.testSoundRest')}</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">{t('debug.testSoundRestDesc')}</p>
          </div>
          <span className="text-[10px] text-secondary font-bold tracking-wider uppercase bg-secondary/5 px-2 py-1 rounded-full">{t('debug.run')}</span>
        </button>

        {/* Test Popup */}
        <button
          onClick={async () => { await showTestNotification(); setTestResult(t('debug.msg.popup')); }}
          className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-secondary/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary"><Bell className="w-5 h-5" /></div>
          <div className="text-left flex-grow">
            <h4 className="text-sm font-semibold text-on-surface">{t('debug.testPopup')}</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">{t('debug.testPopupDesc')}</p>
          </div>
          <span className="text-[10px] text-secondary font-bold tracking-wider uppercase bg-secondary/5 px-2 py-1 rounded-full">{t('debug.run')}</span>
        </button>

        {/* Status Bar Countdown */}
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex flex-col gap-3 border border-transparent hover:border-primary/10 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0"><Timer className="w-5 h-5" /></div>
            <div className="text-left flex-grow">
              <h4 className="text-sm font-semibold text-on-surface">{t('debug.countdown')}</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">{t('debug.countdownDesc')}</p>
            </div>
          </div>
          {countdownActive ? (
            <div className="flex items-center gap-3">
              <div className="flex-grow bg-surface-container rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-1000 ease-linear rounded-full" style={{ width: `${(countdownLeft / 10) * 100}%` }} />
              </div>
              <span className="font-mono text-sm font-bold text-primary tabular-nums min-w-[2ch]">{countdownLeft}s</span>
              <button onClick={handleStopCountdown} className="px-3 py-1.5 bg-error/10 text-error rounded-full text-xs font-semibold active:scale-95 transition-all cursor-pointer">{t('debug.stop')}</button>
            </div>
          ) : (
            <button onClick={startCountdown} className="w-full bg-primary/10 text-primary rounded-full py-2.5 text-xs font-semibold hover:bg-primary/20 active:scale-[0.98] transition-all cursor-pointer">{t('debug.start')}</button>
          )}
        </div>
      </div>

      {testResult && (
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-4 border border-surface-container-high">
          <p className="text-xs text-on-surface-variant font-mono">{testResult}</p>
        </div>
      )}
    </div>
  );
}
