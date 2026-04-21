import { cn } from './Button';

export function Badge({ children, variant = 'default', className }) {
  const styles = {
    default: "bg-primary/10 text-primary border-primary/10",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    danger: "bg-rose-100 text-rose-700 border-rose-200",
    outline: "border-primary/20 text-primary bg-transparent",
    locked: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <span className={cn(
      "px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border flex items-center gap-1.5 w-fit whitespace-nowrap",
      styles[variant] || styles.default,
      className
    )}>
      {variant === 'locked' && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
      )}
      {children}
    </span>
  );
}
