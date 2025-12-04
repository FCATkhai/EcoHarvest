from pydantic import BaseModel
from typing import List, Optional, Any

class ChatRequest(BaseModel):
    messages: list[dict]
    session_id: str | None = None  # Optional session ID for context management
    user_id: str | None = None  # Optional user ID for personalization
    
    
class ChatResponse(BaseModel):
    assistant_message: str
    tool_calls: Optional[List[Any]] = None