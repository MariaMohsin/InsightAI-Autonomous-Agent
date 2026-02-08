# Data Model: AI Todo Chatbot

**Feature**: 004-ai-todo-chatbot
**Date**: 2026-01-22
**Status**: Complete

This document defines the data entities for the AI Todo Chatbot feature, extending the Phase II schema.

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │ (Phase II - existing)
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ created_at  │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│   Conversation      │ (Phase III - new)
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ title               │
│ created_at          │
│ updated_at          │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│     Message         │ (Phase III - new)
│─────────────────────│
│ id (PK)             │
│ conversation_id (FK)│
│ role                │
│ content             │
│ tool_calls          │
│ tool_results        │
│ created_at          │
└─────────────────────┘

┌─────────────┐
│    Todo     │ (Phase II - existing, referenced by MCP tools)
│─────────────│
│ id (PK)     │
│ user_id (FK)│
│ title       │
│ description │
│ status      │
│ priority    │
│ due_date    │
│ created_at  │
│ updated_at  │
└─────────────┘
```

## Entities

### Conversation (New - Phase III)

Represents a chat session between a user and the AI assistant. Each conversation is owned by a single user and contains an ordered sequence of messages.

**Table Name**: `conversations`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique conversation identifier |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → users.id, ON DELETE CASCADE | Owner of the conversation |
| `title` | VARCHAR(255) | NULLABLE | Auto-generated from first user message (e.g., "Create grocery shopping task") |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When conversation was started |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last message timestamp (updated on new message) |

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_conversations_user_id (user_id)` - For efficient user conversation lookup

**Validation Rules**:
- `user_id` must reference an existing user
- `title` max length 255 characters
- `created_at` cannot be in the future
- `updated_at` must be >= `created_at`

**State Transitions**:
- Created when user sends first message in new conversation
- Updated timestamp changed when new message added
- Deleted when user explicitly deletes conversation (CASCADE deletes all messages)

**Business Rules**:
- One user can have multiple conversations
- Conversations are never shared between users
- Empty conversations (no messages) are allowed temporarily during creation

---

### Message (New - Phase III)

Individual communication units within a conversation. Messages have a role (user or assistant), content (text), and optional metadata about tool invocations.

**Table Name**: `messages`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique message identifier |
| `conversation_id` | INTEGER | NOT NULL, FOREIGN KEY → conversations.id, ON DELETE CASCADE | Parent conversation |
| `role` | VARCHAR(10) | NOT NULL, CHECK (role IN ('user', 'assistant')) | Message sender (user or AI assistant) |
| `content` | TEXT | NOT NULL | Message text content |
| `tool_calls` | JSONB | NULLABLE | Serialized tool invocations made by assistant (e.g., `[{"tool": "add_task", "args": {...}}]`) |
| `tool_results` | JSONB | NULLABLE | Serialized tool execution results (e.g., `[{"tool": "add_task", "result": {...}}]`) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When message was sent/received |

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_messages_conversation_id_created_at (conversation_id, created_at)` - For chronological message retrieval

**Validation Rules**:
- `conversation_id` must reference an existing conversation
- `role` must be exactly 'user' or 'assistant'
- `content` cannot be empty string
- `tool_calls` must be valid JSON array if present
- `tool_results` must be valid JSON array if present
- `created_at` cannot be in the future

**State Transitions**:
- User messages created when user submits chat input
- Assistant messages created after AI agent generates response
- Messages are immutable after creation (no updates, only create/delete)
- Deleted when parent conversation is deleted (CASCADE)

**Business Rules**:
- Messages are ordered by `created_at` within a conversation
- User messages never have `tool_calls` or `tool_results`
- Assistant messages may have `tool_calls` and `tool_results` when agent invokes MCP tools
- Message content is never modified after creation
- Messages cannot be moved between conversations

---

### Todo (Existing - Phase II)

Task items managed through conversation. Referenced by Phase II but now also accessible via Phase III MCP tools.

**Table Name**: `todos`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique todo identifier |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → users.id, ON DELETE CASCADE | Owner of the todo |
| `title` | VARCHAR(255) | NOT NULL | Todo title/summary |
| `description` | TEXT | NULLABLE | Detailed todo description |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'completed', 'deleted')) | Todo completion status |
| `priority` | VARCHAR(10) | NULLABLE, CHECK (priority IN ('low', 'medium', 'high')) | Todo priority level |
| `due_date` | DATE | NULLABLE | When todo is due |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When todo was created |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Indexes**:
- `PRIMARY KEY (id)`
- `INDEX idx_todos_user_id (user_id)` - For efficient user todo lookup
- `INDEX idx_todos_due_date (due_date)` - For due date queries

**Phase III Usage**:
- MCP tools (`add_task`, `list_tasks`, `update_task`, `complete_task`, `delete_task`) perform CRUD operations on this table
- All MCP tool operations MUST filter by `user_id` to enforce user isolation
- Natural language requests are translated to todo operations via AI agent

---

### User (Existing - Phase II)

Authenticated application users who own conversations and todos.

**Table Name**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Indexes**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_users_email (email)` - For login lookup

**Phase III Usage**:
- JWT tokens issued by Better Auth contain `user_id` in `sub` claim
- Chat API extracts `user_id` from JWT to scope conversations and messages
- MCP tools receive `user_id` parameter for todo operations

---

## SQLAlchemy ORM Definitions

**Note**: Phase II uses SQLAlchemy ORM (not SQLModel). Phase III extends `backend/app/models.py` with new models.

```python
"""
SQLAlchemy ORM models for Chat entities (Phase III).
Extends backend/app/models.py which contains User and Todo models from Phase II.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.database import Base


# Phase III Models - Add to backend/app/models.py

class Conversation(Base):
    """
    Conversation model for chat sessions.

    Attributes:
        id: Primary key
        user_id: Foreign key to user who owns this conversation
        title: Auto-generated conversation title
        created_at: Conversation creation timestamp
        updated_at: Last message timestamp (auto-updated via trigger)
        user: Relationship to owner
        messages: Relationship to conversation messages
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """
    Message model for chat messages.

    Attributes:
        id: Primary key
        conversation_id: Foreign key to parent conversation
        role: Message sender ('user' or 'assistant')
        content: Message text content
        tool_calls: JSON serialized tool invocations (for assistant messages)
        tool_results: JSON serialized tool results (for assistant messages)
        created_at: Message creation timestamp
        conversation: Relationship to parent conversation
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(10), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    tool_calls = Column(JSON, nullable=True)  # JSON array of tool invocations
    tool_results = Column(JSON, nullable=True)  # JSON array of tool results
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    # Helper methods
    def get_tool_calls(self):
        """Get tool calls as list of dicts."""
        return self.tool_calls if self.tool_calls else []

    def set_tool_calls(self, calls):
        """Set tool calls from list of dicts."""
        self.tool_calls = calls

    def get_tool_results(self):
        """Get tool results as list of dicts."""
        return self.tool_results if self.tool_results else []

    def set_tool_results(self, results):
        """Set tool results from list of dicts."""
        self.tool_results = results


# Phase II Models - Extend User model with conversations relationship

# Add to existing User class in backend/app/models.py:
# conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
```

**Migration Instructions**:

1. Add `Conversation` and `Message` classes to `backend/app/models.py`
2. Add `conversations` relationship to existing `User` class:
   ```python
   # In User class:
   conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
   ```
3. Apply SQL migration (see Database Migration section below)

---

## Database Migration (Phase III)

**Migration File**: `backend/src/database/migrations/004_add_conversations_messages.py`

```sql
-- Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    tool_results JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id_created_at ON messages(conversation_id, created_at);

-- Trigger to update conversation.updated_at when message is inserted
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();
```

---

## Data Access Patterns

### Create Conversation
```python
async def create_conversation(user_id: str, first_message: str) -> Conversation:
    conversation = Conversation(user_id=user_id, title=first_message[:50] + "...")
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)
    return conversation
```

### Add Message to Conversation
```python
async def add_message(conversation_id: int, role: str, content: str, tool_calls=None, tool_results=None) -> Message:
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tool_calls=json.dumps(tool_calls) if tool_calls else None,
        tool_results=json.dumps(tool_results) if tool_results else None
    )
    session.add(message)
    await session.commit()
    # Trigger automatically updates conversation.updated_at
    return message
```

### Rebuild Conversation Context
```python
async def get_conversation_messages(conversation_id: int, user_id: str, limit: int = 50) -> List[Message]:
    # Verify user owns conversation
    conversation = await session.get(Conversation, conversation_id)
    if conversation.user_id != user_id:
        raise PermissionError("User does not own this conversation")

    # Get last N messages in chronological order
    statement = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).limit(limit)

    messages = await session.exec(statement)
    return messages.all()
```

### List User Conversations
```python
async def list_user_conversations(user_id: str) -> List[Conversation]:
    statement = select(Conversation).where(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc())

    conversations = await session.exec(statement)
    return conversations.all()
```

---

## Summary

Phase III adds two new entities (`Conversation`, `Message`) that extend the Phase II schema. All data operations enforce user isolation through foreign key constraints and query filters. The schema supports stateless context reconstruction, efficient message retrieval, and cascade deletion for data integrity.
