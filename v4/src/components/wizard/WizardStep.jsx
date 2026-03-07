/**
 * WizardStep — reusable step wrapper.
 * Provides consistent headline + guidance text + child content spacing.
 */
export default function WizardStep({ headline, guidance, children }) {
  return (
    <div className="space-y-4">
      {headline && (
        <h3 className="text-sm font-semibold text-slate-100">{headline}</h3>
      )}
      {guidance && (
        <p className="text-sm text-slate-400 leading-relaxed">{guidance}</p>
      )}
      {children}
    </div>
  );
}
