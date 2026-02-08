// components/chat/ChatInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { sendChatMessage, getConversation } from '@/lib/chat-api';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

interface ChatInterfaceProps {
  conversationId?: number | null;
  onConversationCreated?: (conversationId: number) => void;
}

export function ChatInterface({
  conversationId: initialConversationId,
  onConversationCreated
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(
    initialConversationId || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversation messages if conversationId is provided
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  const loadConversation = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const conversation = await getConversation(id);
      setMessages(conversation.messages || []);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    try {
      setIsSending(true);
      setError(null);

      // Call chat API
      const response = await sendChatMessage(messageText, conversationId);

      // Update conversation ID if new conversation was created
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
        onConversationCreated?.(response.conversation_id);
      }

      // Add both user message and assistant response to messages
      setMessages((prev) => [
        ...prev,
        response.user_message,
        response.assistant_message
      ]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message. Please try again.');

      // Show error for 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🤖
          </motion.div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">AI Todo Assistant</h2>
            <p className="text-sm text-white/80">
              {conversationId
                ? `Conversation #${conversationId}`
                : 'Start a new conversation'}
            </p>
          </div>
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-white/80">Online</span>
          </motion.div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isSending} />
      </div>

      {/* Input Area */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isSending}
        placeholder={
          isSending
            ? 'AI is thinking...'
            : 'Type a message... (e.g., "add a task to call mom")'
        }
      />
    </Card>
  );
}
