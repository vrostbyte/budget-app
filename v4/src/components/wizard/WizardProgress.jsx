import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * WizardProgress — 6-step horizontal progress indicator.
 *
 * Props:
 *   currentStep  {number}    — 1-based current step
 *   totalSteps   {number}    — total step count
 *   stepLabels   {string[]}  — label for each step
 *   onStepClick  {fn}        — called with step number when a completed step circle is clicked
 */
export default function WizardProgress({ currentStep, totalSteps, stepLabels, onStepClick }) {
  return (
    <div className="px-6 py-3 border-t border-slate-800/80">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const completed = step < currentStep;
          const active = step === currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Circle */}
              <motion.button
                type="button"
                onClick={() => completed && onStepClick(step)}
                disabled={!completed}
                title={stepLabels[i]}
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px]
                            font-semibold shrink-0 transition-colors duration-200
                            ${completed
                              ? 'bg-emerald-400 text-slate-900 cursor-pointer hover:bg-emerald-300'
                              : active
                                ? 'bg-cyan-400 text-slate-900 shadow-[0_0_14px_rgba(34,211,238,0.5)]'
                                : 'bg-slate-700 text-slate-500 cursor-default'}`}
              >
                {completed ? <Check className="w-3.5 h-3.5" /> : step}
              </motion.button>

              {/* Connector line — not after last */}
              {i < totalSteps - 1 && (
                <div
                  className={`flex-1 h-px mx-1 transition-colors duration-300
                              ${step < currentStep ? 'bg-emerald-400/40' : 'bg-slate-700'}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step label row */}
      <div className="flex mt-1.5">
        {stepLabels.map((label, i) => {
          const step = i + 1;
          const completed = step < currentStep;
          const active = step === currentStep;
          return (
            <div key={i} className="flex-1 text-center">
              <span
                className={`text-[9px] leading-tight hidden sm:inline-block
                            ${active ? 'text-cyan-400' : completed ? 'text-emerald-400/70' : 'text-slate-600'}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
