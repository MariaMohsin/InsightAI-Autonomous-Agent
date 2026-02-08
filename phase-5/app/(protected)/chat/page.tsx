// app/(protected)/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ConversationList } from '@/components/chat/ConversationList';
import { motion } from 'framer-motion';
import { Conversation } from '@/types/chat';
import { getConversations, deleteConversation } from '@/lib/chat-api';

export default function ChatPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleConversationCreated = (id: number) => {
    setConversationId(id);
    // Reload conversations to show the new one
    loadConversations();
  };

  const handleSelectConversation = (id: number) => {
    setConversationId(id);
  };

  const handleNewConversation = () => {
    setConversationId(null);
  };

  const handleDeleteConversation = async (id: number) => {
    try {
      await deleteConversation(id);
      // If we deleted the current conversation, reset to new conversation
      if (id === conversationId) {
        setConversationId(null);
      }
      // Reload conversations
      loadConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  return (
    <DashboardLayout userEmail={user?.email} onLogout={logout}>
      {/* Page Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                AI Todo Chat
              </h1>
              <p className="text-gray-600">
                Manage your todos using natural language ✨
              </p>
            </div>
          </div>

          {/* Quick Tips Button */}
          <motion.button
            className="hidden md:flex px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:shadow-md transition-all items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Tips</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content - Two Column Layout */}
      <div className="flex gap-4 h-[calc(100vh-250px)]">
        {/* Conversation List Sidebar */}
        <motion.div
          className={`
            ${showSidebar ? 'w-full md:w-80' : 'w-0'}
            transition-all duration-300 overflow-hidden
          `}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: showSidebar ? 1 : 0, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden">
            <ConversationList
              conversations={conversations}
              currentConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              isLoading={isLoadingConversations}
            />
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChatInterface
            conversationId={conversationId}
            onConversationCreated={handleConversationCreated}
          />
        </motion.div>
      </div>

      {/* Quick Actions Footer */}
      <motion.div
        className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {[
          {
            label: 'Add Task',
            example: 'Add task to buy groceries',
            icon: '➕',
            color: 'from-blue-500 to-cyan-500'
          },
          {
            label: 'List Tasks',
            example: 'Show my pending tasks',
            icon: '📋',
            color: 'from-purple-500 to-pink-500'
          },
          {
            label: 'Update Task',
            example: 'Change priority to high',
            icon: '✏️',
            color: 'from-orange-500 to-red-500'
          },
          {
            label: 'Complete Task',
            example: 'Mark task 5 as done',
            icon: '✅',
            color: 'from-green-500 to-teal-500'
          }
        ].map((action, index) => (
          <motion.div
            key={action.label}
            className="p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ y: -3 }}
          >
            <div
              className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${action.color} text-white mb-2 text-xl`}
            >
              {action.icon}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {action.label}
            </h3>
            <p className="text-xs text-gray-600 italic">"{action.example}"</p>
          </motion.div>
        ))}
      </motion.div>
    </DashboardLayout>
  );
}
