/**
 * Confirm/Alert Modal — replaces native confirm() & alert().
 * Matches the Liquid Round design system.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={onCancel}>
      <div
        className="bg-surface-container-lowest w-full max-w-sm rounded-xl shadow-lifted flex flex-col gap-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${isDanger ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="font-display text-lg font-bold text-on-surface">{title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-on-surface-variant/60 hover:text-on-surface rounded-full hover:bg-surface-container transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-full font-semibold text-sm transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-colors cursor-pointer ${
              isDanger
                ? 'bg-error text-on-error hover:opacity-90'
                : 'bg-primary text-on-primary hover:opacity-90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
