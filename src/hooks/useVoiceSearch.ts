import { useState, useCallback } from 'react';

interface VoiceSearchState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

export function useVoiceSearch() {
  const [state, setState] = useState<VoiceSearchState>({
    isListening: false,
    transcript: '',
    error: null
  });

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setState(prev => ({
        ...prev,
        error: 'Voice search is not supported in your browser'
      }));
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null
      }));
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      setState(prev => ({
        ...prev,
        transcript
      }));
    };

    recognition.onerror = (event: any) => {
      setState(prev => ({
        ...prev,
        error: event.error,
        isListening: false
      }));
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false
      }));
    };

    try {
      recognition.start();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error starting voice recognition',
        isListening: false
      }));
    }

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    setState(prev => ({
      ...prev,
      isListening: false
    }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      error: null
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript
  };
} 