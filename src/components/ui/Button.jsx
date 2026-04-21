import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}) {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 font-medium tracking-wide transition-all duration-300 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-light shadow-[0_0_15px_rgba(75,46,43,0.3)] hover:shadow-[0_0_25px_rgba(111,78,55,0.5)]",
    default: "bg-primary text-white hover:bg-primary-light shadow-[0_0_15px_rgba(75,46,43,0.3)] hover:shadow-[0_0_25px_rgba(111,78,55,0.5)]",
    accent: "bg-accent hover:bg-accent-light shadow-[0_0_15px_rgba(200,169,126,0.3)] hover:shadow-[0_0_25px_rgba(212,196,168,0.5)] text-text",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "hover:bg-primary/10 text-primary hover:text-primary-dark"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant] || variants.default, className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
      {(variant === 'primary' || variant === 'default' || variant === 'accent') ? (
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      ) : null}
    </motion.button>
  );
}
