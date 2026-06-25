/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SessionType = 'work' | 'rest';

export interface Session {
  id: string;
  type: SessionType;
  title: string;
  durationMinutes: number;
  startTime: string; // ISO string or simple display time
  endTime: string;   // ISO string or simple display time
  date: string;      // YYYY-MM-DD
}

export interface RhythmSettings {
  workDuration: number; // in minutes
  restDuration: number; // in minutes
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  lunchBreakEnabled: boolean;
  lunchStartTime: string; // "HH:MM"
  lunchEndTime: string;   // "HH:MM"
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  streak: number;
  lastActiveDate?: string; // YYYY-MM-DD to calculate streak
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  durationMinutes: number;
  type: 'walk' | 'hydrate' | 'breathe' | 'stretch';
}
