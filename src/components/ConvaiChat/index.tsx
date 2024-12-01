import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convaiService } from '../../lib/convai';
import { initializeAudio, stopAudioStream, checkAudioPermissions } from '../../lib/audioUtils';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import AudioIndicator from './AudioIndicator';
import ErrorMessage from './ErrorMessage';
import { Message } from '../../types';

export default function ConvaiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userText, setUserText] = useState("");
  const [npcText, setNpcText] = useState("");
  const [keyPressed, setKeyPressed] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const finalizedUserText = useRef<string>("");
  const npcTextRef = useRef<string>("");

  useEffect(() => {
    const initializeConvai = async () => {
      try {
        const hasPermission = await checkAudioPermissions();
        if (!hasPermission) {
          setError('Microphone access is required for voice input');
          return;
        }

        await convaiService.initialize();
        await convaiService.startSession();
        setIsInitialized(true);
        setError(null);

        convaiService.onResponse((response: any) => {
          if (response.hasUserQuery()) {
            const transcript = response.getUserQuery();
            const isFinal = transcript.getIsFinal();
            
            if (isFinal) {
              finalizedUserText.current += " " + transcript.getTextData();
              setUserText(finalizedUserText.current.trim());
              addMessage(transcript.getTextData().trim(), 'user');
            } else if (transcript) {
              setUserText((finalizedUserText.current + " " + transcript.getTextData()).trim());
            }
          }
          
          if (response.hasAudioResponse()) {
            const audioResponse = response.getAudioResponse();
            npcTextRef.current += " " + audioResponse.getTextData();
            setNpcText(npcTextRef.current.trim());
            addMessage(audioResponse.getTextData().trim(), 'ai');
          }
        });

        convaiService.onError((error) => {
          console.error('Convai error:', error);
          setError('Failed to process audio. Please try again.');
          setIsRecording(false);
          setKeyPressed(false);
          setIsTalking(false);
        });

        convaiService.onAudioPlay(() => setIsTalking(true));
        convaiService.onAudioStop(() => setIsTalking(false));
      } catch (error) {
        console.error('Failed to initialize Convai:', error);
        setError('Failed to initialize chat. Please try again.');
      }
    };

    if (!isInitialized && isOpen) {
      initializeConvai();
    }

    return () => {
      if (audioStream) {
        stopAudioStream(audioStream);
      }
    };
  }, [isInitialized, isOpen]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.code === "KeyT" && !keyPressed && isOpen && !isTalking) {
        event.preventDefault();
        try {
          const stream = await initializeAudio();
          if (stream) {
            setAudioStream(stream);
            setKeyPressed(true);
            finalizedUserText.current = "";
            npcTextRef.current = "";
            setUserText("");
            setNpcText("");
            convaiService.startAudioInput();
            setIsRecording(true);
            setError(null);
          }
        } catch (error) {
          console.error('Failed to start audio:', error);
          setError('Failed to access microphone');
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "KeyT" && keyPressed) {
        event.preventDefault();
        setKeyPressed(false);
        convaiService.stopAudioInput();
        setIsRecording(false);
        if (audioStream) {
          stopAudioStream(audioStream);
          setAudioStream(null);
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, keyPressed, isTalking, audioStream]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text: string, sender: 'user' | 'ai') => {
    if (!text.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: text.trim(),
        sender,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTalking) return;

    const message = inputText.trim();
    setInputText('');
    addMessage(message, 'user');
    finalizedUserText.current = message;
    setUserText(message);

    try {
      await convaiService.sendTextMessage(message);
      setError(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const toggleRecording = async () => {
    if (isTalking) return;
    
    if (isRecording) {
      convaiService.stopAudioInput();
      if (audioStream) {
        stopAudioStream(audioStream);
        setAudioStream(null);
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await initializeAudio();
        if (stream) {
          setAudioStream(stream);
          finalizedUserText.current = "";
          npcTextRef.current = "";
          setUserText("");
          setNpcText("");
          convaiService.startAudioInput();
          setIsRecording(true);
          setError(null);
        }
      } catch (error) {
        console.error('Failed to start recording:', error);
        setError('Failed to access microphone');
      }
    }
  };

  const handleTextKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetSession = async () => {
    if (isTalking || isResetting) return;
    
    setIsResetting(true);
    try {
      await convaiService.resetSession();
      setMessages([]);
      setUserText("");
      setNpcText("");
      finalizedUserText.current = "";
      npcTextRef.current = "";
      setInputText("");
      setError(null);
    } catch (error) {
      console.error('Failed to reset session:', error);
      setError('Failed to reset session. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleRetry = async () => {
    setError(null);
    if (!isInitialized) {
      await convaiService.initialize();
      await convaiService.startSession();
      setIsInitialized(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gray-900 rounded-xl shadow-xl w-96 mb-4"
          >
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetSession}
                  disabled={isTalking || isResetting}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Reset conversation"
                >
                  <RotateCcw className={`w-4 h-4 text-gray-400 ${isResetting ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-sm text-gray-400">Press 'T' to talk</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <AudioIndicator isRecording={isRecording} isTalking={isTalking} />

            {error && <ErrorMessage message={error} onRetry={handleRetry} />}

            <MessageList
              messages={messages}
              userText={userText}
              npcText={npcText}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              inputText={inputText}
              setInputText={setInputText}
              isRecording={isRecording}
              onSendMessage={handleSendMessage}
              onToggleRecording={toggleRecording}
              onKeyPress={handleTextKeyPress}
              disabled={isTalking}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
}