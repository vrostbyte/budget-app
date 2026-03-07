import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog — styled modal replacing window.confirm().
 *
 * Props:
 *   open         {boolean}  — controlled open state
 *   message      {string}   — confirmation message
 *   confirmLabel {string}   — confirm button text (default "Confirm")
 *   cancelLabel  {string}   — cancel button text (default "Cancel")
 *   danger       {boolean}  — if true, confirm button is rose-colored (default true)
 *   onConfirm    {fn}       — called on confirm
 *   onCancel     {fn}       — called on cancel / backdrop click
 */
export default function ConfirmDialog({
  open,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="card-neu p-6 max-w-sm w-full space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              {danger && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              <p className="text-sm text-slate-200">{message}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors
                            ${danger
                              ? 'bg-rose-500 hover:bg-rose-400 text-white'
                              : 'bg-cyan-400 hover:bg-cyan-300 text-slate-900'}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
