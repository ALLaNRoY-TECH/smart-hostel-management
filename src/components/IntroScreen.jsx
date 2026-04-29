import { motion } from 'framer-motion';
import { Coffee, Loader2 } from 'lucide-react';

export function IntroScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a110a] via-[#3d2716] to-[#1a110a] overflow-hidden"
    >
      {/* Background Noise / Texture (optional) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center relative z-10"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-tr from-[#8c6239] to-[#cba37b] flex items-center justify-center shadow-[0_0_50px_rgba(203,163,123,0.4)]"
        >
          <Coffee className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#e6d5c3] to-[#cba37b] tracking-tight mb-2 text-center drop-shadow-2xl">
          Smart Hostel
        </h1>
        <p className="text-[#cba37b]/70 font-bold tracking-[0.3em] uppercase text-xs md:text-sm">
          Management System
        </p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 flex items-center gap-3 text-[#cba37b]"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-bold tracking-widest">INITIALIZING</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
