import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Wand2, RefreshCcw, Layers, Shirt, 
  RotateCw, Sun, Palette, Download, Crop, Move, Sparkles,
  Undo2, Redo2, ZoomIn
} from 'lucide-react';
import Button from './Button';
import RangeSlider from './RangeSlider';
import { AppState, ProcessingStatus, FilterSettings } from '../types';
import { editImageWithGemini } from '../services/geminiService';
import { applyFilters } from '../services/imageUtils';
import { OUTFIT_CATEGORIES, BACKGROUND_COLORS, PASSPORT_STANDARDS, OutfitOption } from '../constants';

interface EditStepProps {
  state: AppState;
  onUpdateImage: (newImage: string) => void;
  onBack: () => void;
  onNext: () => void;
  setProcessing: (status: ProcessingStatus, msg: string) => void;
  updateStandard: (code: string) => void;
}

interface TransformState {
  scale: number;
  rotate: number;
  x: number;
  y: number;
}

interface HistoryState {
  image: string;
  transform: TransformState;
  filters: FilterSettings;
}

const EditStep: React.FC<EditStepProps> = ({ 
  state, onUpdateImage, onBack, onNext, setProcessing, updateStandard 
}) => {
  const [activeTab, setActiveTab] = useState<'adjust' | 'crop' | 'background' | 'costume'>('crop');
  const [outfitGender, setOutfitGender] = useState<'men' | 'women'>('men');
  const [customColor, setCustomColor] = useState('#ffffff');
  
  // Local state for edits
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 0, contrast: 0, saturation: 0, warmth: 0
  });

  const [transform, setTransform] = useState<TransformState>({
    scale: 1, rotate: 0, x: 0, y: 0
  });
  
  // Initialize with currentImage to avoid empty flash
  const [baseImage, setBaseImage] = useState<string>(state.currentImage || '');
  const [previewImage, setPreviewImage] = useState<string>(state.currentImage || '');
  
  // History Management
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize History on mount
  useEffect(() => {
    if (state.currentImage && history.length === 0) {
      const initialState: HistoryState = {
        image: state.currentImage,
        transform: { scale: 1, rotate: 0, x: 0, y: 0 },
        filters: { brightness: 0, contrast: 0, saturation: 0, warmth: 0 }
      };
      setHistory([initialState]);
      setHistoryIndex(0);
      setBaseImage(state.currentImage);
      setPreviewImage(state.currentImage);
    }
  }, [state.currentImage]); // Run once on mount if image exists

  // Apply filters to generate preview
  useEffect(() => {
    let isMounted = true;
    if (baseImage) {
      applyFilters(baseImage, filters)
        .then(res => {
          if (isMounted) setPreviewImage(res);
        })
        .catch(err => {
          console.error("Filter application failed", err);
          if (isMounted) setPreviewImage(baseImage); // Fallback
        });
    }
    return () => { isMounted = false; };
  }, [baseImage, filters]);

  // --- History Logic ---
  const pushToHistory = (newBaseImage: string, newTransform: TransformState, newFilters: FilterSettings) => {
    const newState: HistoryState = {
      image: newBaseImage,
      transform: { ...newTransform },
      filters: { ...newFilters }
    };
    
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const recordChange = () => {
    pushToHistory(baseImage, transform, filters);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setBaseImage(prev.image);
      setTransform(prev.transform);
      setFilters(prev.filters);
      setHistoryIndex(historyIndex - 1);
      
      // Update parent app state for final output generation
      onUpdateImage(prev.image);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setBaseImage(next.image);
      setTransform(next.transform);
      setFilters(next.filters);
      setHistoryIndex(historyIndex + 1);
      
      onUpdateImage(next.image);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);


  // --- Interactive Canvas Logic ---
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTab !== 'crop') return;
    isDragging.current = true;
    startPos.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || activeTab !== 'crop') return;
    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
        isDragging.current = false;
        recordChange(); // Save position to history on release
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (activeTab !== 'crop') return;
    // e.stopPropagation();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.5, transform.scale + scaleAmount), 3);
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  // --- AI Actions ---
  const handleAIAction = async (prompt: string, loadingMsg: string) => {
    if (!baseImage) return;
    setProcessing('processing', loadingMsg);
    try {
      const newImage = await editImageWithGemini(baseImage, prompt);
      
      // Update local state
      setBaseImage(newImage);
      // Reset transform/filters for the new image as it's a fresh generation
      const resetTransform = { scale: 1, rotate: 0, x: 0, y: 0 };
      const resetFilters = { brightness: 0, contrast: 0, saturation: 0, warmth: 0 };
      setTransform(resetTransform);
      setFilters(resetFilters);
      
      // Push to history
      pushToHistory(newImage, resetTransform, resetFilters);
      
      // Update parent
      onUpdateImage(newImage);
      setProcessing('success', 'Done!');
    } catch (error) {
      setProcessing('error', 'AI Processing Failed. Please try again.');
    }
  };

  const handleBackgroundChange = (colorValue: string, colorName: string) => {
    // Explicitly forbid text in the prompt to prevent artifacts
    const prompt = `Replace the background with a flat solid color matching this hex code: ${colorValue}. Ensure the background is uniform and clean. Do not add any text, labels, or color codes to the image. Keep the person exactly the same.`;
    
    // Sanitize loading message to avoid showing raw hex codes in UI
    const safeColorName = colorName.startsWith('#') ? 'Custom Color' : colorName;
    
    handleAIAction(
      prompt,
      `Applying ${safeColorName} background...`
    );
  };

  const handleCostumeChange = (outfit: OutfitOption) => {
    handleAIAction(
      `Change the person's clothing to ${outfit.prompt}. Keep the face, head, hair and identity exactly the same. Only change the outfit below the neck. Do not add any text or labels.`,
      `Trying on ${outfit.label}...`
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Left: Canvas / Preview Area */}
      <div className="flex-grow flex flex-col items-center">
        
        {/* Undo/Redo Toolbar */}
        <div className="w-full max-w-md flex justify-between items-center mb-4">
             <div className="flex gap-2">
                <button 
                  onClick={handleUndo} 
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                    <Undo2 size={20} />
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                    <Redo2 size={20} />
                </button>
             </div>
             <div className="text-xs text-slate-400 font-medium">
                {activeTab === 'crop' ? 'Drag to Move • Scroll to Zoom' : 'Edit Mode'}
             </div>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-xl p-6 border border-slate-200 relative overflow-hidden select-none">
          {state.processingStatus === 'processing' && (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4"></div>
              <p className="text-sky-600 font-medium animate-pulse text-center px-4">{state.processingMessage}</p>
            </div>
          )}
          
          <div 
             className={`aspect-[3/4] w-full max-w-md mx-auto bg-slate-100 rounded-lg overflow-hidden shadow-inner relative group cursor-${activeTab === 'crop' ? 'move' : 'default'}`}
             ref={containerRef}
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onWheel={handleWheel}
          >
             {/* Transformations applied here */}
            <div 
              className="w-full h-full origin-center will-change-transform"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg) scale(${transform.scale})`
              }}
            >
              <img 
                src={previewImage} 
                alt="Passport Preview" 
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>

            {/* Overlay Grid for Guidelines */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
               <div className="w-full h-full border-2 border-sky-300 rounded-lg relative">
                  {/* Rule of thirds grid */}
                  <div className="absolute top-1/3 w-full border-t border-sky-200/50"></div>
                  <div className="absolute top-2/3 w-full border-t border-sky-200/50"></div>
                  <div className="absolute left-1/3 h-full border-l border-sky-200/50"></div>
                  <div className="absolute left-2/3 h-full border-l border-sky-200/50"></div>
                  
                  {/* Face Guide */}
                  <div className="absolute top-[12%] left-[50%] -translate-x-1/2 w-[55%] h-[65%] border-2 border-dashed border-sky-400 rounded-[50%] shadow-sm"></div>
                  <div className="absolute top-1/2 w-full border-t border-sky-400/30"></div>
                  <div className="absolute left-1/2 h-full border-l border-sky-400/30"></div>
               </div>
            </div>
          </div>
        </div>
        
        {/* Country Selector */}
        <div className="mt-6 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 w-full max-w-md">
           <span className="text-slate-500 text-sm font-medium whitespace-nowrap">Format:</span>
           <select 
            className="w-full bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 py-2"
            value={PASSPORT_STANDARDS.find(s => s.label === state.standard.label)?.country} 
            onChange={(e) => {
               const std = PASSPORT_STANDARDS.find(s => s.country === e.target.value);
               if (std) updateStandard(std.country);
            }}
           >
             {PASSPORT_STANDARDS.map(s => (
               <option key={s.country} value={s.country}>{s.label}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-full lg:w-[28rem] shrink-0 flex flex-col gap-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide">
             {[
              { id: 'crop', label: 'Position', icon: <Crop size={18}/> },
              { id: 'adjust', label: 'Tune', icon: <Sun size={18}/> },
              { id: 'background', label: 'Color', icon: <Layers size={18}/> },
              { id: 'costume', label: 'Outfit', icon: <Shirt size={18}/> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-sm font-medium flex flex-col items-center gap-1 transition-colors min-w-[70px]
                  ${activeTab === tab.id ? 'text-sky-500 bg-sky-50/50 border-b-2 border-sky-500' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 h-[420px] overflow-y-auto custom-scrollbar">
            
            {activeTab === 'crop' && (
              <div className="space-y-6">
                <div className="p-3 bg-sky-50 rounded-xl mb-4 text-xs text-sky-800 flex items-center gap-2">
                   <Move size={14}/> Drag image to move • Scroll to zoom
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zoom</span>
                    <span className="text-xs font-mono text-slate-400">{Math.round(transform.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="50" max="300"
                    value={transform.scale * 100}
                    onChange={(e) => {
                        setTransform(p => ({...p, scale: Number(e.target.value)/100}));
                    }}
                    onMouseUp={recordChange}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rotate</span>
                    <span className="text-xs font-mono text-slate-400">{transform.rotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45" max="45"
                    value={transform.rotate}
                    onChange={(e) => setTransform(p => ({...p, rotate: Number(e.target.value)}))}
                    onMouseUp={recordChange}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                   <div className="flex justify-center gap-2 mt-2">
                      <button onClick={() => { setTransform(p => ({...p, rotate: p.rotate - 90})); recordChange(); }} className="p-1 text-slate-400 hover:text-sky-500"><RotateCw size={16} className="-scale-x-100" /></button>
                      <button onClick={() => { setTransform(p => ({...p, rotate: 0})); recordChange(); }} className="px-2 text-xs font-medium text-slate-400 hover:text-sky-500">Reset</button>
                      <button onClick={() => { setTransform(p => ({...p, rotate: p.rotate + 90})); recordChange(); }} className="p-1 text-slate-400 hover:text-sky-500"><RotateCw size={16} /></button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'adjust' && (
              <div className="space-y-6">
                 <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs text-slate-500">
                    Fine tune the image. Changes are saved automatically.
                 </div>
                 {/* Wrap sliders to capture MouseUp for history */}
                <div onMouseUp={recordChange} onKeyUp={recordChange}>
                    <RangeSlider 
                    label="Brightness" 
                    value={filters.brightness} min={-50} max={50} 
                    onChange={(v) => setFilters({...filters, brightness: v})} 
                    icon={<Sun size={14}/>}
                    />
                    <div className="h-4"></div>
                    <RangeSlider 
                    label="Contrast" 
                    value={filters.contrast} min={-50} max={50} 
                    onChange={(v) => setFilters({...filters, contrast: v})} 
                    icon={<RefreshCcw size={14}/>}
                    />
                     <div className="h-4"></div>
                    <RangeSlider 
                    label="Saturation" 
                    value={filters.saturation} min={-50} max={50} 
                    onChange={(v) => setFilters({...filters, saturation: v})} 
                    icon={<Palette size={14}/>}
                    />
                     <div className="h-4"></div>
                    <RangeSlider 
                    label="Warmth" 
                    value={filters.warmth} min={-50} max={50} 
                    onChange={(v) => setFilters({...filters, warmth: v})} 
                    icon={<Sun size={14} className="text-orange-400"/>}
                    />
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-4">
                 <p className="text-xs text-slate-400 mb-2">Select a preset or pick a custom color.</p>
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    {BACKGROUND_COLORS.map((bg, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleBackgroundChange(bg.value, bg.name)}
                        className="group flex items-center gap-3 p-2 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50 transition-all text-left"
                      >
                        <div 
                          className="w-10 h-10 rounded-lg shadow-sm border border-slate-200" 
                          style={{ background: bg.value }}
                        ></div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-sky-600">{bg.name}</span>
                      </button>
                    ))}
                 </div>
                 
                 <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Choose Custom Color</label>
                    <div className="flex gap-3">
                        {/* Wrapper div to ensure input doesn't show text if browser attempts to */}
                        <div 
                            className="h-10 w-10 relative overflow-hidden rounded-lg shadow-sm border border-slate-200"
                            style={{ backgroundColor: customColor }}
                        >
                            <input 
                                type="color" 
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                aria-label="Choose color"
                            />
                        </div>
                         <button
                            onClick={() => handleBackgroundChange(customColor, 'Custom Color')}
                            className="flex-1 bg-white border border-slate-300 hover:border-sky-500 text-slate-600 hover:text-sky-600 text-sm font-medium rounded-lg transition-colors"
                        >
                            Apply Custom Color
                        </button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'costume' && (
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                    <button 
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${outfitGender === 'men' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'}`}
                        onClick={() => setOutfitGender('men')}
                    >
                        Men's Wear
                    </button>
                    <button 
                         className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${outfitGender === 'women' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                         onClick={() => setOutfitGender('women')}
                    >
                        Women's Wear
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {OUTFIT_CATEGORIES[outfitGender].map((outfit) => (
                    <button
                      key={outfit.id}
                      onClick={() => handleCostumeChange(outfit)}
                      className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50 transition-all text-center relative overflow-hidden"
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm z-10"
                        style={{ backgroundColor: outfit.color }}
                      >
                         <Shirt size={20} className={['#ffffff', '#f8fafc', '#bfdbfe', '#e0f2fe', '#e2e8f0'].includes(outfit.color) ? 'text-slate-800' : 'text-white'} />
                      </div>
                      <span className="text-xs font-medium text-slate-600 group-hover:text-sky-700 leading-tight z-10">{outfit.label}</span>
                    </button>
                  ))}
                </div>
                
                <p className="text-xs text-center text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg">
                    <Sparkles size={12} className="inline mr-1 text-sky-400"/>
                    AI will replace the outfit. Results may vary.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" className="flex-1" onClick={onBack} icon={<ArrowLeft size={18}/>}>Back</Button>
          <Button variant="primary" className="flex-1" onClick={onNext} icon={<Download size={18}/>}>Next Step</Button>
        </div>
      </div>
    </div>
  );
};

export default EditStep;