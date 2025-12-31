import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Printer, Grid, User, Check, Home } from 'lucide-react';
import Button from './Button';
import { AppState } from '../types';
import { generateTiledPDF } from '../services/imageUtils';
import { jsPDF } from "jspdf";

interface PrintStepProps {
  state: AppState;
  onBack: () => void;
  onHome: () => void;
}

const PrintStep: React.FC<PrintStepProps> = ({ state, onBack, onHome }) => {
  const [layout, setLayout] = useState<'single' | 'a4'>('a4');
  const [format, setFormat] = useState<'jpg' | 'png' | 'pdf'>('jpg');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(1);

  // Generate preview based on layout selection
  useEffect(() => {
    const generate = async () => {
      if (!state.currentImage) return;

      if (layout === 'single') {
        setPreviewUrl(state.currentImage);
        setPhotoCount(1);
      } else {
        const result = await generateTiledPDF(
            state.currentImage, 
            state.standard.widthMm, 
            state.standard.heightMm
        );
        if (result) {
            setPreviewUrl(result.dataUrl);
            setPhotoCount(result.count);
        }
      }
    };
    generate();
  }, [state.currentImage, state.standard, layout]);

  const handleDownload = () => {
    if (!previewUrl) return;
    
    const filename = `PassPix-${state.standard.country}-${layout}`;
    
    if (format === 'pdf') {
        // Direct PDF generation using jsPDF
        const doc = new jsPDF({
            orientation: layout === 'a4' ? 'portrait' : 'portrait',
            unit: 'mm',
            format: layout === 'a4' ? 'a4' : [state.standard.widthMm + 10, state.standard.heightMm + 10]
        });

        // Add the image to PDF
        // getWidth() returns width in the unit specified (mm)
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        doc.addImage(previewUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        doc.save(`${filename}.pdf`);
    } else {
        // Image Download
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
     if (!previewUrl) return;
     const printWindow = window.open('', '_blank');
     if (printWindow) {
        printWindow.document.write(`
            <html>
                <head><title>Print Passport Photo</title></head>
                <body style="margin:0; display:flex; justify-content:center; align-items:center;">
                    <img src="${previewUrl}" style="max-width:100%; height:auto;" onload="window.print();window.close()" />
                </body>
            </html>
        `);
        printWindow.document.close();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Finalize & Download</h2>
        <p className="text-slate-500">
          Choose your layout and format below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Options Column */}
          <div className="md:col-span-1 space-y-6">
              {/* Layout Selection */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-4">1. Choose Layout</h3>
                  <div className="space-y-3">
                      <button 
                        onClick={() => setLayout('a4')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${layout === 'a4' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                          <Grid size={20} />
                          <div className="text-left">
                              <div className="font-bold text-sm">A4 Sheet</div>
                              <div className="text-xs opacity-70">Multiple copies</div>
                          </div>
                          {layout === 'a4' && <Check size={16} className="ml-auto" />}
                      </button>

                      <button 
                        onClick={() => setLayout('single')}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${layout === 'single' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                          <User size={20} />
                          <div className="text-left">
                              <div className="font-bold text-sm">Single Photo</div>
                              <div className="text-xs opacity-70">One copy</div>
                          </div>
                          {layout === 'single' && <Check size={16} className="ml-auto" />}
                      </button>
                  </div>
              </div>

              {/* Format Selection */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-4">2. Choose Format</h3>
                  <div className="flex gap-2">
                      {['jpg', 'png', 'pdf'].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setFormat(fmt as any)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all border ${format === fmt ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                          >
                              {fmt}
                          </button>
                      ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                     PDF is best for printing. JPG for online use.
                  </p>
              </div>
          </div>

          {/* Preview Column */}
          <div className="md:col-span-2 bg-slate-200/50 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px]">
             {previewUrl ? (
                <div className="relative shadow-2xl transition-all duration-300">
                   <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className={`bg-white object-contain ${layout === 'a4' ? 'max-h-[500px] w-full max-w-[350px]' : 'max-h-[300px] rounded-sm'}`} 
                   />
                   <div className="absolute -bottom-10 left-0 w-full text-center text-xs font-mono text-slate-500">
                      {layout === 'a4' ? 'A4 Paper (210 × 297 mm)' : `${state.standard.label}`}
                   </div>
                </div>
             ) : (
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-64 w-48 bg-slate-300 rounded-lg mb-4"></div>
                    <div className="h-4 w-32 bg-slate-300 rounded"></div>
                </div>
             )}
          </div>
      </div>

      {/* Actions */}
      <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Button variant="outline" onClick={onBack} icon={<ArrowLeft size={18} />}>
            Back to Edit
            </Button>
            
            <div className="flex flex-wrap justify-center gap-4">
                <Button variant="secondary" onClick={handlePrint} icon={<Printer size={18} />}>
                    Print Now
                </Button>
                <Button variant="primary" size="lg" onClick={handleDownload} icon={<Download size={18} />}>
                    Download {format.toUpperCase()}
                </Button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
             <button 
                onClick={onHome}
                className="flex items-center gap-2 text-slate-400 hover:text-sky-500 transition-colors text-sm font-medium"
             >
                <Home size={16} />
                Return to Home Screen
             </button>
          </div>
      </div>
    </div>
  );
};

export default PrintStep;