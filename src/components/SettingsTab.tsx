/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User, Settings, Shield, Bell, Check, Clock } from 'lucide-react';
import { RhythmSettings, UserProfile } from '../types';
import { AVATARS } from '../data';

interface SettingsTabProps {
  settings: RhythmSettings;
  userProfile: UserProfile;
  onSaveSettings: (settings: RhythmSettings) => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export default function SettingsTab({
  settings,
  userProfile,
  onSaveSettings,
  onSaveProfile,
}: SettingsTabProps) {
  // Temporary component states
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

  const handleSaveAll = () => {
    onSaveSettings({
      workDuration,
      restDuration,
      autoStartBreaks,
      autoStartWork,
      lunchBreakEnabled,
      lunchStartTime,
      lunchEndTime,
    });

    onSaveProfile({
      ...userProfile,
      name,
      avatarUrl: selectedAvatar,
    });

    setToastMessage('Profile and Settings saved successfully!');
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in relative">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 bg-secondary text-on-secondary py-3 px-6 rounded-full shadow-soft z-50 text-xs font-semibold flex items-center gap-2 animate-scale-up">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center text-center md:text-left">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface">Settings</h2>
      </div>

      {/* Profile Section */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">User Profile</h3>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center">
          {/* Avatar selector */}
          <div className="flex flex-col items-center gap-2">
            <img 
              src={selectedAvatar} 
              alt="Avatar preview" 
              className="w-18 h-18 rounded-full object-cover border-4 border-primary/10 shadow-soft"
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Select Avatar</span>
            <div className="flex gap-2.5 mt-1">
              {AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedAvatar === av ? 'border-primary scale-110 shadow-soft' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Name inputs */}
          <div className="flex-grow w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-surface-container px-5 py-3 rounded-full text-sm font-semibold border-none focus:outline-none focus:ring-1 focus:ring-primary/20 text-on-surface"
              />
            </div>
            <p className="text-xs text-on-surface-variant/60">
              Personalizing your name sets a custom header and encourages zen focus states.
            </p>
          </div>
        </div>
      </section>

      {/* Rhythm Controls */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">Rhythm Controls</h2>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 md:p-8 flex flex-col gap-6">
          
          {/* Work duration slider */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm font-semibold text-on-surface">
              <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                Work Session
              </label>
              <span className="font-medium text-on-surface">{workDuration} min</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="5"
              value={workDuration}
              onChange={(e) => setWorkDuration(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Rest duration slider */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm font-semibold text-on-surface">
              <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" />
                Rest Break
              </label>
              <span className="font-medium text-on-surface">{restDuration} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={restDuration}
              onChange={(e) => setRestDuration(Number(e.target.value))}
              className="w-full accent-secondary cursor-pointer"
            />
          </div>

        </div>
      </section>

      {/* Automation */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">Automation</h2>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 md:p-8 flex flex-col gap-5">
          {/* Toggle 1 */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-on-surface" id="toggle-auto-breaks-label">Auto-start Breaks</span>
              <span className="text-xs text-on-surface-variant">Timer begins automatically when work ends</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoStartBreaks}
              aria-labelledby="toggle-auto-breaks-label"
              onClick={() => setAutoStartBreaks(!autoStartBreaks)}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
                autoStartBreaks ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <div 
                className={`bg-white w-5 h-5 rounded-full shadow-soft transition-transform duration-200 transform ${
                  autoStartBreaks ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="w-full h-px bg-surface-container" />

          {/* Toggle 2 */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-on-surface" id="toggle-auto-work-label">Auto-start Work</span>
              <span className="text-xs text-on-surface-variant">Session begins automatically when break ends</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoStartWork}
              aria-labelledby="toggle-auto-work-label"
              onClick={() => setAutoStartWork(!autoStartWork)}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
                autoStartWork ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <div 
                className={`bg-white w-5 h-5 rounded-full shadow-soft transition-transform duration-200 transform ${
                  autoStartWork ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Lunch Break Sync */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-2">Lunch Break Sync</h2>
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface" id="toggle-lunch-label">Bypass during Lunch hour</span>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Schedule a longer pause that bypasses standard rest durations.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={lunchBreakEnabled}
              aria-labelledby="toggle-lunch-label"
              onClick={() => setLunchBreakEnabled(!lunchBreakEnabled)}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
                lunchBreakEnabled ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <div 
                className={`bg-white w-5 h-5 rounded-full shadow-soft transition-transform duration-200 transform ${
                  lunchBreakEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {lunchBreakEnabled && (
            <div className="grid grid-cols-2 gap-4 mt-2 animate-scale-up">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-on-surface-variant font-medium px-2">Start Time</label>
                <div className="bg-surface-container-low px-4 py-2.5 rounded-full flex items-center justify-between">
                  <input
                    type="time"
                    value={lunchStartTime}
                    onChange={(e) => setLunchStartTime(e.target.value)}
                    className="bg-transparent border-none text-on-surface text-sm font-semibold focus:ring-0 p-0 w-full"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-on-surface-variant font-medium px-2">End Time</label>
                <div className="bg-surface-container-low px-4 py-2.5 rounded-full flex items-center justify-between">
                  <input
                    type="time"
                    value={lunchEndTime}
                    onChange={(e) => setLunchEndTime(e.target.value)}
                    className="bg-transparent border-none text-on-surface text-sm font-semibold focus:ring-0 p-0 w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Save Profile & Settings */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleSaveAll}
          className="bg-primary text-on-primary font-semibold px-12 py-4 rounded-full shadow-lifted hover:opacity-95 transition-all duration-200 active:scale-95 text-sm w-full md:w-auto text-center cursor-pointer"
        >
          Save Profile & Settings
        </button>
      </div>
    </div>
  );
}
