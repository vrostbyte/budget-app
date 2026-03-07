import { formatCurrency } from '../../utils/formatters.js';

/**
 * Renders a dollar amount with color coding matching the legacy app:
 *   > $100  → emerald-400 (green)
 *   $0–$100 → amber-400   (warning)
 *   < $0    → rose-400    (red)
 */
export default function ColorBalance({ value, className = '', large = false }) {
  const colorClass =
    value > 100 ? 'text-emerald-400' :
    value > 0   ? 'text-amber-400'   :
                  'text-rose-400';

  const sizeClass = large
    ? 'text-4xl font-bold tracking-tight tabular-nums'
    : 'font-semibold tabular-nums';

  return (
    <span className={`${colorClass} ${sizeClass} ${className}`}>
      {formatCurrency(value)}
    </span>
  );
}
