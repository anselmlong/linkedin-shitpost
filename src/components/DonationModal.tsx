'use client';

import { useEffect, useRef, useState } from 'react';

export type ModalMode = 'voluntary' | 'soft';

interface DonationModalProps {
  mode: ModalMode;
  onClose: () => void;
  onBypass?: () => void;
}

const COPY: Record<ModalMode, { title: string; body: string }> = {
  voluntary: {
    title: 'Buy me a coffee',
    body: 'API costs money... would appreciate buying me a coffee if this made you laugh 🙏',
  },
  soft: {
    title: 'hey, real quick',
    body: "okay so you've used this a few times now. look — i'm a broke college student and these AI API calls genuinely cost money. i'm not asking for much. even $1 helps keep this running. please? 🥺",
  },
};

export default function DonationModal({ mode, onClose, onBypass }: DonationModalProps) {
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus the amount field on open, close on Escape, keep Tab inside, and hand focus back on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    amountRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  const handleSupport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.max(1, parseFloat(amount) || 1) }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Something went wrong. Try again.');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  const copy = COPY[mode];

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-title"
        aria-describedby="donation-body"
        className="bg-white rounded-lg max-w-sm w-full p-6 shadow-[0_4px_16px_rgba(0,0,0,0.15)] relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full text-li-muted hover:bg-li-canvas hover:text-li-text transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <h2 id="donation-title" className="text-base font-semibold text-li-text mb-2 pr-8">{copy.title}</h2>
        <p id="donation-body" className="text-sm text-li-muted mb-4 leading-relaxed">{copy.body}</p>

        <div className="mb-4">
          <label htmlFor="donation-amount" className="text-xs text-li-muted block mb-1.5">How much?</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-li-text">$</span>
            <input
              ref={amountRef}
              id="donation-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              className="border border-li-border-strong rounded px-2 py-1.5 text-sm text-li-text w-20 focus:outline-none focus:border-li-blue focus:ring-2 focus:ring-li-blue/30"
            />
            {amount === '1' && (
              <span className="text-xs text-li-muted">(I get 67¢ of that)</span>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-li-danger mb-3">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSupport}
          disabled={loading}
          className="w-full min-h-10 bg-li-blue text-white rounded-full py-2 text-sm font-semibold hover:bg-li-blue-dark transition-colors disabled:bg-li-border-strong disabled:cursor-wait mb-2"
        >
          {loading ? 'Redirecting to Stripe...' : 'Support me'}
        </button>

        {mode === 'soft' && onBypass && (
          <button
            type="button"
            onClick={onBypass}
            className="w-full min-h-10 rounded-full text-li-muted text-xs font-semibold hover:bg-li-canvas hover:text-li-text transition-colors"
          >
            I&apos;m broke too, let me through
          </button>
        )}
      </div>
    </div>
  );
}
