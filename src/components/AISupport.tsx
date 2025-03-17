import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';

export default function AISupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Hi! I'm your AI assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    
    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Thanks for your message! I'm here to help with any questions about trading, services, or merchandise.", 
        isBot: true 
      }]);
    }, 1000);
    
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary-600 dark:bg-primary-500 text-white 
        rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 w-96 bg-white dark:bg-dark-bg-secondary 
            rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200 
            dark:border-dark-bg-tertiary"
          >
            {/* Header */}
            <div className="p-4 bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <span className="font-medium">AI Support</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.isBot 
                      ? 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary' 
                      : 'bg-primary-600 dark:bg-primary-500 text-white'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-dark-bg-tertiary">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-dark-bg-tertiary 
                  border border-gray-200 dark:border-dark-bg-tertiary text-gray-900 
                  dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="p-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg 
                  hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 