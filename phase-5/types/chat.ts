// types/chat.ts
// Phase III: AI Todo Chatbot Types

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: Array<{
    tool: string;
    args: Record<string, any>;
  }> | null;
  tool_results?: Array<{
    tool: string;
    result: any;
  }> | null;
  created_at: string; // ISO 8601 datetime
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string | null;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  messages?: Message[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: number | null;
}

export interface ChatResponse {
  conversation_id: number;
  user_message: Message;
  assistant_message: Message;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}
// Force rebuild
