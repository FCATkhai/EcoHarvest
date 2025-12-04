import asyncio
import os
from typing import List, Dict, Any

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
        # Convert history messages from backend to LangChain message objects
        langchain_messages = []
        
        if payload.messages:
            for msg in payload.messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                
                if role == "user":
                    langchain_messages.append(HumanMessage(content=content))
                else:  # assistant
                    langchain_messages.append(AIMessage(content=content))
            
            print(f"📜 Loaded {len(langchain_messages)} messages from request")
        
        result = agent.invoke({
            "messages": langchain_messages
        })
        print("raw result:", result)

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
                
        print(final_msg)

        return ChatResponse(
            assistant_message=final_msg,
            tool_calls=tool_calls or None
        )

    except Exception as e:
        print(f"❌ Error in invoke: {str(e)}")
        return ChatResponse(assistant_message=f"AI error: {str(e)}")
