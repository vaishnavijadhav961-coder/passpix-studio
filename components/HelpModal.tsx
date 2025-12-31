import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import Button from './Button';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to a backend
    console.log({ name, rating, comment });
    setTimeout(() => {
        setSubmitted(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Fixed Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 z-10">
          <button 
             onClick={onClose}
             className="flex items-center gap-2 text-slate-600 hover:text-sky-600 font-bold transition-colors"
          >
             <ArrowLeft size={20} />
             Go Back
          </button>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Help & Feedback</h2>

          <div className="space-y-6">
            
            {/* Feedback Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-1">
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Rate your experience</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star 
                                            size={28} 
                                            className={`${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Your Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Comments or Suggestions</label>
                            <textarea 
                                required
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us what you liked or how we can improve..."
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none"
                            />
                        </div>

                        <Button type="submit" className="w-full" icon={<Send size={16}/>}>
                            Submit Feedback
                        </Button>
                    </form>
                ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Thank You!</h3>
                        <p className="text-slate-500 text-sm">
                            We appreciate your feedback. It helps us improve PassPix Studio for everyone.
                        </p>
                        <Button variant="outline" onClick={onClose} className="mt-4">
                            Go Back
                        </Button>
                    </div>
                )}
            </div>

            {/* Tips Section */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-bold text-slate-800 mb-3">Common Issues</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3 bg-slate-50 p-3 rounded-xl">
                  <span className="font-bold text-sky-500">•</span>
                  <span>Photo not uploading? Ensure it's under 10MB and is a JPG or PNG file.</span>
                </li>
                <li className="flex gap-3 bg-slate-50 p-3 rounded-xl">
                  <span className="font-bold text-sky-500">•</span>
                  <span>AI loading for too long? Try refreshing the page or using a different photo.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;