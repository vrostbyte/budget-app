import { useState } from 'react';
import { parseMathExpression } from '../../utils/engine.js';
import { formatCurrency } from '../../utils/formatters.js';

/**
 * AmountInput — shows raw expression while focused, formatted currency on blur.
 * Parses math expressions (e.g. "1200 + 450 / 2") via parseMathExpression.
 * Shows red ring on parse failure.
 *
 * Props:
 *   value    {number}   — controlled numeric value
 *   onChange {fn}       — called with parsed number on valid blur
 *   className {string}  — extra classes
 */
export default function AmountInput({ value, onChange, className = '', placeholder = '0.00', ...props }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState('');
  const [hasError, setHasError] = useState(false);

  function handleFocus() {
    setFocused(true);
    setRaw(value != null && value !== 0 ? String(value) : '');
    setHasError(false);
  }

  function handleBlur() {
    setFocused(false);
    if (raw.trim() === '') {
      setHasError(false);
      onChange(0);
      return;
    }
    const parsed = parseMathExpression(raw);
    if (isNaN(parsed) || !isFinite(parsed)) {
      setHasError(true);
    } else {
      setHasError(false);
      const rounded = Math.round(parsed * 100) / 100;
      onChange(rounded);
      setRaw(String(rounded));
    }
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={focused ? raw : (value != null && value !== 0 ? formatCurrency(value) : '')}
      onChange={e => setRaw(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`card-neu-inset px-3 py-2 text-sm text-slate-100 bg-transparent
                 focus:outline-none focus:ring-2 transition-all
                 ${hasError
                   ? 'ring-2 ring-rose-400/60 focus:ring-rose-400/60'
                   : 'focus:ring-cyan-400/40'}
                 ${className}`}
    />
  );
}
