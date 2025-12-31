import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import { readFileAsBase64 } from '../services/imageUtils';

interface UploadStepProps {
  onImageSelect: (base64: string) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, HEIC)');
      return;
    }
    try {
      const base64 = await readFileAsBase64(file);
      onImageSelect(base64);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read image file.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          Perfect Passport Photos<br/>
          <span className="text-sky-500">in Seconds</span>
        </h2>
        <p className="text-lg text-slate-500">
          First studio-quality passport photos at home. AI-powered cropping, background removal, and compliance checks.
        </p>
      </div>

      <div
        className={`w-full bg-white rounded-3xl border-4 border-dashed transition-all duration-300 p-10 md:p-16 cursor-pointer group shadow-xl
          ${isDragging ? 'border-sky-400 bg-sky-50 scale-[1.02]' : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center gap-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-300
            ${isDragging ? 'bg-sky-200 text-sky-600' : 'bg-slate-100 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-500'}
          `}>
            <Upload size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Click to Upload or Drag & Drop</h3>
            <p className="text-slate-400 text-sm">Supports JPG, PNG, HEIC (Max 10MB)</p>
          </div>
          <Button size="lg" className="mt-2 pointer-events-none">
            Select Photo
          </Button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        {[
          { icon: <CheckCircle2 className="text-green-500" />, title: "Guaranteed Acceptance", desc: "Biometric compliance for 100+ countries." },
          { icon: <CheckCircle2 className="text-sky-500" />, title: "AI Background Removal", desc: "Get a clean white or colored background instantly." },
          { icon: <CheckCircle2 className="text-rose-500" />, title: "Save Money", desc: "90% cheaper than traditional photo studios." },
        ].map((feature, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start">
            <div className="shrink-0 mt-1">{feature.icon}</div>
            <div>
              <h4 className="font-bold text-slate-700">{feature.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadStep;