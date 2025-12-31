import React, { useState } from 'react';
import Layout from './components/Layout';
import UploadStep from './components/UploadStep';
import EditStep from './components/EditStep';
import PrintStep from './components/PrintStep';
import HowItWorks from './components/HowItWorks';
import HelpModal from './components/HelpModal';
import { AppState, ProcessingStatus } from './types';
import { PASSPORT_STANDARDS } from './constants';

const App: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const initialState: AppState = {
    step: 'upload',
    originalImage: null,
    currentImage: null,
    history: [],
    historyIndex: -1,
    standard: PASSPORT_STANDARDS[0], // Default US
    processingStatus: 'idle',
    processingMessage: ''
  };

  const [appState, setAppState] = useState<AppState>(initialState);

  const handleImageSelect = (base64: string) => {
    setAppState(prev => ({
      ...prev,
      step: 'edit',
      originalImage: base64,
      currentImage: base64,
      history: [base64],
      historyIndex: 0
    }));
  };

  const handleUpdateImage = (newImage: string) => {
    setAppState(prev => {
        const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), newImage];
        return {
            ...prev,
            currentImage: newImage,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
    });
  };

  const setProcessing = (status: ProcessingStatus, msg: string) => {
    setAppState(prev => ({ ...prev, processingStatus: status, processingMessage: msg }));
  };

  const handleStandardChange = (countryCode: string) => {
    const std = PASSPORT_STANDARDS.find(s => s.country === countryCode) || PASSPORT_STANDARDS[0];
    setAppState(prev => ({ ...prev, standard: std }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to start over? Your changes will be lost.")) {
      setAppState(initialState);
    }
  };

  return (
    <Layout 
      onOpenGuide={() => setShowGuide(true)} 
      onOpenHelp={() => setShowHelp(true)}
    >
      {showGuide && <HowItWorks onClose={() => setShowGuide(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      
      {appState.step === 'upload' && (
        <UploadStep onImageSelect={handleImageSelect} />
      )}
      
      {appState.step === 'edit' && (
        <EditStep 
          state={appState}
          onUpdateImage={handleUpdateImage}
          onBack={() => setAppState(prev => ({ ...prev, step: 'upload' }))}
          onNext={() => setAppState(prev => ({ ...prev, step: 'print' }))}
          setProcessing={setProcessing}
          updateStandard={handleStandardChange}
        />
      )}

      {appState.step === 'print' && (
        <PrintStep 
            state={appState} 
            onBack={() => setAppState(prev => ({ ...prev, step: 'edit' }))}
            onHome={handleReset}
        />
      )}
    </Layout>
  );
};

export default App;