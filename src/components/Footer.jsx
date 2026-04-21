export function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-400 text-sm">
          © 2026 SmartHostel. All rights reserved.
        </div>
        <div className="flex gap-6 text-sm">
          <a href="#" className="text-slate-400 hover:text-accent transition-colors">Privacy Policy</a>
          <a href="#" className="text-slate-400 hover:text-accent transition-colors">Terms of Service</a>
          <a href="#" className="text-slate-400 hover:text-accent transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
