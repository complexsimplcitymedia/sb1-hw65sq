import React, { useState, useEffect, useRef } from 'react';
import { audioManager } from '../lib/audioManager';
import { keyboardManager } from '../lib/keyboardManager';
import { Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PixelStreamViewerProps {
  streamUrl: string;
  width?: string | number;
  height?: string | number;
}

export default function PixelStreamViewer({ 
  streamUrl,
  width = '100%', 
  height = '100%' 
}: PixelStreamViewerProps) {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.code === "KeyT" && !isKeyPressed && document.activeElement === iframeRef.current) {
        try {
          await audioManager.startAudioInput();
          setIsKeyPressed(true);
          
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'keyEvent',
              eventType: 'keydown',
              key: 'T',
              code: 'KeyT',
              keyCode: 84
            }, '*');
          }
        } catch (error) {
          console.error('Failed to start audio capture:', error);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "KeyT" && isKeyPressed) {
        audioManager.stopAudioInput();
        setIsKeyPressed(false);
        
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'keyEvent',
            eventType: 'keyup',
            key: 'T',
            code: 'KeyT',
            keyCode: 84
          }, '*');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      audioManager.cleanup();
    };
  }, [isKeyPressed]);

  const handleTouchStart = async () => {
    if (!isKeyPressed) {
      try {
        await audioManager.startAudioInput();
        setIsKeyPressed(true);
        
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'keyEvent',
            eventType: 'keydown',
            key: 'T',
            code: 'KeyT',
            keyCode: 84
          }, '*');
        }
      } catch (error) {
        console.error('Failed to start audio capture:', error);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isKeyPressed) {
      audioManager.stopAudioInput();
      setIsKeyPressed(false);
      
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'keyEvent',
          eventType: 'keyup',
          key: 'T',
          code: 'KeyT',
          keyCode: 84
        }, '*');
      }
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={streamUrl}
        className="w-full h-full border-0"
        style={{ width, height }}
        allow="microphone; camera; fullscreen; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
        referrerPolicy="no-referrer"
        loading="eager"
        importance="high"
        fetchpriority="high"
        tabIndex={0}
      />

      <AnimatePresence>
        {isKeyPressed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 right-4 z-[9999]"
          >
            <div className="flex items-center space-x-2 bg-red-500/20 backdrop-blur-sm px-3 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-white font-medium">Recording...</span>
              <Mic className="w-4 h-4 text-red-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="md:hidden fixed bottom-20 right-4 z-[9999] w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center"
      >
        <Mic className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}