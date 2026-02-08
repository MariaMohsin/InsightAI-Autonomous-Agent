// components/chat/MessageList.tsx
'use client';

import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-2" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.length === 0 ? (
        /* Empty State */
        <motion.div
          className="flex flex-col items-center justify-center h-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl">
            🤖
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Hi! I'm your Todo Assistant
          </h3>
          <p className="text-gray-600 max-w-md mb-6">
            I can help you manage your tasks using natural language. Try saying:
          </p>
          <div className="space-y-2 text-left bg-gray-50 rounded-lg p-4 max-w-md">
            <p className="text-sm text-gray-700">
              • "Add a task to call mom tomorrow"
            </p>
            <p className="text-sm text-gray-700">
              • "Show me all my pending tasks"
            </p>
            <p className="text-sm text-gray-700">
              • "Mark task 3 as completed"
            </p>
            <p className="text-sm text-gray-700">
              • "Change the priority of buy groceries to high"
            </p>
          </div>
        </motion.div>
      ) : (
        /* Message List */
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <motion.div
          className="flex items-end gap-2 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white flex items-center justify-center text-sm font-semibold">
            AI
          </div>
          <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-sm shadow-md border border-gray-200">
            <div className="flex gap-1">
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
