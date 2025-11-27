import asyncio
import os
from typing import List, Dict, Any
import asyncpg
from contextlib import asynccontextmanager

# from agent import QueueCallbackHandler, agent_executor
from agent import model
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage, AIMessage

from models import ChatRequest, ChatResponse
from agent import agent

# initilizing our application
app = FastAPI()

# Database connection pool
db_pool = None

@asynccontextmanager
async def lifespan():
    global db_pool
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        db_pool = await asyncpg.create_pool(database_url)
        print("✅ Database connection pool created")
    else:
        print("⚠️ DATABASE_URL not found, chat history will not be available")
    try:
        yield
    finally:
        if db_pool:
            await db_pool.close()
            print("Database connection pool closed")

async def get_chat_history(session_id: str) -> List[Any]:
    """Fetch chat messages for a given session_id from database and convert to LangChain message objects."""
    if not db_pool:
        return []
    
    try:
        async with db_pool.acquire() as connection:
            rows = await connection.fetch(
                """
                SELECT sender, content, created_at 
                FROM chat_messages 
                WHERE session_id = $1 
                ORDER BY created_at ASC
                """,
                session_id
            )
            
            messages = []
            for row in rows:
                # Convert to LangChain message objects
                if row["sender"] == "user":
                    messages.append(HumanMessage(content=row["content"]))
                else:
                    messages.append(AIMessage(content=row["content"]))
            
            return messages
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return []

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],  
    allow_origins=["*"],  # Allows all origins, for development purposes
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# invoke function
@app.post("/invoke", response_model=ChatResponse)
async def invoke(payload: ChatRequest):
    try:
        # Fetch chat history if session_id is provided
        chat_history = []
        if payload.session_id:
            chat_history = await get_chat_history(payload.session_id)
            print(f"📜 Loaded {len(chat_history)} messages from session: {payload.session_id}")
        
        # Combine chat history with new message
        all_messages = chat_history + [HumanMessage(content=payload.message)]
        
        result = agent.invoke({
            "messages": all_messages
        })

        # result["messages"] là list các HumanMessage/AIMessage/ToolMessage
        messages = result.get("messages", [])

        # lấy AIMessage cuối cùng (phần tử cuối)
        final_msg = ""
        for msg in reversed(messages):
            if msg.type == "ai" and msg.content:
                final_msg = msg.content
                break

        # lấy tool_calls nếu muốn
        tool_calls = []
        for msg in messages:
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                tool_calls.extend(msg.tool_calls)

        return ChatResponse(
            assistant_message=final_msg,
            tool_calls=tool_calls or None
        )

    except Exception as e:
        print(f"❌ Error in invoke: {str(e)}")
        return ChatResponse(assistant_message=f"AI error: {str(e)}")
