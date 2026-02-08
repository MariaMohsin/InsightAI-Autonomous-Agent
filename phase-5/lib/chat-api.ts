/**
 * Chat API Client for AI Todo Chatbot
 * Phase III: AI Todo Chatbot
 *
 * This module provides functions to interact with the chat backend API.
 */

import { ChatRequest, ChatResponse, Conversation, ConversationListResponse } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Use sessionStorage with correct key (matches lib/auth/utils.ts)
  return sessionStorage.getItem('auth_token');
}

/**
 * Send a chat message and get AI response
 *
 * @param message - User's message text
 * @param conversationId - Optional conversation ID (null for new conversation)
 * @returns Promise resolving to chat response with assistant message
 * @throws Error if request fails or user is not authenticated
 */
export async function sendChatMessage(
  message: string,
  conversationId?: number | null
): Promise<ChatResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const requestBody: ChatRequest = {
    message,
    conversation_id: conversationId || null,
  };

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to send message');
  }

  return response.json();
}

/**
 * Get list of user's conversations
 *
 * @returns Promise resolving to list of conversations
 * @throws Error if request fails or user is not authenticated
 */
export async function getConversations(): Promise<ConversationListResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch conversations');
  }

  return response.json();
}

/**
 * Get a specific conversation with all messages
 *
 * @param conversationId - ID of the conversation to fetch
 * @returns Promise resolving to conversation with messages
 * @throws Error if request fails or user is not authenticated
 */
export async function getConversation(conversationId: number): Promise<Conversation> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch conversation');
  }

  return response.json();
}

/**
 * Delete a conversation
 *
 * @param conversationId - ID of the conversation to delete
 * @returns Promise resolving when deletion is complete
 * @throws Error if request fails or user is not authenticated
 */
export async function deleteConversation(conversationId: number): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete conversation');
  }
}

/**
 * Check if chat feature is enabled
 *
 * @returns boolean indicating if chat is enabled in environment config
 */
export function isChatEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CHAT_ENABLED === 'true';
}
