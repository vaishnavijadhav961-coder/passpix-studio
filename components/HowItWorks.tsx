import React from 'react';
import { X, Camera, Wand2, Printer, ScanFace } from 'lucide-react';
import Button from './Button';

interface HowItWorksProps {
  onClose: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onClose }) => {
  const steps = [
    {
      icon: <Camera className="w-6 h-6 text-sky-600" />,
      title: "1. Upload Your Photo",
      desc: "Take a photo against any wall. Ensure good lighting on your face. Look straight at the camera. We support JPG, PNG, and HEIC.",
      bg: "bg-sky-100",
    },
    {
      icon: <Wand2 className="w-6 h-6 text-purple-600" />,
      title: "2. AI Magic & Edit",
      desc: "Our AI automatically crops the face and removes the background. You can then change the background color or even swap your outfit digitally.",
      bg: "bg-purple-100",
    },
    {
      icon: <Printer className="w-6 h-6 text-rose-600" />,
      title: "3. Download & Print",
      desc: "Download a high-quality A4 sheet with multiple passport photos. Print it at home on glossy paper or at any local print shop for cheap.",
      bg: "bg-rose-100",
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        {/* Decorative header line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 via-purple-400 to-rose-400"></div>
        
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">How It Works</h2>
              <p className="text-slate-500 mt-1">Get studio-quality results in 3 simple steps.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 md:gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className={`shrink-0 w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center shadow-sm`}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{step.title}</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-100">
            <h4 className="font-bold text-sky-800 flex items-center gap-2 mb-3">
              <ScanFace size={20} />
              Pro Tips for Acceptance
            </h4>
            <ul className="space-y-2 text-sm text-sky-900/80">
              <li className="flex gap-2">
                <span className="text-sky-500">•</span>
                Keep a neutral expression (mouth closed, eyes open).
              </li>
              <li className="flex gap-2">
                <span className="text-sky-500">•</span>
                Ensure no shadows fall on your face or background.
              </li>
              <li className="flex gap-2">
                <span className="text-sky-500">•</span>
                Remove glasses to avoid glare (recommended for most countries).
              </li>
            </ul>
          </div>
        </div>
        
        <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button onClick={onClose} size="lg">Start Creating</Button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;