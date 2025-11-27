# AI Agent with Chat History Context

This FastAPI application provides an AI agent that maintains chat session context by retrieving conversation history from the database.

## Features

- 🤖 AI agent powered by Google Gemini 2.5 Flash Lite
- 💬 Chat session history support
- 🔧 Product search and information tools
- 📦 Database integration for persistent chat history

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Or if using conda:

```bash
conda install asyncpg
pip install fastapi uvicorn python-dotenv langchain langchain-google-genai langchain-core pydantic
```

### 2. Configure Environment

Update `.env` file with your credentials:

```env
GOOGLE_API_KEY=your_google_api_key_here
DATABASE_URL=postgresql://user:password@host:port/database
```

**Important**: Replace the `DATABASE_URL` with your actual PostgreSQL connection string. You can find this in your backend configuration.

### 3. Run the Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Usage

### POST /invoke

Send a message to the AI agent with optional chat session context.

**Request Body:**

```json
{
  "message": "Tôi muốn tìm sản phẩm bí giọt nước",
  "session_id": "uuid-of-existing-session",  // Optional
  "user_id": "user-uuid"  // Optional
}
```

**Response:**

```json
{
  "assistant_message": "AI response here",
  "tool_calls": [...]  // Optional, if tools were used
}
```

### How Chat History Works

1. When `session_id` is provided in the request, the system:
   - Fetches all previous messages from the `chat_messages` table
   - Converts them to LangChain message objects (HumanMessage/AIMessage)
   - Prepends them to the current user message
   - Passes the full context to the agent

2. Without `session_id`:
   - The agent processes the message without prior context
   - Useful for one-off queries

## Database Schema

The agent expects these tables in your PostgreSQL database:

```sql
-- Chat sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10),  -- 'user' or 'bot'
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Integration with Backend

The backend controller (`chat.controller.ts`) should:

1. Save the user's message to `chat_messages` before calling the AI agent
2. Call the AI agent with `session_id`
3. Save the AI's response to `chat_messages` after receiving it

This ensures complete conversation history is stored for future context.

## Testing

Test with curl:

```bash
# Without session context (new conversation)
curl -X POST http://localhost:8000/invoke \
  -H "Content-Type: application/json" \
  -d '{"message": "Xin chào, bạn có thể giúp tôi tìm sản phẩm bí giọt nước không?"}'

# With session context (continuing conversation)
curl -X POST http://localhost:8000/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Giá bao nhiêu?",
    "session_id": "existing-session-uuid-here"
  }'
```

## Notes

- The system uses LangChain's message format internally
- Messages are ordered chronologically (oldest first)
- Database connection pool is created on startup and closed on shutdown
- If DATABASE_URL is not set, the system works but without history context
