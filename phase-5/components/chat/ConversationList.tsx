// components/chat/ConversationList.tsx
'use client';

import { Conversation } from '@/types/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: number | null;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: number) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading = false
}: ConversationListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (e: React.MouseEvent, conversationId: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      setDeletingId(conversationId);
      try {
        await onDeleteConversation(conversationId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <motion.button
          onClick={onNewConversation}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Conversation
        </motion.button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-8">
            <motion.div
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : conversations.length === 0 ? (
          /* Empty State */
          <motion.div
            className="text-center py-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-gray-600">
              No conversations yet.
              <br />
              Start a new one!
            </p>
          </motion.div>
        ) : (
          /* Conversation Items */
          <AnimatePresence>
            {conversations.map((conversation, index) => {
              const isActive = conversation.id === currentConversationId;
              const isDeleting = conversation.id === deletingId;

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="mb-2"
                >
                  <div
                    onClick={() => !isDeleting && onSelectConversation(conversation.id)}
                    className={`
                      w-full p-3 rounded-lg text-left transition-all duration-200 group cursor-pointer
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                      }
                      ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`
                            font-medium text-sm truncate mb-1
                            ${isActive ? 'text-white' : 'text-gray-900'}
                          `}
                        >
                          {conversation.title || 'Untitled Conversation'}
                        </h3>
                        <p
                          className={`
                            text-xs
                            ${isActive ? 'text-white/80' : 'text-gray-500'}
                          `}
                        >
                          {formatDate(conversation.updated_at)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(e, conversation.id)}
                        className={`
                          p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                          ${isActive
                            ? 'hover:bg-white/20'
                            : 'hover:bg-red-100'
                          }
                        `}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <motion.div
                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        ) : (
                          <svg
                            className={`w-4 h-4 ${isActive ? 'text-white' : 'text-red-500'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
