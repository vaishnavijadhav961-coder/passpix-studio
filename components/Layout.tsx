import React from 'react';
import { Camera, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onOpenGuide?: () => void;
  onOpenHelp?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onOpenGuide, onOpenHelp }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-200">
              <Camera size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 leading-none">
                PassPix<span className="text-sky-500">.Studio</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">AI PASSPORT PHOTOS</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <button 
              onClick={onOpenGuide} 
              className="hover:text-sky-500 transition-colors focus:outline-none"
            >
              How it works
            </button>
            <button 
              onClick={onOpenHelp}
              className="hover:text-sky-500 transition-colors focus:outline-none"
            >
              Help & Support
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow bg-slate-50 relative">
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-sky-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-rose-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© 2024 PassPix Studio. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Made with</span>
            <Heart size={14} className="text-rose-400 fill-rose-400" />
            <span>for travelers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;