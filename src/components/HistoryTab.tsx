/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Flame, TrendingUp, Coffee, Clock, Plus, Trash2, Calendar, Check, X } from 'lucide-react';
import { Session, SessionType } from '../types';

interface HistoryTabProps {
  sessions: Session[];
  streak: number;
  onAddSession: (session: Omit<Session, 'id'>) => void;
  onClearHistory: () => void;
  onDeleteSession: (id: string) => void;
}

export default function HistoryTab({
  sessions,
  streak,
  onAddSession,
  onClearHistory,
  onDeleteSession,
}: HistoryTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newType, setNewType] = useState<SessionType>('work');
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(25);
  const [newStart, setNewStart] = useState('09:00 AM');
  const [newEnd, setNewEnd] = useState('09:25 AM');

  // Filter sessions for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === todayStr);

  // Calculate dynamic stats
  const totalFocusMinutes = todaySessions
    .filter(s => s.type === 'work')
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const totalRestMinutes = todaySessions
    .filter(s => s.type === 'rest')
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  // Format minutes into "Xh Ym"
  const formatMinutes = (mins: number) => {
    if (mins === 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Efficiency ratio: Focus time vs total time
  const efficiency = totalFocusMinutes > 0
    ? Math.round((totalFocusMinutes / (totalFocusMinutes + totalRestMinutes)) * 100)
    : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddSession({
      type: newType,
      title: newTitle,
      durationMinutes: Number(newDuration),
      startTime: newStart,
      endTime: newEnd,
      date: todayStr,
    });

    // Reset Form
    setNewTitle('');
    setNewDuration(25);
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 text-center md:text-left">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface">Today's Sessions</h2>
          <p className="font-sans text-sm md:text-base text-on-surface-variant">
            Total focus time: <span className="font-semibold text-primary">{formatMinutes(totalFocusMinutes)}</span>
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Session
          </button>
          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your session history?')) {
                  onClearHistory();
                }
              }}
              className="px-4 py-2 bg-error/10 text-error hover:bg-error/20 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden min-h-[104px]">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 fill-current text-primary" />
            <span className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">Current Streak</span>
          </div>
          <p className="font-display text-2xl font-bold text-on-surface">{streak} Days</p>
        </div>

        {/* Efficiency */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden min-h-[104px]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <span className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">Efficiency</span>
          </div>
          <p className="font-display text-2xl font-bold text-on-surface">
            {efficiency > 0 ? `${efficiency}%` : '--'}
          </p>
        </div>

        {/* Total Rest */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-soft flex flex-col justify-between relative overflow-hidden min-h-[104px]">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-tertiary" />
            <span className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">Total Rest</span>
          </div>
          <p className="font-display text-2xl font-bold text-on-surface">{formatMinutes(totalRestMinutes)}</p>
        </div>
      </section>

      {/* Timeline List */}
      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-1 border-b border-surface-container-high pb-2">Timeline</h3>
        
        {todaySessions.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-lowest rounded-xl shadow-soft flex flex-col items-center gap-3">
            <Clock className="w-8 h-8 text-on-surface-variant/30" />
            <p className="text-sm font-medium text-on-surface-variant">No focus sessions completed today yet.</p>
            <p className="text-xs text-on-surface-variant/60">Your completed focus periods and rest breaks will line up here.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 flex flex-col gap-6 before:absolute before:inset-y-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-surface-container-high">
            {todaySessions.map((session, idx) => {
              const isWork = session.type === 'work';
              return (
                <div key={session.id} className="relative flex items-start gap-4 group">
                  {/* Circle Indicator */}
                  <div 
                    className={`absolute -left-6 sm:-left-8 w-4.5 h-4.5 rounded-full border-4 border-background mt-1 transition-transform group-hover:scale-110 ${
                      isWork ? 'bg-primary' : 'bg-secondary'
                    }`}
                  />
                  
                  {/* Card Container */}
                  <div className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-soft flex-grow flex justify-between items-center transition-all duration-200 hover:bg-surface-container-low border border-transparent hover:border-surface-container-high">
                    <div className="flex flex-col gap-1 pr-4">
                      <span className="text-sm sm:text-base font-semibold text-on-surface leading-snug">
                        {session.title}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-on-surface-variant/60" />
                        {session.startTime} - {session.endTime} ({session.durationMinutes}m)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isWork ? (
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          FOCUS
                        </div>
                      ) : (
                        <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 tracking-wider">
                          <Coffee className="w-3.5 h-3.5" />
                          REST
                        </div>
                      )}

                      {/* Delete item button */}
                      {deleteConfirmId === session.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-error font-semibold">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteSession(session.id);
                              setDeleteConfirmId(null);
                            }}
                            className="p-1 text-error hover:bg-error/10 rounded-full transition-colors cursor-pointer"
                            title="Confirm delete"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 text-on-surface-variant/60 hover:text-on-surface rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                            title="Cancel delete"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(session.id)}
                          className="p-1.5 text-on-surface-variant/40 hover:text-error rounded-full hover:bg-error/5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Delete Session"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Manual Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-soft p-6 flex flex-col gap-6 animate-scale-up">
            <div className="flex justify-between items-center border-b border-surface-container pb-3">
              <h3 className="font-display text-lg font-bold text-on-surface">Log a Session</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-on-surface-variant/60 hover:text-on-surface rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              {/* Session Type */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">Type</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewType('work');
                      if (newTitle === 'Coffee Break') setNewTitle('Deep Work');
                    }}
                    className={`py-2 px-4 rounded-full text-xs font-semibold cursor-pointer border ${
                      newType === 'work' 
                        ? 'bg-primary text-on-primary border-primary' 
                        : 'bg-transparent text-on-surface-variant border-surface-container-high'
                    }`}
                  >
                    Focus Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewType('rest');
                      if (newTitle === 'Deep Work' || !newTitle) setNewTitle('Coffee Break');
                    }}
                    className={`py-2 px-4 rounded-full text-xs font-semibold cursor-pointer border ${
                      newType === 'rest' 
                        ? 'bg-secondary text-on-secondary border-secondary' 
                        : 'bg-transparent text-on-surface-variant border-surface-container-high'
                    }`}
                  >
                    Rest Break
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">Title</label>
                <input
                  type="text"
                  required
                  placeholder={newType === 'work' ? 'e.g., Coding core interface' : 'e.g., Short coffee break'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container px-4 py-2.5 rounded-full text-sm font-semibold border-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Duration Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium">
                  <span className="tracking-wider uppercase">Duration</span>
                  <span className="text-on-surface font-semibold">{newDuration} minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">Start Time</label>
                  <input
                    type="text"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full bg-surface-container px-4 py-2 rounded-full text-xs font-semibold border-none text-center"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">End Time</label>
                  <input
                    type="text"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    placeholder="09:25 AM"
                    className="w-full bg-surface-container px-4 py-2 rounded-full text-xs font-semibold border-none text-center"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-primary text-on-primary font-semibold py-3 rounded-full text-sm mt-2 active:scale-95 transition-all shadow-soft cursor-pointer"
              >
                Save Session Log
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
