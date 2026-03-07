import { Inbox } from 'lucide-react';

export default function EmptyState({
  message = 'No data yet',
  icon: Icon = Inbox,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-slate-500 ${className}`}>
      <Icon className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
