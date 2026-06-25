/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Session, RhythmSettings, UserProfile, Activity } from './types';

export const AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAAGiEp8d1FFYsq0VrtYUBItRROl_sM6yxaEmGg99iorHIEF9FkLzkn4lHC5KMBnPNQzlPoxCbXIjjLZ3YAmNv_vkoldUITLzKPSky0nUq0ddL6uYWethIAy8xDQDfs4stOHGg7k0iNFaS41U_scGpSb8JyX8ddLFMS2j0cFDNh0T8PqBDF-HaiPd4R6UdT-NHR0ankx1z__PxmgdpnPIN6yV6YHTTXkA3Prl-hrsaBeAGDISLn0jR0pUwT5hDnHnj5bT5jyuRnVDYP',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDBeGP8UjzPq86frFr7LdivMkXD3wAsN99D1qY3pMY9iFU4kwGlEG22NSufLm-OpayLYWjGobvp2TJB4f7sWb1K66n41NNlYr7Jw0j9PP41q__RJW3TWt8T0RZzaaXMYYqA95Sp7ngMJIddigQoGVDcoxiipNcHw3kq-jhLyJYSWhVGWptrdaed2O_lFaiqz7hPUwsMhpxgb-h0A5LPiI1TPUDH7chQwno1JBTAJDVNxomOBJ_oNTPkuqjjn-WZQ2-ht_n9OnkItvj_',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC2_muq-T7PIUxFpV5VFmJ3INXxkbtj1TS5ZIuGandkZDOc3h1to8p0IxXI-318GKGWt5uplC9CvbP_YSD99nz1DW0D6bHEZoA6zqkF64kZReKXYp9wazLLPDYfvvFMz8VfD98IyYFKbDR8uPMb5EU8eNOaaD1rmvf4lnNt3M9BCuc2HTOPvWmD-rQByhwWng96_ySLMiLCQ3vKKKEIai1Sdr4neKV5rX9lX7W6o_HpdNAx7piE9V1XBZ2RSn5txTp9SlIfOqPYiznf',
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  avatarUrl: AVATARS[0],
  streak: 12,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export const DEFAULT_SETTINGS: RhythmSettings = {
  workDuration: 25,
  restDuration: 5,
  autoStartBreaks: true,
  autoStartWork: false,
  lunchBreakEnabled: true,
  lunchStartTime: '12:00',
  lunchEndTime: '13:00',
};

export const RECOMMENDED_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Short Walk',
    description: 'Stretch your legs & get moving',
    icon: 'Footprints',
    durationMinutes: 5,
    type: 'walk',
  },
  {
    id: 'act-2',
    title: 'Hydrate',
    description: 'Drink a glass of fresh water',
    icon: 'Droplet',
    durationMinutes: 2,
    type: 'hydrate',
  },
  {
    id: 'act-3',
    title: 'Deep Breathing',
    description: '2 minutes guided slow breathing',
    icon: 'Wind',
    durationMinutes: 2,
    type: 'breathe',
  },
  {
    id: 'act-4',
    title: 'Desk Stretch',
    description: 'Release shoulder & neck tension',
    icon: 'Accessibility',
    durationMinutes: 3,
    type: 'stretch',
  },
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-1',
    type: 'work',
    title: 'Deep Work: Design System',
    durationMinutes: 90,
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sess-2',
    type: 'rest',
    title: 'Coffee Break',
    durationMinutes: 15,
    startTime: '10:30 AM',
    endTime: '10:45 AM',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sess-3',
    type: 'work',
    title: 'Client Meeting Prep',
    durationMinutes: 90,
    startTime: '10:45 AM',
    endTime: '12:15 PM',
    date: new Date().toISOString().split('T')[0],
  },
];
