// components/chat/MessageBubble.tsx
'use client';

import { Message } from '@/types/chat';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface MessageBubbleProps {
  message: Message;
}

/**
 * Sanitize message content to prevent XSS attacks.
 * React already escapes content by default, but we add extra sanitization.
 */
function sanitizeContent(content: string): string {
  // Remove any potential script tags or dangerous HTML
  // React handles this automatically, but we ensure it here as well
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')  // Remove inline event handlers
    .trim();
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Memoize sanitized content
  const sanitizedContent = useMemo(
    () => sanitizeContent(message.content),
    [message.content]
  );

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-end gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
            ${isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
              : 'bg-gradient-to-br from-green-500 to-teal-500 text-white'
            }
          `}
        >
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Message Bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-md
            ${isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {sanitizedContent}
          </p>

          {/* Tool calls indicator */}
          {message.tool_calls && message.tool_calls.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <p className="text-xs opacity-70 italic">
                🔧 Used {message.tool_calls.length} tool{message.tool_calls.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <p className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
