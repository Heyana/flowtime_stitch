/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Settings, Shield, Bell, Check, Clock, Languages, Bug, Sun, Moon, Monitor } from 'lucide-react';
import { RhythmSettings, UserProfile } from '../types';
import { AVATARS } from '../data';
import { getLocale, setLocale, t, onLocaleChange, Locale } from '../i18n';
import { getTheme, setTheme, onThemeChange, Theme } from '../theme';

interface SettingsTabProps {
  settings: RhythmSettings;
  userProfile: UserProfile;
  onSaveSettings: (settings: RhythmSettings) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onOpenDebug: () => void;
}

export default function SettingsTab({ settings, userProfile, onSaveSettings, onSaveProfile, onOpenDebug }: SettingsTabProps) {
  const [workDuration, setWorkDuration] = useState(settings.workDuration);
  const [restDuration, setRestDuration] = useState(settings.restDuration);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartWork, setAutoStartWork] = useState(settings.autoStartWork);
  const [lunchBreakEnabled, setLunchBreakEnabled] = useState(settings.lunchBreakEnabled);
  const [lunchStartTime, setLunchStartTime] = useState(settings.lunchStartTime);
  const [lunchEndTime, setLunchEndTime] = useState(settings.lunchEndTime);
  const [name, setName] = useState(userProfile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatarUrl);
  const [toastMessage, setToastMessage] = useState('');
  const [locale, setLocalLocale] = useState<Locale>(getLocale());
  const [theme, setLocalTheme] = useState<Theme>(getTheme());

  useEffect(() => { return onLocaleChange(() => setLocalLocale(getLocale())); }, []);
  useEffect(() => { return onThemeChange(() => setLocalTheme(getTheme())); }, []);

  const handleSaveAll = () => {
    onSaveSettings({ workDuration, restDuration, autoStartBreaks, autoStartWork, lunchBreakEnabled, lunchStartTime, lunchEndTime });
    onSaveProfile({ ...userProfile, name, avatarUrl: selectedAvatar });
    setToastMessage(t('settings.saved'));
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in relative">
      {toastMessage && (
        <div className="fixed top-20 right-4 bg-secondary text-on-secondary py-3 px-6 rounded-full shadow-soft z-50 text-xs font-semibold flex items-center gap-2 animate-scale-up">
          <Check className="w-4 h-4" />{toastMessage}
        </div>
      )}

      <div className="flex justify-between items-center text-center md:text-left">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface">{t('settings.title')}</h2>
      </div>

      {/* Profile */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">{t('settings.profile')}</h3>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center">
          <div className="flex flex-col items-center gap-2">
            <img src={selectedAvatar} alt={t('tooltip.avatarPreview')} className="w-18 h-18 rounded-full object-cover border-4 border-primary/10 shadow-soft" referrerPolicy="no-referrer" />
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{t('settings.avatar')}</span>
            <div className="flex gap-2.5 mt-1">
              {AVATARS.map((av, idx) => (
                <button key={idx} type="button" onClick={() => setSelectedAvatar(av)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${selectedAvatar === av ? 'border-primary scale-110 shadow-soft' : 'border-transparent opacity-70 hover:opacity-100'}`}
                ><img src={av} alt={`${t('tooltip.avatarOption')} ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" /></button>
              ))}
            </div>
          </div>
          <div className="flex-grow w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">{t('settings.name')}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('settings.namePlaceholder')}
                className="w-full bg-surface-container px-5 py-3 rounded-full text-sm font-semibold border-none focus:outline-none focus:ring-1 focus:ring-primary/20 text-on-surface"
              />
            </div>
            <p className="text-xs text-on-surface-variant/60">{t('settings.nameHint')}</p>
          </div>
        </div>
      </section>

      {/* Rhythm */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">{t('settings.rhythm')}</h2>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm font-semibold text-on-surface">
              <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />{t('settings.workSession')}
              </label>
              <span className="font-medium text-on-surface">{workDuration} min</span>
            </div>
            <input type="range" min="15" max="90" step="5" value={workDuration} onChange={(e) => setWorkDuration(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm font-semibold text-on-surface">
              <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" />{t('settings.restBreak')}
              </label>
              <span className="font-medium text-on-surface">{restDuration} min</span>
            </div>
            <input type="range" min="5" max="30" step="1" value={restDuration} onChange={(e) => setRestDuration(Number(e.target.value))} className="w-full accent-secondary cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Automation */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">{t('settings.automation')}</h2>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 md:p-8 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-on-surface" id="toggle-auto-breaks-label">{t('settings.autoBreaks')}</span>
              <span className="text-xs text-on-surface-variant">{t('settings.autoBreaksDesc')}</span>
            </div>
            <button type="button" role="switch" aria-checked={autoStartBreaks} aria-labelledby="toggle-auto-breaks-label"
              onClick={() => setAutoStartBreaks(!autoStartBreaks)}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${autoStartBreaks ? 'bg-primary' : 'bg-surface-container-high'}`}
            ><div className={`bg-white w-5 h-5 rounded-full shadow-soft transition-transform duration-200 transform ${autoStartBreaks ? 'translate-x-6' : 'translate-x-0'}`} /></button>
          </div>
          <div className="w-full h-px bg-surface-container" />
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-on-surface" id="toggle-auto-work-label">{t('settings.autoWork')}</span>
              <span className="text-xs text-on-surface-variant">{t('settings.autoWorkDesc')}</span>
            </div>
            <button type="button" role="switch" aria-checked={autoStartWork} aria-labelledby="toggle-auto-work-label"
              onClick={() => setAutoStartWork(!autoStartWork)}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${autoStartWork ? 'bg-primary' : 'bg-surface-container-high'}`}
            ><div className={`bg-white w-5 h-5 rounded-full shadow-soft transition-transform duration-200 transform ${autoStartWork ? 'translate-x-6' : 'translate-x-0'}`} /></button>
          </div>
        </div>
      </section>

      {/* Lunch Break */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">{t('settings.lunchSync')}</h2>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface" id="toggle-lunch-label">{t('settings.lunchBypass')}</span>
              <p className="text-xs text-on-surface-variant mt-0.5">{t('settings.lunchDesc')}</p>
            </div>
            <button type="button" role="switch" aria-checked={lunchBreakEnabled} aria-labelledby="toggle-lunch-label"
              onClick={() => setLunchBreakEnabled(!lunchBreakEnabled)}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${lunchBreakEnabled ? 'bg-primary' : 'bg-surface-container-high'}`}
            ><div className={`bg-white w-5 h-5 rounded-full shadow-soft transition-transform duration-200 transform ${lunchBreakEnabled ? 'translate-x-6' : 'translate-x-0'}`} /></button>
          </div>
          {lunchBreakEnabled && (
            <div className="grid grid-cols-2 gap-4 mt-2 animate-scale-up">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-on-surface-variant font-medium px-2">{t('settings.startTime')}</label>
                <div className="bg-surface-container-low px-4 py-2.5 rounded-full flex items-center justify-between">
                  <input type="time" value={lunchStartTime} onChange={(e) => setLunchStartTime(e.target.value)}
                    className="bg-transparent border-none text-on-surface text-sm font-semibold focus:ring-0 p-0 w-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-on-surface-variant font-medium px-2">{t('settings.endTime')}</label>
                <div className="bg-surface-container-low px-4 py-2.5 rounded-full flex items-center justify-between">
                  <input type="time" value={lunchEndTime} onChange={(e) => setLunchEndTime(e.target.value)}
                    className="bg-transparent border-none text-on-surface text-sm font-semibold focus:ring-0 p-0 w-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Language */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">{t('settings.language')}</h2>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setLocale('zh')}
              className={`py-3 px-4 rounded-full text-sm font-semibold cursor-pointer border transition-all ${locale === 'zh' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-surface-container-high hover:border-primary/30'}`}
            >{t('settings.langZh')}</button>
            <button type="button" onClick={() => setLocale('en')}
              className={`py-3 px-4 rounded-full text-sm font-semibold cursor-pointer border transition-all ${locale === 'en' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-surface-container-high hover:border-primary/30'}`}
            >{t('settings.langEn')}</button>
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">Theme</h2>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-3 gap-3">
            <button type="button" onClick={() => setTheme('system')}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                theme === 'system' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-surface-container-high hover:border-primary/30'
              }`}
            >
              <Monitor className="w-4 h-4" />System
            </button>
            <button type="button" onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                theme === 'light' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-surface-container-high hover:border-primary/30'
              }`}
            >
              <Sun className="w-4 h-4" />Light
            </button>
            <button type="button" onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                theme === 'dark' ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-on-surface-variant border-surface-container-high hover:border-primary/30'
              }`}
            >
              <Moon className="w-4 h-4" />Dark
            </button>
          </div>
        </div>
      </section>

      {/* Debug Panel — developer tooling, kept out of main navigation */}
      <section className="pt-4 border-t border-surface-container">
        <button onClick={onOpenDebug}
          className="w-full flex items-center gap-3 bg-surface-container-lowest hover:bg-surface-container-low shadow-soft rounded-xl p-5 text-left transition-all cursor-pointer border border-transparent hover:border-surface-container-high"
        >
          <div className="p-2 rounded-full bg-tertiary/10 text-tertiary">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-on-surface">{t('debug.title')}</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">{t('debug.desc')}</p>
          </div>
        </button>
      </section>

      <div className="mt-4 flex justify-center">
        <button onClick={handleSaveAll}
          className="bg-primary text-on-primary font-semibold px-12 py-4 rounded-full shadow-lifted hover:opacity-95 transition-all duration-200 active:scale-95 text-sm w-full md:w-auto text-center cursor-pointer"
        >{t('settings.save')}</button>
      </div>
    </div>
  );
}
