'use client';

import { useState } from 'react';

export type ModalMode = 'voluntary' | 'soft' | 'hard';

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
  hard: {
    title: "okay you've really gone to town",
    body: "you've hit the daily limit. i respect the dedication, genuinely. but the wall is real this time — it resets in 24 hours. if you want to keep going RIGHT now, you can support the cause and get unlimited generations for 30 days. please? 🥺",
  },
};

export default function DonationModal({ mode, onClose, onBypass }: DonationModalProps) {
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl relative">
        {mode !== 'hard' && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[#999] hover:text-[#333] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        )}

        <h2 className="text-base font-bold text-[#191919] mb-2">{copy.title}</h2>
        <p className="text-sm text-[#555] mb-4 leading-relaxed">{copy.body}</p>

        <div className="mb-4">
          <label htmlFor="donation-amount" className="text-xs text-[#666] block mb-1.5">How much?</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#333]">$</span>
            <input
              id="donation-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-[#E0DFDC] rounded px-2 py-1.5 text-sm w-20 focus:outline-none focus:border-[#0A66C2]"
            />
            {amount === '1' && (
              <span className="text-xs text-[#999]">(I get 67¢ of that)</span>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 mb-3">{error}</p>
        )}

        <button
          onClick={handleSupport}
          disabled={loading}
          className="w-full bg-[#0A66C2] text-white rounded-full py-2 text-sm font-semibold hover:bg-[#004182] transition-colors disabled:opacity-50 mb-2"
        >
          {loading ? 'Redirecting to Stripe...' : 'Support me'}
        </button>

        {mode === 'soft' && onBypass && (
          <button
            onClick={onBypass}
            className="w-full text-[#666] text-xs py-1.5 hover:text-[#333] transition-colors"
          >
            I&apos;m broke too, let me through
          </button>
        )}

        {mode === 'hard' && (
          <button
            onClick={onClose}
            className="w-full text-[#666] text-xs py-1.5 hover:text-[#333] transition-colors"
          >
            okay fine :(
          </button>
        )}
      </div>
    </div>
  );
}
