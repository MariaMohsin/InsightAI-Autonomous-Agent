// components/chat/MessageInput.tsx
'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...'
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3">
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Chat message input"
            aria-describedby="chat-hint"
            className="
              w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-200
              focus:border-blue-500 focus:outline-none
              resize-none text-gray-800 placeholder-gray-400
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition-all duration-200
            "
            style={{
              maxHeight: '120px',
              minHeight: '50px'
            }}
          />

          {/* Character count hint */}
          {message.length > 0 && (
            <motion.div
              className="absolute bottom-2 right-3 text-xs text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {message.length}
            </motion.div>
          )}
        </div>

        {/* Send Button */}
        <motion.button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          aria-label="Send message"
          aria-disabled={disabled || !message.trim()}
          className={`
            px-6 py-3 rounded-2xl font-semibold text-white
            transition-all duration-200 flex items-center gap-2
            ${disabled || !message.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
            }
          `}
          whileHover={disabled || !message.trim() ? {} : { scale: 1.05 }}
          whileTap={disabled || !message.trim() ? {} : { scale: 0.95 }}
        >
          {disabled ? (
            /* Loading State */
            <div className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Sending</span>
            </div>
          ) : (
            /* Send Icon */
            <>
              <span>Send</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </>
          )}
        </motion.button>
      </div>

      {/* Hint */}
      <motion.p
        id="chat-hint"
        className="text-xs text-gray-500 mt-2 ml-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        💡 Tip: Try "add a task to call the dentist tomorrow" or "show my pending tasks"
      </motion.p>
    </div>
  );
}
