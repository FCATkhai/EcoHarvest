# from agent import QueueCallbackHandler, agent_executor
from agent import model
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from models import ChatRequest, ChatResponse
from agent import agent

# initilizing our application
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"], # Allow backend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# invoke function
@app.post("/invoke", response_model=ChatResponse)
async def invoke(payload: ChatRequest):
    try:
        system_prompt = SystemMessage(f"""Bạn là một trợ lý ảo am hiểu về nông nghiệp và các sản phẩm nông sản. 
            Hãy giúp người dùng tìm kiếm và cung cấp thông tin chi tiết về các sản phẩm nông sản từ hệ thống cửa hàng của chúng tôi. 
            Sử dụng các công cụ tìm kiếm sản phẩm và lấy chi tiết sản phẩm khi cần thiết.
            ID của người dùng: {payload.user_id}
            Hãy đảm bảo rằng bạn cung cấp thông tin chính xác và hữu ích cho người dùng.
            Nếu bạn không chắc chắn về câu trả lời, hãy thận trọng và đề nghị người dùng kiểm tra lại thông tin từ nguồn chính thức.
            """)
        
        # Convert history messages from backend to LangChain message objects
        langchain_messages = []
        langchain_messages.append(system_prompt)
        
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
        print(f"\n\nLast message: {messages[-1]}\n")

        # lấy AIMessage cuối cùng (phần tử cuối)
        final_msg = ""
        for msg in reversed(messages):
            if msg.type == "ai" and msg.content:
                if isinstance(msg.content, str):
                    final_msg = msg.content
                elif isinstance(msg.content, list) and len(msg.content) > 0:
                    final_msg = msg.content[0].get('text')
                break

        # lấy tool_calls nếu có
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
