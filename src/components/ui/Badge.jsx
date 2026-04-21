import { cn } from './Button';

export function Badge({ children, status, className }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    progress: "bg-blue-100 text-blue-800 border-blue-200",
    resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    locked: "bg-rose-100 text-rose-800 border-rose-200"
  };

  return (
    <span className={cn(
      "px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 w-fit",
      styles[status] || "bg-gray-100 text-gray-800 border-gray-200",
      className
    )}>
      {status === 'locked' && (
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      )}
      {children}
    </span>
  );
}
